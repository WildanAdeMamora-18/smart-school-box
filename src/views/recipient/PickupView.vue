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

        <!-- PROSES PERMINTAAN OTP -->
        <div v-else-if="item.status === 'Tersimpan'">
          <!-- Sebelum meminta OTP -->
          <div v-if="!otpRequested" class="text-center">
            <div class="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <div class="text-3xl mb-3">🔐</div>

              <h3 class="font-bold text-slate-800">
                Kode OTP Pengambilan Paket
              </h3>

              <p class="text-sm text-slate-500 mt-2">
                Tekan tombol di bawah untuk mendapatkan kode OTP. Masukkan kode
                tersebut melalui keypad pada kotak Smart Parcel Box.
              </p>
            </div>

            <div
              v-if="errorMessage"
              role="alert"
              class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-left text-sm text-red-600"
            >
              {{ errorMessage }}
            </div>

            <button
              @click="requestOTP"
              :disabled="otpLoading"
              class="w-full bg-blue-600 text-white rounded-xl py-3 mt-6 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {{ otpLoading ? "Membuat Kode OTP..." : "Minta Kode OTP" }}
            </button>
          </div>

          <!-- Setelah OTP dibuat -->
          <div v-else>
            <div
              class="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center"
            >
              <div class="text-3xl mb-3">🔑</div>

              <h3 class="font-bold text-emerald-800">
                Kode OTP Berhasil Dibuat
              </h3>

              <p class="text-sm text-emerald-700 mt-2">
                Masukkan kode berikut melalui keypad fisik pada kotak Smart
                Parcel Box.
              </p>

              <h2
                class="text-4xl font-bold tracking-[0.4em] text-emerald-700 mt-5"
              >
                {{ generatedOTP }}
              </h2>
            </div>

            <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-5">
              <div class="flex items-start gap-3">
                <span class="text-xl">ℹ️</span>

                <div>
                  <p class="font-semibold text-blue-800 text-sm">
                    Menunggu Verifikasi dari Kotak
                  </p>

                  <p class="text-xs text-blue-700 mt-1 leading-5">
                    Silakan menuju kotak Smart Parcel Box dan masukkan kode OTP
                    melalui keypad. Kotak akan terbuka apabila kode yang
                    dimasukkan benar.
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="errorMessage"
              role="alert"
              class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
            >
              {{ errorMessage }}
            </div>
          </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";

import { subscribePackages, updatePackage } from "../../utils/firebaseStorage";

const route = useRoute();

const generatedOTP = ref("");
const otpRequested = ref(false);
const otpLoading = ref(false);

const errorMessage = ref("");
const successMessage = ref("");

const packages = ref([]);
let unsubscribePackages = null;

// Mencari paket berdasarkan ID URL
const item = computed(() => {
  return packages.value.find((pkg) => pkg.id === route.params.id);
});

// Mendengarkan perubahan data Firebase
onMounted(() => {
  unsubscribePackages = subscribePackages((data) => {
    packages.value = data;
  });
});

// Menghentikan listener ketika halaman ditinggalkan
onUnmounted(() => {
  if (unsubscribePackages) {
    unsubscribePackages();
  }
});

// Menampilkan notifikasi ketika perangkat IoT
// berhasil memverifikasi OTP dan memperbarui status paket
watch(
  item,
  (currentPackage) => {
    if (currentPackage?.status === "Diambil") {
      successMessage.value =
        "OTP berhasil diverifikasi oleh kotak Smart Parcel Box. Paket Anda berhasil diambil.";
    }
  },
  { immediate: true },
);

// Membuat OTP 6 digit
function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// Meminta OTP dari sistem
async function requestOTP() {
  errorMessage.value = "";

  const currentPackage = item.value;

  if (!currentPackage) {
    errorMessage.value = "Data paket tidak ditemukan.";
    return;
  }

  if (currentPackage.status !== "Tersimpan") {
    errorMessage.value = "Paket ini sudah pernah diambil.";
    return;
  }

  otpLoading.value = true;

  try {
    const newOTP = generateOTP();

    // Menyimpan OTP ke Firebase
    await updatePackage(currentPackage.id, {
      otp: newOTP,
      otpCreatedAt: new Date().toISOString(),
      otpVerified: false,
    });

    generatedOTP.value = newOTP;
    otpRequested.value = true;

    console.log("OTP berhasil dibuat.");
  } catch (error) {
    console.error("Gagal membuat OTP:", error);

    errorMessage.value = "Gagal membuat kode OTP. Silakan coba kembali.";
  } finally {
    otpLoading.value = false;
  }
}
</script>
