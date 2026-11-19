import { rateLimit } from 'express-rate-limit';

const base = { standardHeaders: 'draft-8', legacyHeaders: false };
const tooMany = (error) => ({ error });

// Baca data publik (daftar penghuni, metadata)
export const readLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 60,
  message: tooMany('Terlalu banyak permintaan. Coba lagi sebentar.'),
});

// Input paket per IP. Kurir bisa mengantar beberapa paket berturut-turut, dan
// beberapa kurir bisa berbagi IP seluler, jadi batasnya dibuat longgar.
export const packageIpLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: tooMany('Terlalu banyak input dari jaringan ini. Coba lagi dalam beberapa menit.'),
});

// Redeem PIN: dibatasi per penghuni (dipasang setelah autentikasi).
export const redeemLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 6,
  keyGenerator: (req) => `redeem:${req.user.uid}`,
  message: tooMany('Terlalu sering meminta PIN. Coba lagi nanti.'),
});

// Perubahan PIN master: sangat jarang, jadi sangat ketat.
export const adminPinLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => `master:${req.user.uid}`,
  message: tooMany('Terlalu banyak perubahan PIN master.'),
});

// Melindungi penghuni dari spam notifikasi, apa pun IP pengirimnya.
// Dipasang setelah multer agar req.body sudah terbaca.
export const perResidentLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => `resident:${String(req.body?.residentId ?? 'none').slice(0, 128)}`,
  message: tooMany('Penerima ini sudah menerima banyak paket dalam satu jam terakhir.'),
});
