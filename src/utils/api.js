// Kosongkan VITE_API_URL saat pengembangan (Vite meneruskan /api ke server lokal).
const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options) {
  let res
  try {
    res = await fetch(BASE + path, options)
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // respons tanpa isi JSON
  }

  if (!res.ok) throw new Error(data?.error || 'Terjadi kesalahan. Silakan coba lagi.')
  return data
}

export const getMeta = () => request('/api/meta')
export const getResidents = () => request('/api/residents')
export const createPackage = (formData) =>
  request('/api/packages', { method: 'POST', body: formData })
