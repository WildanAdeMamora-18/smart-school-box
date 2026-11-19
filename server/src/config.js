import 'dotenv/config';
import fs from 'node:fs';

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const useFirebase = Boolean(credPath && fs.existsSync(credPath));

// Rahasia HMAC untuk hash PIN. Nilai yang sama harus ada di firmware ESP32.
let pinSecret = process.env.PIN_HMAC_SECRET;
if (!pinSecret) {
  if (useFirebase) {
    console.error('PIN_HMAC_SECRET wajib diisi saat mode Firebase aktif.');
    process.exit(1);
  }
  pinSecret = 'dev-only-insecure-secret';
  console.warn('[config] PIN_HMAC_SECRET kosong — memakai rahasia demo (tidak aman).');
}

// URL placeholder (mis. "xxxx.s1.eu.hivemq.cloud") dianggap belum dikonfigurasi.
const mqttUrl = process.env.MQTT_URL;
const mqttConfigured = Boolean(mqttUrl) && !/xxxx/i.test(mqttUrl);

export const config = {
  port: Number(process.env.PORT) || 3000,
  boxId: process.env.BOX_ID || 'BOX01',
  webOrigin: process.env.WEB_ORIGIN || 'http://localhost:5173',
  // Isi sesuai jumlah proxy di depan server (mis. 1 di Render/Railway)
  trustProxy: process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : false,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'smart-parcel-box-c8ef0.firebasestorage.app',
  // Mode Firebase aktif otomatis kalau service account tersedia; selain itu mode demo (memori).
  useFirebase,
  pinSecret,
  pinTtlMs: 30 * 60 * 1000,
  masterPinLength: 8,
  mqtt: {
    url: mqttConfigured ? mqttUrl : null,
    username: process.env.MQTT_USER || undefined,
    password: process.env.MQTT_PASS || undefined,
    prefix: (process.env.MQTT_PREFIX || 'parcelbox').replace(/\/+$/, ''),
    clientId: process.env.MQTT_CLIENT_ID || 'parcelbox-server',
  },
};

export const COURIERS = [
  'JNE', 'J&T', 'SiCepat', 'AnterAja', 'Shopee Express', 'Ninja Xpress',
  'Pos Indonesia', 'Lion Parcel', 'Gojek/Grab', 'Lainnya',
];
