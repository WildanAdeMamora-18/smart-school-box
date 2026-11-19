import crypto from 'node:crypto';
import { config } from '../config.js';
import { HttpError } from '../errors.js';
import { store } from '../store/index.js';
import { mqtt } from '../mqtt/client.js';

// Nilai ini juga dihitung oleh firmware ESP32 dari angka yang diketik di keypad.
export const hashPin = (pin) =>
  crypto.createHmac('sha256', config.pinSecret).update(String(pin)).digest('hex');

const randomDigits = (length) =>
  String(crypto.randomInt(0, 10 ** length)).padStart(length, '0');

// Penghuni meminta PIN: 6 digit, berlaku 30 menit, sekali pakai, satu PIN aktif per penghuni.
export async function redeemPin(userId, boxId) {
  const active = new Set((await store.listActivePins(boxId)).map((p) => p.hash));

  let pin;
  let hash;
  do {
    pin = randomDigits(6);
    hash = hashPin(pin);
  } while (active.has(hash)); // tidak boleh ada dua PIN aktif yang sama

  const revoked = await store.revokeUserPins(userId, boxId);
  const now = Date.now();
  const expiresAt = now + config.pinTtlMs;
  await store.savePin({ hash, userId, type: 'user', boxId, expiresAt });

  for (const old of revoked) mqtt.publish(boxId, 'pin/revoke', { hash: old });
  mqtt.publish(boxId, 'pin/add', {
    hash,
    userId,
    expiresAt,
    ttlSec: config.pinTtlMs / 1000, // untuk kotak yang belum punya jam valid
    serverTime: now,
  });

  return { pin, expiresAt };
}

// Admin mengatur PIN master (8 digit, tanpa kadaluarsa). Kosongkan `pin` untuk dibuat acak.
export async function setMasterPin(boxId, pin) {
  const length = config.masterPinLength;
  if (pin !== undefined && !new RegExp(`^\\d{${length}}$`).test(String(pin))) {
    throw new HttpError(400, `PIN master harus ${length} digit angka.`);
  }
  const generated = pin === undefined;
  const value = generated ? randomDigits(length) : String(pin);
  const hash = hashPin(value);

  const revoked = await store.revokeMasterPins(boxId);
  await store.savePin({ hash, userId: null, type: 'master', boxId, expiresAt: null });
  for (const old of revoked) mqtt.publish(boxId, 'pin/revoke', { hash: old });
  mqtt.publish(boxId, 'master/set', { hash, serverTime: Date.now() });

  return generated ? { pin: value } : { ok: true };
}

// Dikirim saat kotak online agar daftar PIN-nya selalu sama dengan server.
export async function publishSync(boxId) {
  const now = Date.now();
  const all = await store.listActivePins(boxId);
  mqtt.publish(boxId, 'sync', {
    serverTime: now,
    pins: all
      .filter((p) => p.type === 'user')
      .map(({ hash, userId, expiresAt }) => ({ hash, userId, expiresAt })),
    masterHash: all.find((p) => p.type === 'master')?.hash ?? null,
  });
}
