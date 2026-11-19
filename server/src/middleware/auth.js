import { HttpError } from '../errors.js';
import { store } from '../store/index.js';

// Memverifikasi token login (Firebase ID token; di mode demo "demo:<id>").
function authenticate(roles) {
  return async (req, _res, next) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
      if (!token) throw new HttpError(401, 'Silakan login terlebih dahulu.');

      const user = await store.verifyToken(token);
      if (!roles.includes(user.role)) throw new HttpError(403, 'Akses ditolak.');
      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export const requireResident = authenticate(['resident']);
export const requireAdmin = authenticate(['admin']);
