<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { Camera, Package } from "lucide-vue-next";
import { clearHistory, getHistory } from "../../utils/history";

const items = ref(getHistory());

function formatDate(iso) {
  return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
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
    <p class="mt-1 text-sm text-muted">Paket yang Anda input dari perangkat ini.</p>

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
      <ul class="card mt-6 divide-y divide-line">
        <li v-for="item in items" :key="item.id" class="flex items-start gap-3 px-4 py-3.5">
          <div class="min-w-0 flex-1">
            <p class="truncate text-[15px] font-medium">{{ item.resident }}</p>
            <p class="mt-0.5 truncate text-sm text-muted">
              {{ item.courier }}<template v-if="item.trackingNumber"> · {{ item.trackingNumber }}</template>
            </p>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-1 text-xs text-muted">
            <span>{{ formatDate(item.createdAt) }}</span>
            <Camera v-if="item.hasPhoto" class="size-3.5" />
          </div>
        </li>
      </ul>

      <button
        type="button"
        class="mt-6 w-full text-center text-sm text-muted underline-offset-4 hover:text-danger hover:underline"
        @click="clearAll"
      >
        Hapus riwayat
      </button>
    </template>
  </section>
</template>
