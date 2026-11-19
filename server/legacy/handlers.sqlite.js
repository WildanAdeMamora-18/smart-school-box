import { db } from '../db/database.js';
import { pakaiOtp } from '../services/otpService.js';
import { kirimPerintah, setStatus } from './client.js';

let gagalBeruntun = 0;
let kunciSampai = 0;

export function handleMessage(suffix, data) {
  switch (suffix) {
    case '/pin/attempt': return onKode(data);
    case '/event':       return onEvent(data);
    case '/status':      return setStatus(data);
  }
}

function onKode({ pin }) {
  if (Date.now() < kunciSampai) return kirimPerintah('deny', { reason: 'terkunci' });

  const p = pakaiOtp(String(pin));
  if (!p) {
    if (++gagalBeruntun >= 5) { kunciSampai = Date.now() + 60_000; gagalBeruntun = 0; }
    db.prepare(`INSERT INTO riwayat_akses (penghuni_id, metode, hasil, keterangan)
                VALUES (NULL, 'keypad', 'gagal', 'kode_salah_atau_kedaluwarsa')`).run();
    return kirimPerintah('deny', { reason: 'kode_salah' });
  }

  gagalBeruntun = 0;
  db.prepare(`INSERT INTO riwayat_akses (penghuni_id, metode, hasil)
              VALUES (?, 'keypad', 'berhasil')`).run(p.id);
  // paket milik penghuni ini yang ada di dalam dianggap diambil
  db.prepare(`UPDATE paket SET status='diambil', waktu_diambil=datetime('now','localtime')
              WHERE penerima_id=? AND status='di_dalam'`).run(p.id);
  kirimPerintah('open', { nama: p.nama });
}

function onEvent({ type }) {
  db.prepare('INSERT INTO kejadian (tipe) VALUES (?)').run(type);

  if (type === 'package_in') {
    // paket "menunggu" tertua diubah jadi "di_dalam"
    const info = db.prepare(`UPDATE paket SET status='di_dalam', waktu_masuk=datetime('now','localtime')
      WHERE id = (SELECT id FROM paket WHERE status='menunggu' ORDER BY waktu_dibuat LIMIT 1)`).run();
    if (info.changes === 0) {
      // kurir belum/tidak input: cukup dicatat sebagai kejadian
      db.prepare("INSERT INTO kejadian (tipe) VALUES ('package_in_tanpa_data')").run();
    }
  }
}