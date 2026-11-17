
import { database } from './config'
import { ref, set, get, remove } from 'firebase/database'

export async function testFirebaseConnection() {
  const testRef = ref(database, 'connectionTest')

  try {
    // Mengirim data percobaan ke Firebase
    await set(testRef, {
      message: 'Koneksi Smart Parcel Box Berhasil!',
      timestamp: Date.now()
    })

    console.log('Berhasil mengirim data ke Firebase!')

    // Membaca kembali data dari Firebase
    const snapshot = await get(testRef)

    if (snapshot.exists()) {
      console.log('Data berhasil dibaca:', snapshot.val())
    }

    // Menghapus data percobaan
    await remove(testRef)

    console.log('Pengujian Firebase selesai!')
  } catch (error) {
    console.error('Koneksi Firebase gagal:', error)
  }
}
