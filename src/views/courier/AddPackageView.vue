<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200">
      <div
        class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center"
      >
        <RouterLink to="/courier" class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold"
          >
            SP
          </div>

          <div>
            <h1 class="font-bold text-slate-800">Smart Parcel Box</h1>
            <p class="text-xs text-slate-500">Portal Kurir</p>
          </div>
        </RouterLink>

        <RouterLink
          to="/courier"
          class="text-sm text-slate-500 hover:text-blue-600"
        >
          Kembali ke Beranda
        </RouterLink>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-6 py-10">
      <!-- Judul -->
      <div class="mb-8">
        <p class="text-sm font-semibold text-blue-600 mb-2">PORTAL KURIR</p>
        <h2 class="text-3xl font-bold text-slate-900">Input Paket</h2>
        <p class="text-slate-500 mt-2">
          Lengkapi informasi paket dan penerima sebelum menyimpan paket.
        </p>
      </div>

      <!-- Waktu Penerimaan Paket -->
      <div class="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div class="mb-3 flex items-center gap-2 text-blue-700">
          <Clock3 :size="20" />
          <h3 class="font-semibold">Waktu Penerimaan Paket</h3>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500">
              Hari dan Tanggal
            </label>
            <input
              type="text"
              :value="formattedDate"
              readonly
              class="w-full rounded-lg border border-blue-100 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500">
              Waktu
            </label>
            <input
              type="text"
              :value="formattedTime"
              readonly
              class="w-full rounded-lg border border-blue-100 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
            />
          </div>
        </div>

        <p class="mt-2 text-xs text-blue-600">
          Waktu tercatat otomatis berdasarkan jam perangkat dan tidak dapat
          diubah.
        </p>
      </div>

      <!-- Form Input -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
        <form @submit.prevent="submitPackage" class="space-y-5">
          <!-- Informasi Paket -->
          <div>
            <h3 class="font-bold text-slate-800 text-lg">Informasi Paket</h3>
            <p class="text-sm text-slate-500 mt-1">
              Masukkan identitas paket yang dikirim.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Nomor Resi
              </label>
              <input
                v-model.trim="form.trackingNumber"
                type="text"
                placeholder="Contoh: JNE123456789"
                required
                class="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Ekspedisi
              </label>
              <select
                v-model="form.courier"
                required
                class="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="" disabled>Pilih ekspedisi</option>
                <option>JNE</option>
                <option>J&T Express</option>
                <option>SiCepat</option>
                <option>Pos Indonesia</option>
                <option>AnterAja</option>
                <option>SPX Express</option>
                <option>Lainnya</option>
              </select>
            </div>
          </div>

          <!-- Informasi Penerima -->
          <div class="border-t border-slate-100 pt-5">
            <h3 class="font-bold text-slate-800 text-lg">Informasi Penerima</h3>
            <p class="text-sm text-slate-500 mt-1">
              Masukkan identitas orang yang menerima paket.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Nama Penerima
              </label>
              <input
                v-model.trim="form.recipientName"
                type="text"
                placeholder="Nama lengkap penerima"
                required
                class="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Nomor HP Penerima
              </label>
              <input
                v-model.trim="form.recipientPhone"
                type="tel"
                placeholder="Contoh: 081234567890"
                required
                class="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Nomor Kamar / Unit
              </label>
              <input
                v-model.trim="form.recipientRoom"
                type="text"
                placeholder="Contoh: Kamar 203"
                required
                class="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Informasi Penyimpanan -->
          <div class="border-t border-slate-100 pt-5">
            <h3 class="font-bold text-slate-800 text-lg">Penyimpanan Paket</h3>
            <p class="text-sm text-slate-500 mt-1">
              Paket akan disimpan di dalam satu kotak Smart Parcel Box.
            </p>
          </div>

          <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div class="flex items-center gap-3">
              <div
                class="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-2xl"
              >
                📦
              </div>
              <div>
                <p class="font-semibold text-slate-800">
                  Kotak Penyimpanan Utama
                </p>
                <p class="text-sm text-slate-600">
                  Semua paket disimpan dalam satu kotak penyimpanan.
                </p>
              </div>
            </div>
          </div>

          <!-- Notifikasi Gagal -->
          <div
            v-if="errorMessage"
            role="alert"
            class="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4"
          >
            <span class="text-xl">❌</span>
            <div>
              <p class="font-bold">Paket Gagal Disimpan</p>
              <p class="text-sm mt-1">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Tombol -->
          <div class="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="submit"
              :disabled="loading"
              class="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {{ loading ? "Menyimpan..." : "Simpan Paket" }}
            </button>

            <button
              type="button"
              @click="resetForm"
              class="border border-slate-300 text-slate-600 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>

      <!-- Notifikasi Berhasil -->
      <div
        v-if="savedPackage"
        role="status"
        class="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-6"
      >
        <div class="flex items-center gap-3 mb-4">
          <span class="text-3xl">✅</span>
          <div>
            <h3 class="font-bold text-emerald-800">Paket Berhasil Disimpan!</h3>
            <p class="text-sm text-emerald-700 mt-1">
              Data paket berhasil dicatat ke dalam sistem.
            </p>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 space-y-3">
          <p class="text-sm text-slate-600">
            Nomor resi:
            <strong class="text-slate-800">
              {{ savedPackage.trackingNumber }}
            </strong>
          </p>

          <p class="text-sm text-slate-600">
            Penerima:
            <strong class="text-slate-800">
              {{ savedPackage.recipientName }}
            </strong>
          </p>

          <p class="text-sm text-slate-600">
            Lokasi penyimpanan:
            <strong class="text-slate-800"> Kotak Penyimpanan Utama </strong>
          </p>

          <div class="border-t border-slate-100 pt-3">
            <p class="text-sm text-slate-600">OTP simulasi:</p>
            <strong class="text-2xl text-blue-700 tracking-widest">
              {{ savedPackage.otp }}
            </strong>
          </div>

          <p class="text-xs text-slate-500">
            Kode ini digunakan untuk pengujian pengambilan paket. Pada sistem
            sebenarnya, OTP harus dikirim secara privat kepada penerima.
          </p>
        </div>

        <RouterLink
          to="/courier/packages"
          class="inline-block mt-4 text-sm font-semibold text-emerald-800 underline"
        >
          Lihat daftar paket
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from "vue";
import { Clock3 } from "lucide-vue-next";
import { addPackage } from "../../utils/storage";

const errorMessage = ref("");
const savedPackage = ref(null);
const loading = ref(false);

const currentDate = ref(new Date());
let clockInterval = null;

const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const formattedTime = computed(() => {
  return currentDate.value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
});

function updateClock() {
  currentDate.value = new Date();
}

onMounted(() => {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  clearInterval(clockInterval);
});

const form = reactive({
  trackingNumber: "",
  courier: "",
  recipientName: "",
  recipientPhone: "",
  recipientRoom: "",
});

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function resetForm() {
  form.trackingNumber = "";
  form.courier = "";
  form.recipientName = "";
  form.recipientPhone = "";
  form.recipientRoom = "";

  errorMessage.value = "";
}

function submitPackage() {
  errorMessage.value = "";
  savedPackage.value = null;

  loading.value = true;

  try {
    const newPackage = addPackage({
      trackingNumber: form.trackingNumber,
      courier: form.courier,
      recipientName: form.recipientName,
      recipientPhone: form.recipientPhone,
      recipientRoom: form.recipientRoom,
      otp: generateOTP(),
    });

    savedPackage.value = newPackage;
    resetForm();
  } catch (error) {
    errorMessage.value = error.message || "Gagal menyimpan paket.";
  } finally {
    loading.value = false;
  }
}
</script>
