<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200">
      <div
        class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center"
      >
        <RouterLink to="/recipient" class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold"
          >
            SP
          </div>

          <div>
            <h1 class="font-bold text-slate-800">Smart Parcel Box</h1>
            <p class="text-xs text-slate-500">Portal Penerima</p>
          </div>
        </RouterLink>

        <RouterLink
          to="/recipient/packages"
          class="text-sm text-slate-500 hover:text-blue-600"
        >
          Kembali ke Paket Saya
        </RouterLink>
      </div>
    </header>

    <main class="max-w-xl mx-auto px-6 py-10">
      <!-- Judul -->
      <div class="mb-8">
        <p class="text-sm font-semibold text-blue-600 mb-2">
          PENGAMBILAN PAKET
        </p>

        <h2 class="text-3xl font-bold text-slate-900">Verifikasi OTP</h2>

        <p class="text-slate-500 mt-2">
          Masukkan kode OTP untuk memverifikasi pengambilan paket Anda.
        </p>
      </div>

      <!-- Informasi Paket -->
      <div v-if="item" class="bg-white border border-slate-200 rounded-2xl p-6">
        <div class="bg-blue-50 rounded-xl p-4 mb-6">
          <p class="text-xs text-blue-600">NOMOR RESI</p>

          <h3 class="text-lg font-bold text-slate-800 mt-1">
            {{ item.trackingNumber }}
          </h3>

          <div class="flex justify-between mt-4 text-sm">
            <span class="text-slate-500">Lokasi Penyimpanan</span>
            <span class="font-bold text-blue-700">
              Kotak Penyimpanan Utama
            </span>
          </div>
        </div>

        <!-- NOTIFIKASI BERHASIL -->
        <div
          v-if="successMessage"
          role="status"
          class="rounded-xl border border-emerald-200 bg-emerald-50 p-5"
        >
          <div class="flex items-center gap-3">
            <span class="text-3xl">✅</span>

            <div>
              <h3 class="font-bold text-emerald-800">
                Pengambilan Paket Berhasil!
              </h3>

              <p class="mt-1 text-sm text-emerald-700">
                {{ successMessage }}
              </p>
            </div>
          </div>

          <p class="mt-4 text-sm text-emerald-700">
            Paket dengan nomor resi
            <strong>{{ item.trackingNumber }}</strong>
            telah berhasil ditandai sebagai sudah diambil.
          </p>

          <RouterLink
            to="/recipient/history"
            class="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Lihat Riwayat Pengambilan
          </RouterLink>
        </div>

        <!-- FORM OTP -->
        <div v-else-if="item.status === 'Tersimpan'">
          <label class="block text-sm font-medium text-slate-700 mb-2">
            Masukkan 6 Digit Kode OTP
          </label>

          <input
            v-model.trim="otpInput"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="Contoh: 123456"
            class="w-full border border-slate-300 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold focus:border-blue-500 focus:outline-none"
            @input="otpInput = otpInput.replace(/[^0-9]/g, '')"
          />

          <!-- NOTIFIKASI GAGAL -->
          <div
            v-if="errorMessage"
            role="alert"
            class="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <span class="text-xl">❌</span>

            <div>
              <p class="font-bold text-red-700">Pengambilan Paket Gagal</p>

              <p class="mt-1 text-sm text-red-600">
                {{ errorMessage }}
              </p>
            </div>
          </div>

          <!-- Catatan Simulasi -->
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-5">
            <p class="text-xs text-amber-800 leading-5">
              <strong>Catatan simulasi:</strong>
              Pada versi pengembangan ini, OTP belum dikirim melalui SMS atau
              WhatsApp. Gunakan kode uji yang tersedia pada data paket untuk
              melakukan pengujian.
            </p>
          </div>

          <!-- Tombol Verifikasi -->
          <button
            @click="verifyOTP"
            :disabled="loading"
            class="w-full bg-blue-600 text-white rounded-xl py-3 mt-6 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {{ loading ? "Memproses..." : "Verifikasi dan Ambil Paket" }}
          </button>
        </div>

        <!-- PAKET SUDAH DIAMBIL -->
        <div v-else class="text-center py-5">
          <div class="text-4xl mb-3">✅</div>

          <h3 class="font-bold text-emerald-700">Paket Sudah Diambil</h3>

          <p class="text-sm text-slate-500 mt-2">
            Paket ini telah berhasil ditandai sebagai sudah diambil.
          </p>

          <RouterLink
            to="/recipient/history"
            class="inline-block mt-5 text-blue-600 font-semibold text-sm hover:text-blue-700"
          >
            Lihat Riwayat →
          </RouterLink>
        </div>
      </div>

      <!-- PAKET TIDAK DITEMUKAN -->
      <div
        v-else
        class="bg-white border border-slate-200 rounded-2xl p-8 text-center"
      >
        <div class="text-4xl mb-3">🔎</div>

        <h3 class="font-bold text-slate-800">Paket Tidak Ditemukan</h3>

        <p class="text-sm text-slate-500 mt-2">
          Data paket yang Anda cari tidak tersedia.
        </p>

        <RouterLink
          to="/recipient/packages"
          class="inline-block mt-5 text-blue-600 text-sm font-semibold"
        >
          Kembali ke Paket Saya
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { getPackages, updatePackage } from "../../utils/storage";

const route = useRoute();

const otpInput = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const loading = ref(false);

const item = computed(() => {
  return getPackages().find((pkg) => pkg.id === route.params.id);
});

function verifyOTP() {
  errorMessage.value = "";
  successMessage.value = "";

  // Validasi format OTP
  if (!/^[0-9]{6}$/.test(otpInput.value)) {
    errorMessage.value = "Masukkan kode OTP yang terdiri dari 6 digit.";
    return;
  }

  const currentPackage = item.value;

  // Periksa data paket
  if (!currentPackage) {
    errorMessage.value = "Data paket tidak ditemukan.";
    return;
  }

  // Periksa status paket
  if (currentPackage.status !== "Tersimpan") {
    errorMessage.value = "Paket ini sudah pernah diambil.";
    return;
  }

  // Periksa kesesuaian OTP
  if (otpInput.value !== String(currentPackage.otp)) {
    errorMessage.value = "Kode OTP tidak sesuai. Silakan coba kembali.";
    return;
  }

  // Proses pengambilan paket
  loading.value = true;

  try {
    updatePackage(currentPackage.id, {
      status: "Diambil",
      pickedAt: new Date().toISOString(),
    });

    // Tampilkan notifikasi berhasil
    successMessage.value =
      "Verifikasi OTP berhasil. Terima kasih telah mengambil paket Anda.";

    otpInput.value = "";
  } catch (error) {
    errorMessage.value =
      "Terjadi kesalahan saat memproses pengambilan paket. Silakan coba kembali.";
  } finally {
    loading.value = false;
  }
}
</script>
