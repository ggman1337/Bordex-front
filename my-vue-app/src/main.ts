import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useBoardStore } from './stores/boardStore'

const pinia = createPinia()
createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')

window.addEventListener('storage', (event: StorageEvent) => {
  if (event.key === 'currentBoardId') {
    const boardStore = useBoardStore(pinia)
    boardStore.currentBoardId = event.newValue ? Number(event.newValue) : null
  }
})
