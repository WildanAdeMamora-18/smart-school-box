<script setup>
import {
  LayoutDashboard,
  Package,
  Boxes,
  History,
  Settings,
  PackageCheck,
} from "lucide-vue-next";

const menus = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Manajemen Paket", path: "/packages", icon: Package },
  { name: "Monitoring Box", path: "/monitoring", icon: Boxes },
  { name: "Riwayat Aktivitas", path: "/history", icon: History },
];
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex"
  >
    <div
      class="flex h-[82px] items-center gap-3 border-b border-slate-100 px-6"
    >
      <div
        class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"
      >
        <PackageCheck :size="23" />
      </div>

      <div>
        <h1 class="text-base font-bold text-slate-900">SmartParcel</h1>
        <p class="text-[10px] tracking-wider text-slate-400">
          BOX MANAGEMENT SYSTEM
        </p>
      </div>
    </div>

    <div class="px-4 pt-7">
      <p
        class="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400"
      >
        Menu utama
      </p>

      <nav class="space-y-1">
        <RouterLink
          v-for="item in menus"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
          active-class="!bg-blue-50 !text-blue-700"
          exact-active-class="!bg-blue-50 !text-blue-700"
        >
          <component :is="item.icon" :size="19" />
          {{ item.name }}
        </RouterLink>
      </nav>
    </div>

    <div class="mt-auto p-4">
      <div class="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-amber-400"></span>
          <span class="text-xs font-semibold text-slate-700">
            Mode simulasi
          </span>
        </div>
        <p class="mt-2 text-[11px] leading-5 text-slate-500">
          Perangkat IoT belum terhubung.
        </p>
      </div>

      <RouterLink
        to="/settings"
        class="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50"
        active-class="!bg-blue-50 !text-blue-700"
      >
        <Settings :size="19" />
        Pengaturan
      </RouterLink>
    </div>
  </aside>
</template>
