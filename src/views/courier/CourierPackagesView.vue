<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b border-slate-200">
      <div
        class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center"
      >
        <RouterLink to="/courier" class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold"
          >
            SP
          </div>
          <div>
            <h1 class="font-bold text-slate-800">Smart Parcel Box</h1>
            <p class="text-xs text-slate-500">Portal Kurir</p>
          </div>
        </RouterLink>

        <RouterLink
          to="/courier"
          class="text-sm text-slate-500 hover:text-blue-600"
        >
          Kembali ke Beranda
        </RouterLink>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-10">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <p class="text-sm font-semibold text-blue-600 mb-2">PORTAL KURIR</p>
          <h2 class="text-3xl font-bold text-slate-900">Paket Terkirim</h2>
          <p class="text-slate-500 mt-2">
            Daftar paket yang telah dicatat oleh kurir.
          </p>
        </div>

        <RouterLink
          to="/courier/add-package"
          class="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition text-center"
        >
          + Input Paket
        </RouterLink>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
        <label class="block text-sm font-medium text-slate-700 mb-2">
          Cari Paket
        </label>
        <input
          v-model="search"
          type="text"
          placeholder="Cari nomor resi atau nama penerima..."
          class="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div class="p-5 border-b border-slate-100">
          <h3 class="font-bold text-slate-800">
            Daftar Paket ({{ filteredPackages.length }})
          </h3>
        </div>

        <div v-if="filteredPackages.length" class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 text-slate-500">
              <tr>
                <th class="px-5 py-4 font-medium">Nomor Resi</th>
                <th class="px-5 py-4 font-medium">Penerima</th>
                <th class="px-5 py-4 font-medium">Ekspedisi</th>
                <th class="px-5 py-4 font-medium">Status</th>
                <th class="px-5 py-4 font-medium">Tanggal</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in filteredPackages"
                :key="item.id"
                class="border-t border-slate-100"
              >
                <td class="px-5 py-4 font-semibold text-slate-800">
                  {{ item.trackingNumber }}
                </td>
                <td class="px-5 py-4 text-slate-600">
                  <div>{{ item.recipientName }}</div>
                  <div class="text-xs text-slate-400">
                    {{ item.recipientRoom }}
                  </div>
                </td>
                <td class="px-5 py-4 text-slate-600">{{ item.courier }}</td>
                <td class="px-5 py-4">
                  <span
                    class="inline-block rounded-full px-3 py-1 text-xs font-medium"
                    :class="
                      item.status === 'Tersimpan'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    "
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-5 py-4 text-slate-500">
                  {{ formatDate(item.createdAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-14 px-5">
          <div class="text-4xl mb-3">📦</div>
          <h3 class="font-semibold text-slate-800">Belum ada paket</h3>
          <p class="text-sm text-slate-500 mt-2">
            Paket yang berhasil dicatat akan muncul di sini.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { getPackages } from "../../utils/storage";

const packages = ref([]);
const search = ref("");

function loadPackages() {
  packages.value = getPackages();
}

const filteredPackages = computed(() => {
  const keyword = search.value.toLowerCase();

  return packages.value.filter(
    (item) =>
      (item.trackingNumber || "").toLowerCase().includes(keyword) ||
      (item.recipientName || "").toLowerCase().includes(keyword),
  );
});

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
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
