// Mengecilkan foto di browser sebelum diunggah (hemat data seluler kurir).
// Menggambar ulang ke canvas juga membuang metadata EXIF, termasuk lokasi GPS.
export async function compressImage(file, maxSize = 1280, quality = 0.8) {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.')

  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('Format foto tidak didukung. Gunakan JPG atau PNG.')
  }

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) throw new Error('Gagal memproses foto.')
  return blob
}
