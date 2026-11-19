import { store } from '../store/index.js';
import { publishSync } from '../services/pinService.js';

const EVENT_TYPES = ['open_user', 'open_master', 'failed', 'door_closed', 'package_in'];
const EVENT_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
const HASH_RE = /^[a-f0-9]{64}$/;

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export async function handleBoxMessage(boxId, kind, data) {
  if (kind === 'status') return onStatus(boxId, data);
  if (kind === 'event') return onEvent(boxId, data);
}

async function onStatus(boxId, data) {
  const state = typeof data === 'string' ? data : data?.state;
  if (state !== 'online' && state !== 'offline') return;

  await store.setBoxStatus(boxId, state === 'online');
  console.log(`[box ${boxId}] ${state}`);
  if (state === 'online') await publishSync(boxId);
}

async function onEvent(boxId, data) {
  if (!data || typeof data !== 'object') return;
  if (!EVENT_TYPES.includes(data.type) || !EVENT_ID_RE.test(String(data.eventId ?? ''))) return;

  const now = Date.now();
  // Kotak tanpa jam valid mengirim `at: null`; saat itu pakai waktu terima server.
  const at = num(data.at) ?? now;
  const pinHash = HASH_RE.test(String(data.pinHash ?? '')) ? data.pinHash : null;

  // Pemilik PIN ditentukan dari catatan server, bukan dari klaim kotak.
  let userId = null;
  if (data.type === 'open_user' && pinHash) {
    const pin = await store.markPinUsed(pinHash, boxId);
    userId = pin?.userId ?? null;
  }

  const created = await store.addAccessLog({
    id: data.eventId,
    boxId,
    userId,
    type: data.type,
    at,
    syncedAt: now,
    distanceBefore: num(data.distanceBefore),
    distanceAfter: num(data.distanceAfter),
  });
  if (!created) return; // duplikat (QoS 1 / antrean offline dikirim ulang)

  switch (data.type) {
    case 'open_user':
      return onUserOpen(boxId, userId, at);
    case 'open_master':
      return notifyAdmins('PIN master digunakan', `Kotak ${boxId} dibuka dengan PIN master.`);
    case 'package_in':
      return onPackageIn(boxId);
    default:
  }
}

async function onUserOpen(boxId, userId, at) {
  if (!userId) return;
  const opener = await store.getResident(userId);
  const label = opener?.label ?? 'penghuni';

  await store.markPickedForUser(userId, at, boxId);

  // Penghuni lain yang masih punya paket di dalam diberi tahu siapa yang membuka kotak.
  const owners = await store.pendingOwners(boxId, userId);
  await Promise.all(
    owners.map((owner) =>
      store.notify(owner, { title: 'Kotak paket dibuka', body: `Kotak dibuka oleh ${label}.`, data: { boxId } }),
    ),
  );
}

async function onPackageIn(boxId) {
  const { pkg, matched } = await store.markNextWaitingStored(boxId);
  if (matched) {
    const owner = await store.getResident(pkg.residentId);
    if (owner) {
      await store.notify(owner, { title: 'Paket sudah di kotak', body: 'Paket Anda sudah masuk ke kotak.', data: { packageId: pkg.id } });
    }
    return;
  }
  // Paket masuk tanpa input kurir: penerimanya tidak diketahui, jadi admin yang diberi tahu.
  await notifyAdmins('Paket masuk tanpa data', `Ada paket masuk ke kotak ${boxId} tanpa input kurir.`);
}

async function notifyAdmins(title, body) {
  const admins = await store.listAdmins();
  await Promise.all(admins.map((admin) => store.notify(admin, { title, body })));
}
