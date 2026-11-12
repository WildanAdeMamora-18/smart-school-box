<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import {
  Package,
  ClipboardList,
  History,
  ArrowRight,
  PackageCheck,
  Clock3,
} from "lucide-vue-next";

import { getPackages } from "../../utils/storage";

const packages = ref([]);

const currentDate = ref(new Date());

let clockInterval = null;

const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const formattedTime = computed(() => {
  return currentDate.value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
});

function updateClock() {
  currentDate.value = new Date();
}

function loadPackages() {
  packages.value = getPackages();
}

const totalPackages = computed(() => packages.value.length);

const storedCount = computed(
  () => packages.value.filter((item) => item.status === "Tersimpan").length,
);

const pickedCount = computed(
  () => packages.value.filter((item) => item.status === "Diambil").length,
);

onMounted(() => {
  loadPackages();
  window.addEventListener("packages-updated", loadPackages);

  updateClock();
  clockInterval = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  window.removeEventListener("packages-updated", loadPackages);
  clearInterval(clockInterval);
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
          to="/"
          class="text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          Ganti Peran
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-5 py-10">
      <!-- Judul Dashboard -->
      <div class="mb-8">
        <p class="mb-1 text-sm font-semibold text-blue-600">Portal Penerima</p>
        <h2 class="text-2xl font-bold text-slate-800">Dashboard Penerima</h2>
        <p class="mt-2 text-sm text-slate-500">
          Pantau paket dan lihat riwayat pengambilan paket Anda.
        </p>
      </div>

      <!-- Tanggal dan Waktu -->
      <div
        class="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-center gap-3">
          <div class="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Clock3 :size="24" />
          </div>

          <div>
            <p class="text-xs font-medium text-slate-500">Hari dan Tanggal</p>
            <p class="mt-1 font-semibold capitalize text-slate-800">
              {{ formattedDate }}
            </p>
          </div>
        </div>

        <div class="sm:text-right">
          <p class="text-xs font-medium text-slate-500">Waktu Saat Ini</p>
          <p class="mt-1 text-2xl font-bold tabular-nums text-blue-600">
            {{ formattedTime }}
          </p>
        </div>
      </div>

      <!-- Ringkasan Paket -->
      <section class="mb-8">
        <div class="rounded-2xl bg-blue-600 p-6 text-white shadow-sm sm:p-8">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-blue-100">Total Paket</p>
              <h3 class="mt-3 text-4xl font-bold">
                {{ totalPackages }}
              </h3>
              <p class="mt-2 text-sm text-blue-100">
                Jumlah seluruh paket yang telah terdaftar
              </p>
            </div>

            <div class="rounded-2xl bg-white/15 p-4">
              <Package :size="36" />
            </div>
          </div>

          <div
            class="mt-7 grid grid-cols-2 gap-4 border-t border-white/20 pt-5"
          >
            <div>
              <div class="flex items-center gap-2 text-blue-100">
                <Clock3 :size="17" />
                <span class="text-sm">Menunggu Diambil</span>
              </div>
              <p class="mt-2 text-2xl font-bold">{{ storedCount }}</p>
            </div>

            <div>
              <div class="flex items-center gap-2 text-blue-100">
                <PackageCheck :size="17" />
                <span class="text-sm">Sudah Diambil</span>
              </div>
              <p class="mt-2 text-2xl font-bold">{{ pickedCount }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Menu Utama -->
      <section>
        <div class="mb-5">
          <h3 class="text-lg font-bold text-slate-800">Menu Penerima</h3>
          <p class="mt-1 text-sm text-slate-500">
            Pilih menu untuk melihat informasi paket.
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <!-- Daftar Paket -->
          <RouterLink
            to="/recipient/packages"
            class="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="rounded-xl bg-blue-50 p-4 text-blue-600 transition group-hover:bg-blue-100"
              >
                <ClipboardList :size="28" />
              </div>

              <div>
                <h4 class="font-bold text-slate-800">Daftar Paket Saya</h4>
                <p class="mt-1 text-sm text-slate-500">
                  Lihat daftar dan status paket.
                </p>
              </div>
            </div>

            <ArrowRight
              :size="21"
              class="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
            />
          </RouterLink>

          <!-- Riwayat -->
          <RouterLink
            to="/recipient/history"
            class="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="rounded-xl bg-green-50 p-4 text-green-600 transition group-hover:bg-green-100"
              >
                <History :size="28" />
              </div>

              <div>
                <h4 class="font-bold text-slate-800">Riwayat</h4>
                <p class="mt-1 text-sm text-slate-500">
                  Lihat riwayat pengambilan paket.
                </p>
              </div>
            </div>

            <ArrowRight
              :size="21"
              class="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
            />
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>
