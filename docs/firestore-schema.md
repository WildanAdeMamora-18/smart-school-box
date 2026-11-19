# Skema Firestore

Region: `asia-southeast2` (Jakarta). Semua penulisan dilakukan server (Admin SDK);
klien Flutter hanya membaca sesuai `firestore.rules`.

## `users/{uid}`  (uid = Firebase Auth UID)
| Field | Tipe | Keterangan |
|---|---|---|
| `name` | string | nama lengkap |
| `label` | string | label tampil di dropdown kurir (mis. "Kamar 12" / inisial) |
| `room` | string | nomor kamar |
| `role` | string | `resident` \| `admin` |
| `active` | bool | penghuni aktif |
| `fcmTokens` | array<string> | token notifikasi (boleh diperbarui klien) |

## `packages/{id}`
| Field | Tipe | Keterangan |
|---|---|---|
| `residentId` | string | uid penerima |
| `courier` | string | ekspedisi (wajib) |
| `trackingNumber` | string? | resi (opsional) |
| `photoPath` | string? | path di Storage; URL diberikan server |
| `status` | string | `waiting` (input kurir, belum terdeteksi sensor) \| `stored` (di dalam kotak) \| `picked` |
| `source` | string | `courier` \| `sensor` (tanpa data kurir) |
| `boxId` | string | |
| `createdAt` | timestamp | |
| `storedAt` | timestamp? | saat sensor mendeteksi paket masuk |
| `pickedAt` | timestamp? | |
| `pickedBy` | string? | uid pembuka |

## `pins/{id}`  (server saja)
`userId`, `type` (`user` \| `master`), `hash` (HMAC), `expiresAt`, `usedAt?`, `boxId`, `createdAt`.
PIN asli tidak pernah disimpan.

## `boxes/{boxId}`
`online` (bool), `lastSeen` (timestamp).

## `accessLogs/{id}`
| Field | Tipe | Keterangan |
|---|---|---|
| `boxId` | string | |
| `userId` | string? | pemilik PIN; kosong untuk percobaan gagal |
| `type` | string | `open_user` \| `open_master` \| `failed` \| `door_closed` \| `package_in` |
| `at` | timestamp | waktu kejadian di kotak |
| `syncedAt` | timestamp | waktu diterima server (log offline tertunda) |
| `distanceBefore` / `distanceAfter` | number? | bacaan HC-SR04 (cm) |

## Catatan implementasi (fase 4)
- `pins`: `hash`, `userId` (null untuk master), `type`, `boxId`, `expiresAt` (epoch ms atau null), `active` (bool), `usedAt?`, `revokedAt?`, `createdAt`.
- `accessLogs/{eventId}`: id dokumen = `eventId` dari kotak (menjamin tidak ada log ganda); `at` dan `syncedAt` bertipe timestamp.
- `packages`: `status` bergerak `waiting` → `stored` (sensor mendeteksi paket masuk) → `picked`. Paket yang masuk tanpa input kurir dibuat server dengan `source: "sensor"` dan `residentId: null`. Paket `waiting` hanya dicocokkan dengan sensor dalam 2 jam.
