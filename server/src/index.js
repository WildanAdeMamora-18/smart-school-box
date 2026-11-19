import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { store } from './store/index.js';
import { uploadsDir } from './store/memoryStore.js';
import { metaRouter } from './routes/meta.js';
import { packagesRouter } from './routes/packages.js';
import { pinsRouter } from './routes/pins.js';
import { mqtt } from './mqtt/client.js';
import { handleBoxMessage } from './mqtt/handlers.js';

const app = express();

app.set('trust proxy', config.trustProxy);
app.disable('x-powered-by');
app.use(cors({ origin: config.webOrigin }));
app.use(express.json({ limit: '10kb' }));

app.use('/api', metaRouter);
app.use('/api/packages', packagesRouter);
app.use('/api', pinsRouter);

// Foto demo disajikan dari disk hanya di mode demo.
if (!config.useFirebase) app.use('/uploads', express.static(uploadsDir));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Ukuran foto maksimal 3 MB.' });
  if (err.name === 'MulterError') return res.status(400).json({ error: 'Data yang dikirim tidak valid.' });
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});

mqtt.start(handleBoxMessage);

app.listen(config.port, () => {
  console.log(`Server berjalan di http://localhost:${config.port} · mode: ${store.mode}`);
});
