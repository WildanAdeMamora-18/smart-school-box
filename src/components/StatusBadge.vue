<script setup>
defineProps({
  title: String,
  value: [String, Number],
  description: String,
  icon: Object,
  color: {
    type: String,
    default: "blue",
  },
});

const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
};
</script>

<template>
  <article
    class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40"
  >
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500">{{ title }}</p>
        <p class="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          {{ value }}
        </p>
      </div>

      <div
        class="flex h-11 w-11 items-center justify-center rounded-xl"
        :class="colorClasses[color] || colorClasses.blue"
      >
        <component :is="icon" :size="21" />
      </div>
    </div>

    <p class="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
      {{ description }}
    </p>
  </article>
</template>
