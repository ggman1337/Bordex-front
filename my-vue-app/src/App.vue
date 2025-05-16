<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { clearUnknownCookies } from '@/utils/cookies'
import { useColorMode } from '@vueuse/core'
import { Toaster } from 'vue-sonner'
import { useBoardStore } from '@/stores/boardStore'
import { useUserStore } from '@/stores/userStore'

const boardStore = useBoardStore()
const userStore = useUserStore()

// Debug Telegram initData
const initDataRaw = ref('')
const initDataParsed = ref<Record<string,string>>({})

onMounted(async () => {
  clearUnknownCookies()
  
  if (window.Telegram?.WebApp?.initData) {
    initDataRaw.value = window.Telegram.WebApp.initData
    try {
      initDataParsed.value = Object.fromEntries(
        window.Telegram.WebApp.initData.split('&').map(p => p.split('=').map(decodeURIComponent))
      )
    } catch {}
    await userStore.loginViaTelegram(window.Telegram.WebApp.initData)
  }
  if (!userStore.userLoaded) {
    await userStore.fetchCurrentUser()
  }
  if (userStore.id) await boardStore.connectUserBoardRealtime(userStore.id)
})

onBeforeUnmount(() => {
  if (userStore.id) boardStore.disconnectUserBoardRealtime(userStore.id)
})

useColorMode({ attribute: 'class' })
// end script setup
</script>

<template>
  <div v-if="initDataRaw" style="background:#f9fafb;padding:1rem;border-bottom:1px solid #ddd;">
    <strong>Telegram initData:</strong>
    <p>{{ initDataRaw }}</p>
    <strong>Parsed:</strong>
    <pre>{{ initDataParsed }}</pre>
  </div>
  <router-view />
  <Toaster />
</template>
