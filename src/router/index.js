import { createRouter, createWebHistory } from 'vue-router'

import CourierLayout from '../layouts/CourierLayout.vue'
import CourierDashboardView from '../views/courier/CourierDashboardView.vue'
import AddPackageView from '../views/courier/AddPackageView.vue'
import CourierPackagesView from '../views/courier/CourierPackagesView.vue'
import QrView from '../views/courier/QrView.vue'

// Halaman penerima di web dibekukan (dipindah ke aplikasi Flutter).
// Rute tetap ada agar pekerjaan sebelumnya tidak hilang, tetapi tidak ditautkan dari mana pun.
import RoleSelectionView from '../views/RoleSelectionView.vue'
import RecipientDashboardView from '../views/recipient/RecipientDashboardView.vue'
import MyPackagesView from '../views/recipient/MyPackagesView.vue'
import PackageDetailView from '../views/recipient/PackageDetailView.vue'
import PickupView from '../views/recipient/PickupView.vue'
import HistoryView from '../views/recipient/HistoryView.vue'

const routes = [
  {
    path: '/',
    component: CourierLayout,
    children: [
      { path: '', name: 'home', component: CourierDashboardView },
      { path: 'drop/:boxId?', name: 'add-package', component: AddPackageView },
      { path: 'history', name: 'courier-history', component: CourierPackagesView },
      { path: 'qr', name: 'box-qr', component: QrView },
    ],
  },

  // --- Dibekukan ---
  { path: '/roles', name: 'role-selection', component: RoleSelectionView },
  { path: '/recipient', name: 'recipient-dashboard', component: RecipientDashboardView },
  { path: '/recipient/packages', name: 'my-packages', component: MyPackagesView },
  { path: '/recipient/packages/:id', name: 'package-detail', component: PackageDetailView },
  { path: '/recipient/packages/:id/pickup', name: 'pickup-package', component: PickupView },
  { path: '/recipient/history', name: 'recipient-history', component: HistoryView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
