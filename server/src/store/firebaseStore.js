// Penyimpanan produksi: Firestore + Cloud Storage + FCM lewat Firebase Admin SDK.
import admin from 'firebase-admin';
import { config } from '../config.js';
import { HttpError } from '../errors.js';

const WAITING_WINDOW_MS = 2 * 60 * 60 * 1000;
let db;
let bucket;
let messaging;

function init() {
  if (db) return;
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // membaca GOOGLE_APPLICATION_CREDENTIALS
    storageBucket: config.storageBucket,
  });
  db = admin.firestore();
  bucket = admin.storage().bucket();
  messaging = admin.messaging();
}

const Timestamp = () => admin.firestore.Timestamp;
const label = (doc) => doc.get('label') || doc.get('name') || doc.id;
const asUser = (doc) => ({ id: doc.id, label: label(doc), fcmTokens: doc.get('fcmTokens') || [] });

export const firebaseStore = {
  mode: 'firebase',

  async verifyToken(token) {
    init();
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch {
      throw new HttpError(401, 'Token tidak valid atau kedaluwarsa.');
    }
    const doc = await db.collection('users').doc(decoded.uid).get();
    if (!doc.exists || doc.get('active') === false) throw new HttpError(403, 'Akun tidak aktif.');
    return { uid: decoded.uid, role: doc.get('role'), label: label(doc) };
  },

  async listResidents() {
    init();
    const snap = await db.collection('users').where('role', '==', 'resident').where('active', '==', true).get();
    return snap.docs
      .map((d) => ({ id: d.id, label: label(d) }))
      .sort((a, b) => a.label.localeCompare(b.label, 'id'));
  },

  async getResident(id) {
    init();
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists || doc.get('role') !== 'resident' || doc.get('active') === false) return null;
    return asUser(doc);
  },

  async listAdmins() {
    init();
    const snap = await db.collection('users').where('role', '==', 'admin').get();
    return snap.docs.map(asUser);
  },

  async createPackage({ residentId, courier, trackingNumber, boxId, photo }) {
    init();
    if (trackingNumber) {
      const dup = await db.collection('packages').where('trackingNumber', '==', trackingNumber).limit(1).get();
      if (!dup.empty) throw new HttpError(409, 'Nomor resi sudah terdaftar.');
    }

    const ref = db.collection('packages').doc();
    let photoPath = null;
    if (photo) {
      photoPath = `packages/${ref.id}/photo.${photo.ext}`;
      await bucket.file(photoPath).save(photo.buffer, { contentType: photo.mime, resumable: false });
    }

    const data = {
      residentId,
      courier,
      trackingNumber,
      photoPath,
      boxId,
      status: 'waiting',
      source: 'courier',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await ref.set(data);
    return { id: ref.id, ...data, createdAt: new Date().toISOString() };
  },

  // Paket "waiting" tertua (maks. 2 jam) dianggap sudah masuk; kalau tidak ada, dibuat catatan dari sensor.
  async markNextWaitingStored(boxId) {
    init();
    const cutoff = Timestamp().fromMillis(Date.now() - WAITING_WINDOW_MS);
    const snap = await db.collection('packages')
      .where('boxId', '==', boxId)
      .where('status', '==', 'waiting')
      .where('createdAt', '>=', cutoff)
      .orderBy('createdAt', 'asc')
      .limit(1)
      .get();

    if (!snap.empty) {
      const doc = snap.docs[0];
      await doc.ref.update({ status: 'stored', storedAt: admin.firestore.FieldValue.serverTimestamp() });
      return { pkg: { id: doc.id, residentId: doc.get('residentId') }, matched: true };
    }
    const ref = db.collection('packages').doc();
    await ref.set({
      residentId: null, courier: null, trackingNumber: null, photoPath: null, boxId,
      status: 'stored', source: 'sensor',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      storedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { pkg: { id: ref.id, residentId: null }, matched: false };
  },

  async markPickedForUser(userId, at) {
    init();
    const snap = await db.collection('packages').where('residentId', '==', userId).where('status', '==', 'stored').get();
    if (snap.empty) return 0;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { status: 'picked', pickedAt: Timestamp().fromMillis(at), pickedBy: userId }));
    await batch.commit();
    return snap.size;
  },

  async pendingOwners(boxId, excludeId) {
    init();
    const snap = await db.collection('packages').where('boxId', '==', boxId).where('status', '==', 'stored').get();
    const ids = [...new Set(snap.docs.map((d) => d.get('residentId')).filter((id) => id && id !== excludeId))];
    const docs = await Promise.all(ids.map((id) => db.collection('users').doc(id).get()));
    return docs.filter((d) => d.exists).map(asUser);
  },

  async listActivePins(boxId) {
    init();
    const now = Date.now();
    const snap = await db.collection('pins').where('boxId', '==', boxId).where('active', '==', true).get();
    return snap.docs
      .map((d) => d.data())
      .filter((p) => p.expiresAt === null || p.expiresAt > now);
  },

  async savePin(pin) {
    init();
    await db.collection('pins').add({ ...pin, active: true, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  },

  async _revoke(field, value, type, boxId) {
    init();
    const snap = await db.collection('pins')
      .where(field, '==', value).where('type', '==', type).where('boxId', '==', boxId).where('active', '==', true).get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { active: false, revokedAt: admin.firestore.FieldValue.serverTimestamp() }));
    await batch.commit();
    return snap.docs.map((d) => d.get('hash'));
  },

  revokeUserPins(userId, boxId) {
    return this._revoke('userId', userId, 'user', boxId);
  },

  revokeMasterPins(boxId) {
    return this._revoke('userId', null, 'master', boxId);
  },

  // PIN penghuni sekali pakai; PIN master tetap aktif sampai diganti.
  async markPinUsed(hash, boxId) {
    init();
    const snap = await db.collection('pins')
      .where('hash', '==', hash).where('boxId', '==', boxId).where('active', '==', true).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    const pin = doc.data();
    if (pin.expiresAt !== null && pin.expiresAt <= Date.now()) return null;
    if (pin.type === 'user') await doc.ref.update({ active: false, usedAt: admin.firestore.FieldValue.serverTimestamp() });
    return pin;
  },

  async addAccessLog(log) {
    init();
    const { id, at, syncedAt, ...rest } = log;
    try {
      await db.collection('accessLogs').doc(id).create({
        ...rest,
        at: Timestamp().fromMillis(at),
        syncedAt: Timestamp().fromMillis(syncedAt),
      });
      return true;
    } catch (err) {
      if (err.code === 6) return false; // ALREADY_EXISTS: event yang sama sudah tercatat
      throw err;
    }
  },

  async setBoxStatus(boxId, online) {
    init();
    await db.collection('boxes').doc(boxId).set(
      { online, lastSeen: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true },
    );
  },

  async notify(target, { title, body, data }) {
    init();
    const tokens = target.fcmTokens ?? [];
    if (!tokens.length) return;
    await messaging.sendEachForMulticast({ tokens, notification: { title, body }, data });
  },
};
