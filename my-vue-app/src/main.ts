import { createApp } from 'vue'
import { clearUnknownCookies } from '@/utils/cookies'

clearUnknownCookies()

import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useBoardStore } from './stores/boardStore'

const pinia = createPinia()
const app = createApp(App)
  .use(pinia)
  .use(router)

import { useUserStore } from './stores/userStore'
const userStore = useUserStore(pinia)
userStore.fetchCurrentUser().finally(() => {
  app.mount('#app')
})

window.addEventListener('storage', (event: StorageEvent) => {
  if (event.key === 'currentBoardId') {
    const boardStore = useBoardStore(pinia)
    boardStore.currentBoardId = event.newValue ? Number(event.newValue) : null
  }
})
