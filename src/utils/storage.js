const PACKAGE_KEY = "smart-parcel-packages";

export function getPackages() {
  try {
    const saved = localStorage.getItem(PACKAGE_KEY);
    if (!saved) return [];

    const packages = JSON.parse(saved);
    const cleanedPackages = packages.map(({ compartment, ...item }) => item);

    // Bersihkan properti kompartemen dari data lama.
    if (packages.some((item) => Object.prototype.hasOwnProperty.call(item, "compartment"))) {
      localStorage.setItem(PACKAGE_KEY, JSON.stringify(cleanedPackages));
    }

    return cleanedPackages;
  } catch (error) {
    console.error("Gagal membaca data paket:", error);
    return [];
  }
}

export function savePackages(packages) {
  localStorage.setItem(PACKAGE_KEY, JSON.stringify(packages));
  window.dispatchEvent(new Event("packages-updated"));
}

export function addPackage(packageData) {
  const packages = getPackages();

  const trackingExists = packages.some(
    (item) => item.trackingNumber === packageData.trackingNumber,
  );

  if (trackingExists) {
    throw new Error("Nomor resi sudah terdaftar.");
  }

  const newPackage = {
    id: Date.now().toString(),
    ...packageData,
    status: "Tersimpan",
    createdAt: new Date().toISOString(),
  };

  packages.unshift(newPackage);
  savePackages(packages);

  return newPackage;
}

export function updatePackage(id, updates) {
  const packages = getPackages();

  const updated = packages.map((item) =>
    item.id === id ? { ...item, ...updates } : item,
  );

  savePackages(updated);
  return updated;
}
