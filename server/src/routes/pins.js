import { Router } from 'express';
import { config } from '../config.js';
import { requireAdmin, requireResident } from '../middleware/auth.js';
import { adminPinLimiter, redeemLimiter } from '../middleware/rateLimit.js';
import { redeemPin, setMasterPin } from '../services/pinService.js';

export const pinsRouter = Router();

// Penghuni meminta PIN pengambilan paket (dipanggil dari aplikasi Flutter).
pinsRouter.post('/pins/redeem', requireResident, redeemLimiter, async (req, res, next) => {
  try {
    const { pin, expiresAt } = await redeemPin(req.user.uid, config.boxId);
    res.status(201).json({ pin, expiresAt, expiresInSec: config.pinTtlMs / 1000 });
  } catch (err) {
    next(err);
  }
});

// Admin mengatur PIN master. Body kosong = PIN acak yang dikembalikan sekali ini saja.
pinsRouter.post('/admin/master-pin', requireAdmin, adminPinLimiter, async (req, res, next) => {
  try {
    res.status(201).json(await setMasterPin(config.boxId, req.body?.pin));
  } catch (err) {
    next(err);
  }
});
