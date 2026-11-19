// Penyimpanan demo di memori: dipakai saat service account Firebase belum tersedia.
// Data hilang saat server dimulai ulang.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HttpError } from '../errors.js';

export const uploadsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

const residents = [
  { id: 'demo-001', label: 'Rina A. · Kamar 01' },
  { id: 'demo-002', label: 'Dimas P. · Kamar 02' },
  { id: 'demo-003', label: 'Salsa N. · Kamar 03' },
  { id: 'demo-004', label: 'Bagas R. · Kamar 04' },
  { id: 'demo-005', label: 'Nadia F. · Kamar 05' },
  { id: 'demo-006', label: 'Fikri H. · Kamar 06' },
];
const admins = [{ id: 'demo-admin', label: 'Admin' }];
const WAITING_WINDOW_MS = 2 * 60 * 60 * 1000;

const packages = [];
const pins = [];
const logs = new Map();
const boxes = new Map();

const isLive = (pin, now = Date.now()) => pin.active && (pin.expiresAt === null || pin.expiresAt > now);

export const memoryStore = {
  mode: 'demo (memori)',

  // Token demo: "demo:<id>" (mis. demo:demo-001 atau demo:demo-admin).
  async verifyToken(token) {
    const id = token.startsWith('demo:') ? token.slice(5) : '';
    const resident = residents.find((r) => r.id === id);
    if (resident) return { uid: id, role: 'resident', label: resident.label };
    if (admins.some((a) => a.id === id)) return { uid: id, role: 'admin', label: 'Admin' };
    throw new HttpError(401, 'Token tidak valid.');
  },

  async listResidents() {
    return residents;
  },

  async getResident(id) {
    return residents.find((r) => r.id === id) ?? null;
  },

  async listAdmins() {
    return admins;
  },

  async createPackage({ residentId, courier, trackingNumber, boxId, photo }) {
    if (trackingNumber && packages.some((p) => p.trackingNumber === trackingNumber)) {
      throw new HttpError(409, 'Nomor resi sudah terdaftar.');
    }

    const id = crypto.randomUUID();
    let photoUrl = null;
    if (photo) {
      await fs.mkdir(uploadsDir, { recursive: true });
      const file = `${id}.${photo.ext}`;
      await fs.writeFile(path.join(uploadsDir, file), photo.buffer);
      photoUrl = `/uploads/${file}`;
    }

    const pkg = {
      id,
      residentId,
      courier,
      trackingNumber,
      photoUrl,
      boxId,
      status: 'waiting',
      source: 'courier',
      createdAt: new Date().toISOString(),
    };
    packages.push(pkg);
    return pkg;
  },

  // Paket "waiting" tertua (maks. 2 jam) dianggap sudah masuk; kalau tidak ada, dibuat catatan dari sensor.
  async markNextWaitingStored(boxId) {
    const cutoff = Date.now() - WAITING_WINDOW_MS;
    const next = packages
      .filter((p) => p.boxId === boxId && p.status === 'waiting' && Date.parse(p.createdAt) >= cutoff)
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))[0];

    if (next) {
      next.status = 'stored';
      next.storedAt = new Date().toISOString();
      return { pkg: next, matched: true };
    }
    const pkg = {
      id: crypto.randomUUID(), residentId: null, courier: null, trackingNumber: null, photoUrl: null,
      boxId, status: 'stored', source: 'sensor', createdAt: new Date().toISOString(), storedAt: new Date().toISOString(),
    };
    packages.push(pkg);
    return { pkg, matched: false };
  },

  async markPickedForUser(userId, at) {
    let count = 0;
    for (const p of packages) {
      if (p.residentId === userId && p.status === 'stored') {
        Object.assign(p, { status: 'picked', pickedAt: new Date(at).toISOString(), pickedBy: userId });
        count += 1;
      }
    }
    return count;
  },

  async pendingOwners(boxId, excludeId) {
    const ids = new Set(
      packages.filter((p) => p.boxId === boxId && p.status === 'stored' && p.residentId && p.residentId !== excludeId)
        .map((p) => p.residentId),
    );
    return residents.filter((r) => ids.has(r.id));
  },

  async listActivePins(boxId) {
    return pins.filter((p) => p.boxId === boxId && isLive(p)).map((p) => ({ ...p }));
  },

  async savePin(pin) {
    pins.push({ ...pin, active: true, createdAt: Date.now() });
  },

  async revokeUserPins(userId, boxId) {
    const revoked = pins.filter((p) => p.type === 'user' && p.userId === userId && p.boxId === boxId && p.active);
    revoked.forEach((p) => { p.active = false; });
    return revoked.map((p) => p.hash);
  },

  async revokeMasterPins(boxId) {
    const revoked = pins.filter((p) => p.type === 'master' && p.boxId === boxId && p.active);
    revoked.forEach((p) => { p.active = false; });
    return revoked.map((p) => p.hash);
  },

  // PIN penghuni sekali pakai; PIN master tetap aktif sampai diganti.
  async markPinUsed(hash, boxId) {
    const pin = pins.find((p) => p.hash === hash && p.boxId === boxId && isLive(p));
    if (!pin) return null;
    if (pin.type === 'user') {
      pin.active = false;
      pin.usedAt = Date.now();
    }
    return { ...pin };
  },

  async addAccessLog(log) {
    if (logs.has(log.id)) return false;
    logs.set(log.id, log);
    console.log(`[log] ${log.type}${log.userId ? ` oleh ${log.userId}` : ''}`);
    return true;
  },

  async setBoxStatus(boxId, online) {
    boxes.set(boxId, { online, lastSeen: Date.now() });
  },

  async notify(target, { title, body }) {
    console.log(`[notif demo] ${target.label}: ${title} — ${body}`);
  },
};
