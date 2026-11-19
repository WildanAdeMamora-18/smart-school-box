# API server

Base URL: `http://localhost:3000/api` (dev). Semua respons JSON; galat berbentuk `{ "error": "pesan" }`.

## Publik (web kurir), dengan rate limit
| Endpoint | Fungsi |
|---|---|
| `GET /health` | status server dan mode (`demo` / `firebase`) |
| `GET /meta` | `{boxId, couriers[]}` |
| `GET /residents` | `[{id, label}]` untuk dropdown |
| `POST /packages` | multipart: `residentId`, `courier` (wajib), `trackingNumber`, `boxId`, `photo` (jpg/png/webp ≤ 3 MB). 201 → ringkasan paket |

## Penghuni (aplikasi Flutter)
Header: `Authorization: Bearer <Firebase ID token>` (mode demo: `demo:<id penghuni>`).

| Endpoint | Fungsi |
|---|---|
| `POST /pins/redeem` | buat PIN 6 digit, berlaku 30 menit, sekali pakai → `{pin, expiresAt, expiresInSec}`. Maks 6 kali per jam. PIN lama penghuni otomatis dicabut |

## Admin
| Endpoint | Fungsi |
|---|---|
| `POST /admin/master-pin` | body `{ "pin": "12345678" }` (8 digit) atau `{}` untuk PIN acak yang dikembalikan sekali → `{pin}` / `{ok:true}`. Maks 5 kali per jam |

Penghuni membaca paket dan log akses langsung dari Firestore (lihat `firestore-schema.md`); notifikasi lewat FCM.
