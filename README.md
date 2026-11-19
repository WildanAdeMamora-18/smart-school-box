# Smart Parcel Box

Kotak paket pintar untuk kos: kurir memasukkan paket lewat lubang khusus dan mencatatnya
di web; penghuni mengambil paket dengan PIN sekali pakai yang diperoleh lewat aplikasi Flutter.

## Struktur

| Folder | Isi |
|---|---|
| `/` (root) | Web kurir — Vue 3 + Vite + Tailwind |
| `server/` | Backend Express (rate limit, PIN, MQTT, Firebase Admin) |
| `firmware/` | Kode ESP32 (menyusul) |
| `docs/` | Kontrak data/API untuk aplikasi Flutter (menyusul) |

## Menjalankan web

```bash
cp .env.example .env   # isi konfigurasi web Firebase
npm install
npm run dev
```

## Menjalankan server

```bash
cd server
cp .env.example .env   # isi rahasia; file ini tidak boleh di-commit
npm install
```

Jangan pernah meng-commit `.env`, service account Firebase, atau kredensial MQTT.
