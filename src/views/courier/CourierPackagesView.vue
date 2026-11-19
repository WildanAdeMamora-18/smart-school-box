<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { Camera, Package } from "lucide-vue-next";
import { clearHistory, getHistory } from "../../utils/history";

const items = ref(getHistory());

const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function dayLabel(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const full = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (dayKey(date) === dayKey(today)) return `Hari ini · ${full}`;
  if (dayKey(date) === dayKey(yesterday)) return `Kemarin · ${full}`;
  return full;
}

// Dikelompokkan per hari; urutan terbaru di atas (sesuai urutan simpan).
const groups = computed(() => {
  const map = new Map();
  for (const item of items.value) {
    const date = new Date(item.createdAt);
    const key = dayKey(date);
    if (!map.has(key)) map.set(key, { key, label: dayLabel(date), items: [] });
    map.get(key).items.push({ ...item, time: formatTime(date) });
  }
  return [...map.values()];
});

function formatTime(date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function clearAll() {
  if (!confirm("Hapus semua riwayat di perangkat ini?")) return;
  clearHistory();
  items.value = [];
}
</script>

<template>
  <section class="pt-4">
    <h1 class="text-2xl font-semibold tracking-tight">Riwayat</h1>
    <p class="mt-1 text-sm text-muted">Paket yang Anda input dari perangkat ini, lengkap dengan jam input.</p>

    <div v-if="!items.length" class="mt-14 text-center">
      <div
        class="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted"
      >
        <Package class="size-6" />
      </div>
      <p class="mt-4 text-[15px] text-muted">Belum ada paket yang diinput.</p>
      <RouterLink to="/drop" class="btn btn-primary mt-6">Input paket</RouterLink>
    </div>

    <template v-else>
      <div v-for="group in groups" :key="group.key" class="mt-7">
        <h2 class="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted">
          {{ group.label }}
        </h2>
        <ul class="card divide-y divide-line">
          <li v-for="item in group.items" :key="item.id" class="flex items-start gap-4 px-4 py-3.5">
            <span class="w-[4.5rem] shrink-0 pt-0.5 text-sm font-medium tabular-nums text-accent">
              {{ item.time }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-[15px] font-medium">{{ item.resident }}</p>
              <p class="mt-0.5 truncate text-sm text-muted">
                {{ item.courier }}<template v-if="item.trackingNumber"> · {{ item.trackingNumber }}</template>
              </p>
            </div>
            <Camera v-if="item.hasPhoto" class="mt-1 size-4 shrink-0 text-muted" />
          </li>
        </ul>
      </div>

      <button
        type="button"
        class="mt-8 w-full text-center text-sm text-muted underline-offset-4 hover:text-danger hover:underline"
        @click="clearAll"
      >
        Hapus riwayat
      </button>
    </template>
  </section>
</template>
