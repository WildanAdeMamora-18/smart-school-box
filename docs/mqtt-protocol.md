# Protokol MQTT kotak ↔ server

Semua pesan JSON, QoS 1. Topik: `<MQTT_PREFIX>/<boxId>/<suffix>` (contoh: `kelompok7/parcelbox/box1/pin/add`).
Hash PIN: `HMAC-SHA256(PIN_HMAC_SECRET, pin)` dalam hex huruf kecil (64 karakter). Rahasia yang sama dipasang di firmware.

Kotak sebaiknya memakai `clean session = false` dengan clientId tetap agar pesan QoS 1 yang terlewat saat offline tetap diterima.

## Server → kotak
| Topik | Isi | Tindakan kotak |
|---|---|---|
| `pin/add` | `{hash, userId, expiresAt, ttlSec, serverTime}` | simpan ke daftar PIN. `expiresAt` = epoch ms. Jika jam belum valid, pakai `ttlSec` dari saat pesan diterima |
| `pin/revoke` | `{hash}` | hapus dari daftar |
| `master/set` | `{hash, serverTime}` | ganti hash PIN master (tanpa kadaluarsa) |
| `sync` | `{serverTime, pins:[{hash,userId,expiresAt}], masterHash}` | **ganti seluruh daftar** dengan isi pesan. Dikirim server setiap kotak berstatus `online` |

`serverTime` boleh dipakai untuk mengatur jam saat NTP belum tersedia.

## Kotak → server
| Topik | Isi |
|---|---|
| `status` | teks `online` / `offline` (retained). Daftarkan *last will* `offline`. Publikasi `online` setiap tersambung, karena itu memicu `sync` |
| `event` | `{eventId, type, at, pinHash?, distanceBefore?, distanceAfter?}` |

`type`: `open_user` (sertakan `pinHash`), `open_master`, `failed`, `door_closed`, `package_in`.
- `eventId`: string unik 8–64 karakter `[A-Za-z0-9_-]`. Server menolak duplikat, jadi aman dikirim ulang dari antrean offline.
- `at`: epoch ms, atau `null` bila jam belum valid (server memakai waktu terima).
- Pemilik PIN ditentukan server dari `pinHash`, bukan dari klaim kotak.

## Aturan verifikasi di kotak (lokal)
1. Hitung hash dari angka yang diketik, cari di daftar PIN. Tolak jika tidak ada atau `expiresAt` sudah lewat.
2. PIN penghuni **sekali pakai**: hapus dari daftar setelah dipakai. PIN master tetap berlaku.
3. Jam belum valid setelah reboot tanpa internet: tolak semua PIN penghuni, terima hanya PIN master.
4. Lockout setelah beberapa kali PIN salah dilakukan di kotak. Setiap kegagalan dikirim sebagai `failed`.
5. Event yang gagal terkirim disimpan di antrean (flash) dan dikirim saat tersambung.

## Simulator dan broker lokal
`npm run dev:broker` (broker tanpa akun), `npm run dev:box` (simulator kotak).
