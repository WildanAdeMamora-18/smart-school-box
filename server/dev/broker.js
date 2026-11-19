// Broker MQTT lokal untuk pengembangan dan demo (tanpa akun apa pun).
// Jalankan: npm run dev:broker, lalu isi MQTT_URL=mqtt://localhost:1883 di server/.env
import net from 'node:net';
import { Aedes } from 'aedes';

const port = Number(process.env.BROKER_PORT) || 1883;
const broker = await Aedes.createBroker();

net.createServer(broker.handle).listen(port, () => {
  console.log(`Broker MQTT lokal di mqtt://localhost:${port} (tanpa autentikasi, hanya untuk pengembangan)`);
});
