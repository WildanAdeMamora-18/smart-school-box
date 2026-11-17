
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0OLfdXfquyLJlPSBUyFCF8MxcW8DMU-U",
  authDomain: "smart-parcel-box-c8ef0.firebaseapp.com",
  databaseURL: "https://smart-parcel-box-c8ef0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-parcel-box-c8ef0",
  storageBucket: "smart-parcel-box-c8ef0.firebasestorage.app",
  messagingSenderId: "673925060921",
  appId: "1:673925060921:web:4f030af5b1f5f66e0cf0e8",
  measurementId: "G-9BBHPWRY79"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig)

// Menghubungkan Realtime Database
const database = getDatabase(app)

export { app, database }
