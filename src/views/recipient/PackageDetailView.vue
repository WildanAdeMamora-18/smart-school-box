
<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <RouterLink to="/recipient" class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
            SP
          </div>
          <div>
            <h1 class="font-bold text-slate-800">Smart Parcel Box</h1>
            <p class="text-xs text-slate-500">Portal Penerima</p>
          </div>
        </RouterLink>

        <RouterLink to="/recipient/packages" class="text-sm text-slate-500 hover:text-blue-600">
          Kembali ke Paket Saya
        </RouterLink>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-6 py-10">
      <div class="mb-8">
        <p class="text-sm font-semibold text-blue-600 mb-2">INFORMASI PAKET</p>
        <h2 class="text-3xl font-bold text-slate-900">Detail Paket</h2>
        <p class="text-slate-500 mt-2">
          Informasi lengkap mengenai paket yang Anda terima.
        </p>
      </div>

      <div v-if="item" class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div class="bg-blue-600 text-white p-6">
          <p class="text-sm text-blue-100">Nomor Resi</p>
          <h3 class="text-2xl font-bold mt-1">{{ item.trackingNumber }}</h3>
          <span class="inline-block mt-4 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
            {{ item.status }}
          </span>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <h4 class="font-bold text-slate-800 mb-4">Informasi Pengiriman</h4>
            <div class="grid sm:grid-cols-2 gap-5">
              <div>
                <p class="text-xs text-slate-400">Ekspedisi</p>
                <p class="font-medium text-slate-700 mt-1">{{ item.courier }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Tanggal Diterima Sistem</p>
                <p class="font-medium text-slate-700 mt-1">{{ formatDate(item.createdAt) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Nama Penerima</p>
                <p class="font-medium text-slate-700 mt-1">{{ item.recipientName }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Nomor Kamar / Unit</p>
                <p class="font-medium text-slate-700 mt-1">{{ item.recipientRoom }}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-5">
            <h4 class="font-bold text-slate-800 mb-3">Lokasi Penyimpanan</h4>
            <div class="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                  📦
                </div>
                <div>
                  <p class="font-semibold text-blue-800">Kotak Penyimpanan Utama</p>
                  <p class="text-xs text-blue-600 mt-1">
                    Paket disimpan di dalam satu kotak penyimpanan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="item.status === 'Tersimpan'" class="border-t border-slate-100 pt-5">
            <h4 class="font-bold text-slate-800">Pengambilan Paket</h4>
            <p class="text-sm text-slate-500 mt-2">
              Gunakan kode OTP yang diberikan kepada Anda untuk melanjutkan pengambilan paket.
            </p>
            <RouterLink
              :to="`/recipient/packages/${item.id}/pickup`"
              class="inline-block mt-4 bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Ambil Paket
            </RouterLink>
          </div>

          <div v-else class="border-t border-slate-100 pt-5">
            <p class="text-sm text-emerald-700 font-medium">
              Paket ini telah ditandai sebagai sudah diambil.
            </p>
          </div>
        </div>
      </div>

      <div v-else class="bg-white border border-slate-200 rounded-2xl p-10 text-center">
        <div class="text-4xl mb-3">🔎</div>
        <h3 class="font-bold text-slate-800">Paket tidak ditemukan</h3>
        <p class="text-sm text-slate-500 mt-2">
          Data paket mungkin sudah tidak tersedia.
        </p>
        <RouterLink to="/recipient/packages" class="inline-block mt-5 text-blue-600 font-semibold text-sm">
          Kembali ke Paket Saya
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getPackages } from '../../utils/storage'

const route = useRoute()

const item = computed(() => {
  return getPackages().find((pkg) => pkg.id === route.params.id)
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
</script>
