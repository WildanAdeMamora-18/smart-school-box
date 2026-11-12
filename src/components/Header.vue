<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Bell, Search } from "lucide-vue-next";

const route = useRoute();

const pageTitle = computed(() => {
  const titles = {
    "/": "Dashboard",
    "/packages": "Manajemen Paket",
    "/monitoring": "Monitoring Box",
    "/history": "Riwayat Aktivitas",
    "/settings": "Pengaturan",
  };

  return titles[route.path] || "Dashboard";
});
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"
  >
    <div class="flex h-[82px] items-center justify-between gap-4 px-4 sm:px-8">
      <div>
        <p class="text-xs text-slate-400">SmartParcel / Admin</p>
        <h2 class="mt-1 text-lg font-bold text-slate-900">
          {{ pageTitle }}
        </h2>
      </div>

      <div class="flex items-center gap-3">
        <label class="relative hidden md:block">
          <Search
            :size="17"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Cari sesuatu..."
            class="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-400"
          />
        </label>

        <button
          class="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
          aria-label="Notifikasi"
        >
          <Bell :size="19" />
          <span
            class="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600"
          />
        </button>

        <div
          class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700"
        >
          AD
        </div>
      </div>
    </div>
  </header>
</template>
