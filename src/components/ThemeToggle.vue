<script setup>
import { Sun, Moon } from "lucide-vue-next";
import { useTheme } from "../composables/useTheme";

const { isDark, toggle } = useTheme();
</script>

<template>
  <button
    type="button"
    class="inline-flex size-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-fg"
    :aria-label="isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'"
    @click="toggle"
  >
    <Sun v-if="isDark" class="size-5" />
    <Moon v-else class="size-5" />
  </button>
</template>
