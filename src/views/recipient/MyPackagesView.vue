<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import {
  Package,
  Search,
  ArrowLeft,
  ArrowRight,
  Clock3,
} from "lucide-vue-next";

import { getPackages } from "../../utils/storage";

const searchQuery = ref("");
const packages = ref([]);

function loadPackages() {
  packages.value = getPackages();
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

// Semua paket ditampilkan jika kolom pencarian kosong.
// Jika diisi, pencarian berdasarkan nama atau nomor HP penerima.
const filteredPackages = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const phoneQuery = normalizePhone(query);

  return [...packages.value]
    .filter((item) => {
      if (!query) return true;

      const recipientName = String(item.recipientName || "").toLowerCase();
      const recipientPhone = normalizePhone(item.recipientPhone);

      return (
        recipientName.includes(query) ||
        (phoneQuery && recipientPhone.includes(phoneQuery))
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

const storedCount = computed(
  () => packages.value.filter((item) => item.status === "Tersimpan").length,
);

const pickedCount = computed(
  () => packages.value.filter((item) => item.status === "Diambil").length,
);

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(() => {
  loadPackages();
  window.addEventListener("packages-updated", loadPackages);
});

onUnmounted(() => {
  window.removeEventListener("packages-updated", loadPackages);
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="border-b border-slate-200 bg-white">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"
      >
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
        <h2 class="text-2xl font-bold text-slate-800">Daftar Paket</h2>
        <p class="mt-1 text-sm text-slate-500">
          Lihat seluruh paket yang telah didaftarkan oleh kurir.
        </p>
      </div>

      <!-- Pencarian dan daftar paket -->
      <section class="rounded-2xl border border-slate-200 bg-white p-6">
        <div class="mb-5">
          <h3 class="font-bold text-slate-800">Semua Paket</h3>
          <p class="mt-1 text-sm text-slate-500">
            Cari berdasarkan nama atau nomor HP penerima.
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
            Menampilkan {{ filteredPackages.length }} dari
            {{ packages.length }} paket
          </p>
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Hapus pencarian
          </button>
        </div>

        <!-- Jika belum ada paket -->
        <div v-if="packages.length === 0" class="py-12 text-center">
          <Package :size="38" class="mx-auto mb-3 text-slate-300" />
          <h4 class="font-semibold text-slate-700">Belum ada paket</h4>
          <p class="mt-1 text-sm text-slate-500">
            Paket yang dimasukkan oleh kurir akan tampil di sini.
          </p>
        </div>

        <!-- Jika hasil pencarian kosong -->
        <div
          v-else-if="filteredPackages.length === 0"
          class="py-12 text-center"
        >
          <Search :size="38" class="mx-auto mb-3 text-slate-300" />
          <h4 class="font-semibold text-slate-700">Paket tidak ditemukan</h4>
          <p class="mt-1 text-sm text-slate-500">
            Coba gunakan nama atau nomor HP penerima yang berbeda.
          </p>
        </div>

        <!-- Daftar paket -->
        <div v-else class="space-y-4">
          <RouterLink
            v-for="item in filteredPackages"
            :key="item.id"
            :to="`/recipient/packages/${item.id}`"
            class="block rounded-xl border border-slate-200 p-5 transition hover:border-blue-300 hover:shadow-sm"
          >
            <div
              class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
            >
              <div>
                <p class="text-xs text-slate-400">Nomor Resi</p>
                <h4 class="mt-1 font-bold text-slate-800">
                  {{ item.trackingNumber }}
                </h4>

                <p class="mt-2 text-sm font-medium text-slate-700">
                  {{ item.recipientName }}
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ item.recipientPhone }}
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ item.courier }} · Kotak Penyimpanan Utama
                </p>
                <p class="mt-2 flex items-center gap-1 text-xs text-slate-400">
                  <Clock3 :size="13" />
                  {{ formatDate(item.createdAt) }}
                </p>
              </div>

              <div class="flex items-center justify-between gap-3">
                <span
                  class="rounded-full px-3 py-1.5 text-xs font-semibold"
                  :class="
                    item.status === 'Tersimpan'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-green-50 text-green-700'
                  "
                >
                  {{ item.status }}
                </span>

                <ArrowRight :size="19" class="text-slate-400" />
              </div>
            </div>
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>
