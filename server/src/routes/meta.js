import { Router } from 'express';
import { config, COURIERS } from '../config.js';
import { store } from '../store/index.js';
import { readLimiter } from '../middleware/rateLimit.js';

export const metaRouter = Router();

metaRouter.get('/health', (_req, res) => res.json({ ok: true, mode: store.mode }));

metaRouter.get('/meta', readLimiter, (_req, res) => {
  res.json({ boxId: config.boxId, couriers: COURIERS });
});

// Hanya id dan label tampil; data pribadi lain tidak pernah dikirim ke halaman publik.
metaRouter.get('/residents', readLimiter, async (_req, res, next) => {
  try {
    res.json(await store.listResidents());
  } catch (err) {
    next(err);
  }
});
