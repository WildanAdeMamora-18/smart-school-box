import { database } from "../firebase/config";
import { ref, get, set, update, push, onValue } from "firebase/database";

// Mengambil seluruh data paket dari Firebase
export async function getPackages() {
  try {
    const packagesRef = ref(database, "packages");
    const snapshot = await get(packagesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();

    return Object.entries(data).map(([id, item]) => ({
      id,
      ...item,
    }));
  } catch (error) {
    console.error("Gagal mengambil data paket:", error);
    throw error;
  }
}

// Menambahkan paket baru ke Firebase
export async function addPackage(packageData) {
  const packages = await getPackages();

  // Memeriksa nomor resi duplikat
  const trackingExists = packages.some(
    (item) => item.trackingNumber === packageData.trackingNumber,
  );

  if (trackingExists) {
    throw new Error("Nomor resi sudah terdaftar.");
  }

  // Membuat ID paket dari Firebase
  const newPackageRef = push(ref(database, "packages"));
  const id = newPackageRef.key;

  const newPackage = {
    ...packageData,
    status: "Tersimpan",
    createdAt: new Date().toISOString(),
  };

  await set(newPackageRef, newPackage);

  return {
    id,
    ...newPackage,
  };
}

// Memperbarui data paket
export async function updatePackage(id, updates) {
  const packageRef = ref(database, `packages/${id}`);

  await update(packageRef, updates);

  return getPackages();
}

// Mendengarkan perubahan data secara real-time
export function subscribePackages(callback) {
  const packagesRef = ref(database, "packages");

  return onValue(packagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();

    const packages = Object.entries(data).map(([id, item]) => ({
      id,
      ...item,
    }));

    callback(packages);
  });
}
