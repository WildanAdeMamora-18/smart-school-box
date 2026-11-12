<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import {
  Package,
  Clock3,
  ClipboardPlus,
  History,
  ArrowRight,
} from "lucide-vue-next";

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

onMounted(() => {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
});

onUnmounted(() => {
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
            <p class="text-xs text-slate-500">Portal Kurir</p>
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
        <p class="mb-1 text-sm font-semibold text-blue-600">Portal Kurir</p>

        <h2 class="text-2xl font-bold text-slate-800">Dashboard Kurir</h2>

        <p class="mt-2 text-sm text-slate-500">
          Kelola proses penerimaan dan pencatatan paket.
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

      <!-- Menu Kurir -->
      <section>
        <div class="mb-5">
          <h3 class="text-lg font-bold text-slate-800">Menu Kurir</h3>

          <p class="mt-1 text-sm text-slate-500">
            Pilih menu untuk mengelola paket.
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <!-- Input Paket -->
          <RouterLink
            to="/courier/add-package"
            class="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="rounded-xl bg-blue-50 p-4 text-blue-600 transition group-hover:bg-blue-100"
              >
                <ClipboardPlus :size="28" />
              </div>

              <div>
                <h4 class="font-bold text-slate-800">Input Paket</h4>

                <p class="mt-1 text-sm text-slate-500">
                  Tambahkan data paket penerima.
                </p>
              </div>
            </div>

            <ArrowRight
              :size="21"
              class="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
            />
          </RouterLink>

          <!-- Riwayat Input Paket -->
          <RouterLink
            to="/courier/packages"
            class="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="rounded-xl bg-green-50 p-4 text-green-600 transition group-hover:bg-green-100"
              >
                <History :size="28" />
              </div>

              <div>
                <h4 class="font-bold text-slate-800">Riwayat Input Paket</h4>

                <p class="mt-1 text-sm text-slate-500">
                  Lihat seluruh paket yang telah diinput.
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
