// Simulator kotak (pengganti ESP32) untuk menguji server tanpa hardware.
// Menerapkan logika yang sama dengan firmware: daftar PIN lokal, verifikasi lokal, antrean log.
// Perintah: pin <6 digit> | master <8 digit> | paket | tutup | status | keluar
import crypto from 'node:crypto';
import readline from 'node:readline';
import mqttLib from 'mqtt';
import 'dotenv/config';

const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
const prefix = (process.env.MQTT_PREFIX || 'parcelbox').replace(/\/+$/, '');
const boxId = process.env.BOX_ID || 'BOX01';
const secret = process.env.PIN_HMAC_SECRET || 'dev-only-insecure-secret';
const base = `${prefix}/${boxId}`;

const hash = (pin) => crypto.createHmac('sha256', secret).update(pin).digest('hex');
const id = () => crypto.randomBytes(8).toString('hex');

let pins = new Map(); // hash -> { userId, expiresAt }
let masterHash = null;
let online = false;
const queue = []; // antrean log saat offline

const client = mqttLib.connect(url, {
  clientId: `fakebox-${boxId}`,
  clean: false,
  will: { topic: `${base}/status`, payload: 'offline', qos: 1, retain: true },
});

function send(event) {
  const msg = { eventId: id(), at: Date.now(), ...event };
  if (online) client.publish(`${base}/event`, JSON.stringify(msg), { qos: 1 });
  else queue.push(msg);
  console.log(`  -> event ${msg.type}${online ? '' : ' (antre, offline)'}`);
}

client.on('connect', () => {
  online = true;
  console.log(`[kotak ${boxId}] tersambung ke ${url}`);
  client.subscribe(`${base}/#`, { qos: 1 });
  client.publish(`${base}/status`, 'online', { qos: 1, retain: true });
  while (queue.length) client.publish(`${base}/event`, JSON.stringify(queue.shift()), { qos: 1 });
});
client.on('close', () => { online = false; });

client.on('message', (topic, payload) => {
  const kind = topic.slice(base.length + 1);
  if (kind === 'sim') return handle(payload.toString()); // perintah dari skrip uji
  let data;
  try { data = JSON.parse(payload.toString()); } catch { return; }

  if (kind === 'sync') {
    pins = new Map(data.pins.map((p) => [p.hash, p]));
    masterHash = data.masterHash;
    console.log(`  <- sync: ${pins.size} PIN aktif, master ${masterHash ? 'ada' : 'belum diatur'}`);
  } else if (kind === 'pin/add') {
    pins.set(data.hash, { userId: data.userId, expiresAt: data.expiresAt });
    console.log(`  <- PIN baru untuk ${data.userId} (berlaku ${data.ttlSec / 60} menit)`);
  } else if (kind === 'pin/revoke') {
    pins.delete(data.hash);
    console.log('  <- PIN dicabut');
  } else if (kind === 'master/set') {
    masterHash = data.hash;
    console.log('  <- PIN master diperbarui');
  }
});

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', handle);

// Perintah bisa diketik di terminal atau dikirim ke topik <prefix>/<boxId>/sim (untuk uji otomatis).
function handle(line) {
  const [cmd, arg = ''] = line.trim().split(/\s+/);
  if (cmd === 'pin') {
    const h = hash(arg);
    const entry = pins.get(h);
    if (entry && entry.expiresAt > Date.now()) {
      pins.delete(h); // sekali pakai
      console.log(`  PIN benar, pintu TERBUKA (pemilik: ${entry.userId})`);
      send({ type: 'open_user', pinHash: h, distanceBefore: 18, distanceAfter: 24 });
    } else {
      console.log('  PIN salah / kedaluwarsa (buzzer)');
      send({ type: 'failed' });
    }
  } else if (cmd === 'master') {
    if (masterHash && hash(arg) === masterHash) {
      console.log('  PIN master benar, pintu TERBUKA');
      send({ type: 'open_master' });
    } else {
      console.log('  PIN master salah');
      send({ type: 'failed' });
    }
  } else if (cmd === 'paket') {
    send({ type: 'package_in', distanceBefore: 30, distanceAfter: 21 });
  } else if (cmd === 'tutup') {
    send({ type: 'door_closed' });
  } else if (cmd === 'status') {
    console.log(`  online=${online} pin=${pins.size} master=${Boolean(masterHash)} antrean=${queue.length}`);
  } else if (cmd === 'keluar') {
    client.end(false, () => process.exit(0));
  } else if (cmd) {
    console.log('  perintah: pin <6 digit> | master <8 digit> | paket | tutup | status | keluar');
  }
}
