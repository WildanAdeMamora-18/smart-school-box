<script setup>
import { RouterView } from "vue-router";
import Sidebar from "../components/Sidebar.vue";
import Header from "../components/Header.vue";
</script>

<template>
  <div class="min-h-screen bg-[#f5f7fb]">
    <Sidebar />

    <div class="min-h-screen lg:pl-64">
      <Header />

      <main class="mx-auto max-w-[1600px] p-4 sm:p-8">
        <RouterView />
      </main>

      <footer
        class="mx-auto flex max-w-[1600px] flex-col gap-2 border-t border-slate-200 px-4 py-5 text-[11px] text-slate-400 sm:flex-row sm:justify-between sm:px-8"
      >
        <p>© 2026 SmartParcel Box Management System</p>
        <p>Prototype PPS · Mode simulasi</p>
      </footer>
    </div>
  </div>
</template>
