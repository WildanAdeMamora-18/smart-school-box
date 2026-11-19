import { Router } from 'express';
import multer from 'multer';
import { config } from '../config.js';
import { HttpError } from '../errors.js';
import { parsePackageInput } from '../validate.js';
import { packageIpLimiter, perResidentLimiter } from '../middleware/rateLimit.js';
import { store } from '../store/index.js';

export const packagesRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024, files: 1, fields: 8 },
});

packagesRouter.post('/', packageIpLimiter, upload.single('photo'), perResidentLimiter, async (req, res, next) => {
  try {
    const input = parsePackageInput(req.body, req.file, config.boxId);

    const resident = await store.getResident(input.residentId);
    if (!resident) throw new HttpError(404, 'Penerima tidak ditemukan.');

    const pkg = await store.createPackage(input);

    // Kegagalan notifikasi tidak boleh membatalkan paket yang sudah tersimpan.
    store
      .notify(resident, { title: 'Paket baru masuk', body: `Ada paket ${pkg.courier} untuk Anda.`, data: { packageId: pkg.id } })
      .catch((err) => console.error('Notifikasi gagal:', err.message));

    res.status(201).json({
      id: pkg.id,
      resident: resident.label,
      courier: pkg.courier,
      trackingNumber: pkg.trackingNumber,
      hasPhoto: Boolean(input.photo),
      createdAt: pkg.createdAt,
    });
  } catch (err) {
    next(err);
  }
});
