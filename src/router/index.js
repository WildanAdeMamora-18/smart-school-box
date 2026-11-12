
import { createRouter, createWebHistory } from 'vue-router'

import RoleSelectionView from '../views/RoleSelectionView.vue'

// Halaman Kurir
import CourierDashboardView from '../views/courier/CourierDashboardView.vue'
import AddPackageView from '../views/courier/AddPackageView.vue'
import CourierPackagesView from '../views/courier/CourierPackagesView.vue'

// Halaman Penerima
import RecipientDashboardView from '../views/recipient/RecipientDashboardView.vue'
import MyPackagesView from '../views/recipient/MyPackagesView.vue'
import PackageDetailView from '../views/recipient/PackageDetailView.vue'
import PickupView from '../views/recipient/PickupView.vue'
import HistoryView from '../views/recipient/HistoryView.vue'

const routes = [
  {
    path: '/',
    name: 'role-selection',
    component: RoleSelectionView,
  },

  // ROUTE KURIR
  {
    path: '/courier',
    name: 'courier-dashboard',
    component: CourierDashboardView,
  },
  {
    path: '/courier/add-package',
    name: 'add-package',
    component: AddPackageView,
  },
  {
    path: '/courier/packages',
    name: 'courier-packages',
    component: CourierPackagesView,
  },

  // ROUTE PENERIMA
  {
    path: '/recipient',
    name: 'recipient-dashboard',
    component: RecipientDashboardView,
  },
  {
    path: '/recipient/packages',
    name: 'my-packages',
    component: MyPackagesView,
  },
  {
    path: '/recipient/packages/:id',
    name: 'package-detail',
    component: PackageDetailView,
  },
  {
    path: '/recipient/packages/:id/pickup',
    name: 'pickup-package',
    component: PickupView,
  },
  {
    path: '/recipient/history',
    name: 'recipient-history',
    component: HistoryView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
