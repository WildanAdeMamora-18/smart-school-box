<script setup>
import { RouterLink, RouterView } from "vue-router";
import { History } from "lucide-vue-next";
import ThemeToggle from "../components/ThemeToggle.vue";
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg text-fg">
    <header class="no-print mx-auto flex w-full max-w-md items-center justify-between px-5 py-4">
      <RouterLink to="/" class="flex items-center gap-2.5">
        <span
          class="flex size-8 items-center justify-center rounded-lg bg-accent text-xs font-semibold text-accent-fg"
        >
          SP
        </span>
        <span class="text-[15px] font-semibold tracking-tight">Smart Parcel Box</span>
      </RouterLink>

      <div class="flex items-center gap-1">
        <RouterLink
          to="/history"
          class="inline-flex size-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-fg"
          aria-label="Riwayat"
        >
          <History class="size-5" />
        </RouterLink>
        <ThemeToggle />
      </div>
    </header>

    <main class="mx-auto w-full max-w-md flex-1 px-5 pb-10 pt-2">
      <RouterView />
    </main>
  </div>
</template>
