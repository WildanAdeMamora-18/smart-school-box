<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { Camera, Check, ImagePlus, X } from "lucide-vue-next";
import { createPackage, getMeta, getResidents } from "../../utils/api";
import { compressImage } from "../../utils/image";
import { addHistory } from "../../utils/history";

const route = useRoute();
const COURIER_KEY = "parcel:lastCourier";

const loading = ref(true);
const loadError = ref("");
const residents = ref([]);
const couriers = ref([]);
const boxId = ref(route.params.boxId || "");

const form = reactive({
  residentId: "",
  courier: localStorage.getItem(COURIER_KEY) || "",
  trackingNumber: "",
});

const photo = ref(null);
const photoPreview = ref("");
const photoBusy = ref(false);
const submitting = ref(false);
const error = ref("");
const done = ref(null);

const canSubmit = computed(
  () => form.residentId && form.courier && !submitting.value && !photoBusy.value,
);

async function load() {
  loading.value = true;
  loadError.value = "";
  try {
    const [meta, list] = await Promise.all([getMeta(), getResidents()]);
    couriers.value = meta.couriers;
    residents.value = list;
    if (!boxId.value) boxId.value = meta.boxId;
    if (!couriers.value.includes(form.courier)) form.courier = "";
  } catch (err) {
    loadError.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
onBeforeUnmount(clearPhoto);

function clearPhoto() {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
  photo.value = null;
  photoPreview.value = "";
}

async function onPhoto(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  error.value = "";
  photoBusy.value = true;
  try {
    const blob = await compressImage(file);
    clearPhoto();
    photo.value = blob;
    photoPreview.value = URL.createObjectURL(blob);
  } catch (err) {
    error.value = err.message;
  } finally {
    photoBusy.value = false;
  }
}

async function submit() {
  if (!canSubmit.value) return;
  error.value = "";
  submitting.value = true;

  try {
    const body = new FormData();
    body.append("residentId", form.residentId);
    body.append("courier", form.courier);
    body.append("boxId", boxId.value);
    if (form.trackingNumber.trim()) body.append("trackingNumber", form.trackingNumber.trim());
    if (photo.value) body.append("photo", photo.value, "photo.jpg");

    const result = await createPackage(body);
    addHistory(result);
    localStorage.setItem(COURIER_KEY, form.courier);
    done.value = result;
  } catch (err) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
}

function reset() {
  done.value = null;
  form.residentId = "";
  form.trackingNumber = "";
  error.value = "";
  clearPhoto();
}
</script>

<template>
  <!-- Berhasil -->
  <section v-if="done" class="pt-10 text-center">
    <div
      class="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent"
    >
      <Check class="size-7" />
    </div>
    <h1 class="mt-5 text-2xl font-semibold tracking-tight">Paket tercatat</h1>
    <p class="mt-2 text-[15px] text-muted">
      {{ done.resident }} sudah diberi tahu. Silakan masukkan paket ke kotak.
    </p>

    <dl class="card mt-8 divide-y divide-line text-left text-[15px]">
      <div class="flex justify-between gap-4 px-4 py-3">
        <dt class="text-muted">Ekspedisi</dt>
        <dd class="font-medium">{{ done.courier }}</dd>
      </div>
      <div v-if="done.trackingNumber" class="flex justify-between gap-4 px-4 py-3">
        <dt class="text-muted">Resi</dt>
        <dd class="font-medium">{{ done.trackingNumber }}</dd>
      </div>
      <div class="flex justify-between gap-4 px-4 py-3">
        <dt class="text-muted">Waktu</dt>
        <dd class="font-medium">
          {{ new Date(done.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) }}
        </dd>
      </div>
    </dl>

    <button type="button" class="btn btn-primary mt-6" @click="reset">Input paket lain</button>
    <RouterLink to="/history" class="btn btn-secondary mt-3">Lihat riwayat</RouterLink>
  </section>

  <!-- Memuat / gagal memuat -->
  <section v-else-if="loading" class="pt-16 text-center text-[15px] text-muted">
    Memuat data…
  </section>

  <section v-else-if="loadError" class="pt-10">
    <div class="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{{ loadError }}</div>
    <button type="button" class="btn btn-secondary mt-4" @click="load">Coba lagi</button>
  </section>

  <!-- Form -->
  <form v-else class="space-y-7 pt-4" @submit.prevent="submit">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Input paket</h1>
      <p v-if="boxId" class="mt-1 text-sm text-muted">Kotak {{ boxId }}</p>
    </div>

    <div>
      <label class="label" for="resident">Penerima</label>
      <select id="resident" v-model="form.residentId" class="field">
        <option value="" disabled>Pilih nama penghuni</option>
        <option v-for="r in residents" :key="r.id" :value="r.id">{{ r.label }}</option>
      </select>
    </div>

    <div>
      <span class="label">Ekspedisi</span>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          v-for="name in couriers"
          :key="name"
          type="button"
          :aria-pressed="form.courier === name"
          class="h-12 rounded-xl border px-3 text-sm font-medium transition"
          :class="
            form.courier === name
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-line bg-surface text-fg hover:bg-surface-2'
          "
          @click="form.courier = name"
        >
          {{ name }}
        </button>
      </div>
    </div>

    <div>
      <label class="label" for="tracking">
        Nomor resi <span class="font-normal text-muted">(opsional)</span>
      </label>
      <input
        id="tracking"
        v-model="form.trackingNumber"
        class="field"
        type="text"
        inputmode="text"
        autocomplete="off"
        maxlength="40"
        placeholder="Contoh: JP1234567890"
      />
    </div>

    <div>
      <span class="label">
        Foto paket <span class="font-normal text-muted">(opsional)</span>
      </span>

      <div v-if="photoPreview" class="relative overflow-hidden rounded-2xl border border-line">
        <img :src="photoPreview" alt="Pratinjau foto paket" class="max-h-64 w-full object-cover" />
        <button
          type="button"
          class="absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-full bg-black/60 text-white"
          aria-label="Hapus foto"
          @click="clearPhoto"
        >
          <X class="size-4" />
        </button>
      </div>

      <div v-else class="grid grid-cols-2 gap-3">
        <label class="btn btn-secondary cursor-pointer">
          <Camera class="size-4" />
          Kamera
          <input type="file" accept="image/*" capture="environment" class="sr-only" @change="onPhoto" />
        </label>
        <label class="btn btn-secondary cursor-pointer">
          <ImagePlus class="size-4" />
          Galeri
          <input type="file" accept="image/*" class="sr-only" @change="onPhoto" />
        </label>
      </div>
      <p v-if="photoBusy" class="mt-2 text-sm text-muted">Memproses foto…</p>
    </div>

    <div v-if="error" class="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
      {{ error }}
    </div>

    <button type="submit" class="btn btn-primary" :disabled="!canSubmit">
      <span
        v-if="submitting"
        class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      ></span>
      {{ submitting ? "Menyimpan…" : "Simpan paket" }}
    </button>
  </form>
</template>
