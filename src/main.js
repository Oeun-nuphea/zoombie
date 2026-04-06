import { createApp } from 'vue'

import App from './App.vue'
import './assets/styles/main.css'
import { registerProviders } from './app/providers'

function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration is optional enhancement.
    })
  })
}

const app = createApp(App)

registerProviders(app)
registerServiceWorker()

app.mount('#app')
