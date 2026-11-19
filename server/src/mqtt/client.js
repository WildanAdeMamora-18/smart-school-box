import mqttLib from 'mqtt';
import { config } from '../config.js';

const BOX_ID_RE = /^[A-Za-z0-9_-]{1,32}$/;
let client = null;

function parse(buffer) {
  const text = buffer.toString();
  try {
    return JSON.parse(text);
  } catch {
    return text; // mis. status "online" / "offline" sebagai teks biasa
  }
}

export const mqtt = {
  get enabled() {
    return client !== null;
  },

  // onMessage(boxId, kind, data) dipanggil untuk topik <prefix>/<boxId>/event|status
  start(onMessage) {
    const { url, username, password, prefix, clientId } = config.mqtt;
    if (!url) {
      console.log('[mqtt] MQTT_URL belum diisi — MQTT dinonaktifkan (PIN tidak dikirim ke kotak).');
      return;
    }

    // Sesi persisten + QoS 1: event dari kotak yang terkirim saat server mati tetap diterima.
    client = mqttLib.connect(url, { username, password, clientId, clean: false, reconnectPeriod: 3000 });

    client.on('connect', () => {
      console.log(`[mqtt] tersambung ke ${url}`);
      client.subscribe([`${prefix}/+/event`, `${prefix}/+/status`], { qos: 1 });
    });
    client.on('error', (err) => console.error('[mqtt] galat:', err.message));
    client.on('close', () => console.log('[mqtt] koneksi terputus, mencoba lagi…'));

    client.on('message', (topic, payload) => {
      const [, boxId, kind] = topic.slice(prefix.length).split('/');
      if (!BOX_ID_RE.test(boxId ?? '') || !['event', 'status'].includes(kind)) return;
      Promise.resolve(onMessage(boxId, kind, parse(payload))).catch((err) =>
        console.error(`[mqtt] gagal memproses ${kind} dari ${boxId}:`, err.message),
      );
    });
  },

  publish(boxId, suffix, payload) {
    if (!client) {
      console.log(`[mqtt nonaktif] ${boxId}/${suffix}`);
      return false;
    }
    client.publish(`${config.mqtt.prefix}/${boxId}/${suffix}`, JSON.stringify(payload), { qos: 1 });
    return true;
  },
};
