<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Clock3 } from "lucide-vue-next";

const now = ref(new Date());
let timer;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});
onBeforeUnmount(() => clearInterval(timer));

const date = computed(() =>
  now.value.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
);

const time = computed(() =>
  now.value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }),
);
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
  >
    <div class="flex min-w-0 items-center gap-2 text-sm text-muted">
      <Clock3 class="size-4 shrink-0" />
      <span class="truncate">{{ date }}</span>
    </div>
    <span class="shrink-0 text-lg font-semibold tabular-nums">{{ time }}</span>
  </div>
</template>
