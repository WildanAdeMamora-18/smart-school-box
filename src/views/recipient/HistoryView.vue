
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  History,
  Search,
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock3,
} from 'lucide-vue-next'

import { getPackages } from '../../utils/storage'

const searchQuery = ref('')
const packages = ref([])

function loadPackages() {
  packages.value = getPackages()
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '')
}

// Riwayat seluruh paket ditampilkan secara langsung.
// Pencarian dapat dilakukan berdasarkan nama atau nomor HP.
const filteredHistory = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const phoneQuery = normalizePhone(query)

  return [...packages.value]
    .filter((item) => {
      if (!query) return true

      const recipientName = String(item.recipientName || '').toLowerCase()
      const recipientPhone = normalizePhone(item.recipientPhone)

      return (
        recipientName.includes(query) ||
        (phoneQuery && recipientPhone.includes(phoneQuery))
      )
    })
    .sort((a, b) => {
      const dateA = new Date(a.pickedAt || a.createdAt)
      const dateB = new Date(b.pickedAt || b.createdAt)

      return dateB - dateA
    })
})

const totalPackages = computed(() => packages.value.length)

const pickedPackages = computed(() =>
  packages.value.filter((item) => item.status === 'Diambil').length
)

const storedPackages = computed(() =>
  packages.value.filter((item) => item.status === 'Tersimpan').length
)

function formatDate(date) {
  if (!date) return '-'

  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadPackages()
  window.addEventListener('packages-updated', loadPackages)
})

onUnmounted(() => {
  window.removeEventListener('packages-updated', loadPackages)
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <div class="flex items-center gap-3">
          <div class="rounded-xl bg-blue-600 p-2.5 text-white">
            <Package :size="24" />
          </div>

          <div>
            <h1 class="text-lg font-bold text-slate-800">Smart Parcel Box</h1>
            <p class="text-xs text-slate-500">Portal Penerima</p>
          </div>
        </div>

        <RouterLink
          to="/recipient"
          class="text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          Dashboard
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-5 py-8">
      <RouterLink
        to="/recipient"
        class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft :size="17" />
        Kembali ke Dashboard
      </RouterLink>

      <!-- Judul -->
      <div class="mb-7">
        <p class="mb-1 text-sm font-medium text-blue-600">Penerima Paket</p>
        <h2 class="text-2xl font-bold text-slate-800">Riwayat Paket</h2>
        <p class="mt-1 text-sm text-slate-500">
          Lihat catatan paket yang masuk dan sudah diambil.
        </p>
      </div>

      <!-- Riwayat dan pencarian -->
      <section class="rounded-2xl border border-slate-200 bg-white p-6">
        <div class="mb-5">
          <h3 class="font-bold text-slate-800">Semua Riwayat Aktivitas</h3>
          <p class="mt-1 text-sm text-slate-500">
            Cari riwayat berdasarkan nama atau nomor HP penerima.
          </p>
        </div>

        <div class="relative mb-6">
          <Search
            :size="19"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama penerima atau nomor HP..."
            class="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div class="mb-4 flex items-center justify-between">
          <p class="text-sm text-slate-500">
            Menampilkan {{ filteredHistory.length }} dari {{ packages.length }} riwayat
          </p>

          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Hapus pencarian
          </button>
        </div>

        <!-- Belum ada riwayat -->
        <div
          v-if="packages.length === 0"
          class="py-12 text-center"
        >
          <History :size="38" class="mx-auto mb-3 text-slate-300" />
          <h4 class="font-semibold text-slate-700">
            Belum ada riwayat paket
          </h4>
          <p class="mt-1 text-sm text-slate-500">
            Aktivitas paket akan ditampilkan setelah kurir mendaftarkan paket.
          </p>
        </div>

        <!-- Pencarian tidak menemukan hasil -->
        <div
          v-else-if="filteredHistory.length === 0"
          class="py-12 text-center"
        >
          <Search :size="38" class="mx-auto mb-3 text-slate-300" />
          <h4 class="font-semibold text-slate-700">
            Riwayat tidak ditemukan
          </h4>
          <p class="mt-1 text-sm text-slate-500">
            Coba gunakan nama atau nomor HP penerima yang berbeda.
          </p>
        </div>

        <!-- Daftar riwayat -->
        <div v-else class="space-y-5">
          <article
            v-for="item in filteredHistory"
            :key="item.id"
            class="rounded-xl border border-slate-200 p-5"
          >
            <div class="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p class="text-xs text-slate-400">Nomor Resi</p>
                <h4 class="mt-1 font-bold text-slate-800">
                  {{ item.trackingNumber }}
                </h4>

                <p class="mt-2 text-sm font-semibold text-slate-700">
                  {{ item.recipientName }}
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ item.recipientPhone }}
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ item.courier }} · Kotak Penyimpanan Utama
                </p>
              </div>

              <span
                class="w-fit rounded-full px-3 py-1.5 text-xs font-semibold"
                :class="
                  item.status === 'Diambil'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-blue-50 text-blue-700'
                "
              >
                {{ item.status }}
              </span>
            </div>

            <!-- Catatan aktivitas -->
            <div class="space-y-3 border-t border-slate-100 pt-4">
              <div class="flex items-start gap-3">
                <div class="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Package :size="17" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-700">
                    Paket dimasukkan
                  </p>
                  <p class="mt-1 text-xs text-slate-500">
                    {{ formatDate(item.createdAt) }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="rounded-lg bg-green-50 p-2 text-green-600">
                  <CheckCircle2 :size="17" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-700">
                    {{ item.status === 'Diambil' ? 'Paket diambil' : 'Menunggu pengambilan' }}
                  </p>
                  <p class="mt-1 text-xs text-slate-500">
                    {{
                      item.pickedAt
                        ? formatDate(item.pickedAt)
                        : 'Paket belum diambil oleh penerima.'
                    }}
                  </p>
                </div>
              </div>
            </div>

            <RouterLink
              :to="`/recipient/packages/${item.id}`"
              class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat Detail Paket
              <ArrowLeft :size="15" class="rotate-180" />
            </RouterLink>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
