import { COURIERS } from './config.js';
import { HttpError } from './errors.js';

const BOX_ID_RE = /^[A-Za-z0-9_-]{1,32}$/;
const TRACKING_RE = /^[A-Za-z0-9\-_.]{4,40}$/;

// Mengenali tipe gambar dari isi file, bukan dari header yang dikirim klien.
function sniffImage(buf) {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length > 8 && buf.subarray(0, 8).equals(png)) {
    return { ext: 'png', mime: 'image/png' };
  }
  if (buf.length > 12 && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
}

export function parsePackageInput(body, file, defaultBoxId) {
  const residentId = String(body.residentId ?? '').trim();
  const courier = String(body.courier ?? '').trim();
  const trackingNumber = String(body.trackingNumber ?? '').trim();
  const boxId = String(body.boxId ?? '').trim() || defaultBoxId;

  if (!residentId || residentId.length > 128) throw new HttpError(400, 'Pilih nama penerima.');
  if (!COURIERS.includes(courier)) throw new HttpError(400, 'Pilih ekspedisi yang tersedia.');
  if (trackingNumber && !TRACKING_RE.test(trackingNumber)) {
    throw new HttpError(400, 'Format nomor resi tidak valid.');
  }
  if (!BOX_ID_RE.test(boxId)) throw new HttpError(400, 'ID kotak tidak valid.');

  let photo = null;
  if (file) {
    const kind = sniffImage(file.buffer);
    if (!kind) throw new HttpError(400, 'Foto harus berformat JPG, PNG, atau WebP.');
    photo = { buffer: file.buffer, ...kind };
  }

  return { residentId, courier, trackingNumber: trackingNumber || null, boxId, photo };
}
