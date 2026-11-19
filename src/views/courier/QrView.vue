<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { Printer } from "lucide-vue-next";
import QRCode from "qrcode";
import { getMeta } from "../../utils/api";

const boxId = ref("");
const qrUrl = ref("");

const target = computed(() =>
  boxId.value ? `${window.location.origin}/drop/${encodeURIComponent(boxId.value)}` : "",
);

// QR selalu hitam di atas putih agar mudah dipindai, termasuk di tema gelap.
watch(
  target,
  async (url) => {
    qrUrl.value = url
      ? await QRCode.toDataURL(url, { width: 512, margin: 2, color: { dark: "#111111", light: "#ffffff" } })
      : "";
  },
  { immediate: true },
);

function printPage() {
  window.print();
}

onMounted(async () => {
  try {
    boxId.value = (await getMeta()).boxId;
  } catch {
    boxId.value = "box1";
  }
});
</script>

<template>
  <section class="pt-4 text-center">
    <h1 class="text-2xl font-semibold tracking-tight">QR kotak</h1>
    <p class="mt-1 text-sm text-muted">
      Cetak dan tempel di kotak. Kurir memindainya dengan kamera atau Google Lens.
    </p>

    <div class="mx-auto mt-8 w-64 rounded-2xl border border-line bg-white p-3">
      <img v-if="qrUrl" :src="qrUrl" alt="QR code halaman input paket" class="w-full" />
      <div v-else class="aspect-square w-full"></div>
    </div>

    <p class="mt-4 break-all text-sm text-muted">{{ target }}</p>

    <div class="no-print mt-8 text-left">
      <label class="label" for="box">ID kotak</label>
      <input id="box" v-model.trim="boxId" class="field" type="text" maxlength="32" />
      <button type="button" class="btn btn-secondary mt-4" @click="printPage">
        <Printer class="size-4" />
        Cetak
      </button>
    </div>
  </section>
</template>
