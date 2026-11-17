import { testFirebaseConnection } from './firebase/testConnection'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

testFirebaseConnection()

createApp(App)
  .use(router)
  .mount('#app')
  
