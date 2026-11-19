import crypto from 'node:crypto';
import { db } from '../db/database.js';
import { config } from '../config.js';

const MASA_BERLAKU_MS = 5 * 60 * 1000;
const hmac = (kode) =>
  crypto.createHmac('sha256', config.jwtSecret).update(String(kode)).digest('hex');

// Dipanggil saat penghuni menekan "Minta kode"
export function buatOtp(penghuniId) {
  // hanguskan kode lama milik penghuni ini
  db.prepare('UPDATE otp SET terpakai = 1 WHERE penghuni_id = ? AND terpakai = 0').run(penghuniId);

  let kode, h;
  do { // pastikan tidak ada dua OTP aktif dengan kode sama
    kode = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    h = hmac(kode);
  } while (db.prepare('SELECT 1 FROM otp WHERE kode_hmac=? AND terpakai=0 AND kedaluwarsa>?')
             .get(h, Date.now()));

  const kedaluwarsa = Date.now() + MASA_BERLAKU_MS;
  db.prepare('INSERT INTO otp (penghuni_id, kode_hmac, kedaluwarsa) VALUES (?,?,?)')
    .run(penghuniId, h, kedaluwarsa);
  return { kode, kedaluwarsa };
}

// Dipanggil saat kode diketik di keypad. Mengembalikan penghuni, atau null.
export function pakaiOtp(kode) {
  const row = db.prepare(
    'SELECT * FROM otp WHERE kode_hmac=? AND terpakai=0 AND kedaluwarsa>?'
  ).get(hmac(kode), Date.now());
  if (!row) return null;
  db.prepare('UPDATE otp SET terpakai = 1 WHERE id = ?').run(row.id);   // sekali pakai
  return db.prepare('SELECT * FROM penghuni WHERE id=? AND aktif=1').get(row.penghuni_id) || null;
}