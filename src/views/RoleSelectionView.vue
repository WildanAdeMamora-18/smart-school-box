<template>
  <main
    class="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-12"
  >
    <section class="w-full max-w-4xl">
      <div class="text-center mb-10">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-bold mb-5"
        >
          SP
        </div>

        <h1 class="text-3xl md:text-4xl font-bold text-slate-900">
          Smart Parcel Box
        </h1>

        <p class="text-slate-500 mt-3">
          Sistem penerimaan dan penyimpanan paket otomatis
        </p>
      </div>

      <div class="text-center mb-8">
        <h2 class="text-xl font-semibold text-slate-800">Selamat Datang!</h2>
        <p class="text-slate-500 mt-2">
          Silakan pilih peran Anda untuk melanjutkan
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-5">
        <button
          @click="goTo('/courier')"
          class="text-left bg-white border border-slate-200 rounded-2xl p-7 hover:border-blue-500 hover:shadow-lg transition"
        >
          <div
            class="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-5"
          >
            🚚
          </div>

          <h3 class="text-xl font-bold text-slate-800">Kurir</h3>

          <p class="text-slate-500 text-sm mt-3 leading-6">
            Masukkan informasi paket dan data penerima sebelum paket disimpan.
          </p>

          <div class="mt-6 text-blue-600 font-semibold text-sm">
            Masuk sebagai Kurir →
          </div>
        </button>

        <button
          @click="goTo('/recipient')"
          class="text-left bg-white border border-slate-200 rounded-2xl p-7 hover:border-blue-500 hover:shadow-lg transition"
        >
          <div
            class="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-5"
          >
            📦
          </div>

          <h3 class="text-xl font-bold text-slate-800">Penerima Paket</h3>

          <p class="text-slate-500 text-sm mt-3 leading-6">
            Periksa paket yang diterima dan lakukan pengambilan paket melalui verifikasi OTP.
          </p>

          <div class="mt-6 text-blue-600 font-semibold text-sm">
            Masuk sebagai Penerima →
          </div>
        </button>
      </div>

      <p class="text-center text-xs text-slate-400 mt-10">
        Smart Parcel Box · Sistem berbasis Internet of Things
      </p>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function goTo(path) {
  router.push(path);
}
</script>
