<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { clearUnknownCookies } from '@/utils/cookies'
import { useColorMode } from '@vueuse/core'
import { Toaster } from 'vue-sonner'
import { useBoardStore } from '@/stores/boardStore'
import { useUserStore } from '@/stores/userStore'

const boardStore = useBoardStore()
const userStore = useUserStore()
const router = useRouter()

onMounted(async () => {
  clearUnknownCookies()
  if (window.Telegram?.WebApp?.initData) {
    await userStore.loginViaTelegram(window.Telegram.WebApp.initData)
    await userStore.fetchCurrentUser()
    router.replace('/')
    return
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
</script>

<template>
  <router-view />
  <Toaster />
</template>
