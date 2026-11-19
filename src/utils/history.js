// Riwayat input kurir disimpan di perangkat ini (kurir tidak login).
const KEY = 'parcel:history'
const MAX = 50

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function addHistory(entry) {
  const list = [entry, ...getHistory().filter((item) => item.id !== entry.id)].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function clearHistory() {
  localStorage.removeItem(KEY)
}
