<script setup>
import { RouterLink } from "vue-router";
import { ArrowRight, History, QrCode } from "lucide-vue-next";
</script>

<template>
  <section class="pt-10">
    <h1 class="text-3xl font-semibold leading-tight tracking-tight">
      Titip paket untuk penghuni kos
    </h1>
    <p class="mt-3 text-[15px] leading-relaxed text-muted">
      Pilih nama penerima dan ekspedisi, lalu masukkan paket ke lubang di kotak.
      Penerima langsung mendapat notifikasi.
    </p>

    <RouterLink to="/drop" class="btn btn-primary mt-8">
      Input paket
      <ArrowRight class="size-4" />
    </RouterLink>

    <div class="mt-3 grid grid-cols-2 gap-3">
      <RouterLink to="/history" class="btn btn-secondary">
        <History class="size-4" />
        Riwayat
      </RouterLink>
      <RouterLink to="/qr" class="btn btn-secondary">
        <QrCode class="size-4" />
        QR kotak
      </RouterLink>
    </div>

    <ol class="mt-12 space-y-5">
      <li v-for="(step, i) in [
        'Pindai QR di kotak atau buka halaman ini.',
        'Pilih penerima dan ekspedisi. Foto dan resi boleh dilewati.',
        'Masukkan paket ke lubang kurir. Selesai.',
      ]" :key="i" class="flex gap-4">
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-medium text-accent"
        >
          {{ i + 1 }}
        </span>
        <p class="pt-0.5 text-[15px] text-muted">{{ step }}</p>
      </li>
    </ol>
  </section>
</template>
