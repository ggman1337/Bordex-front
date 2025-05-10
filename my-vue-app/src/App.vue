<script setup lang="ts">
import { onMounted } from 'vue'
import { clearUnknownCookies } from '@/utils/cookies'
import { useColorMode } from '@vueuse/core'
import { Toaster } from 'vue-sonner'

onMounted(() => {
  clearUnknownCookies()
})

// Apply 'dark' class on <html> based on system or saved preference
useColorMode({ attribute: 'class' })
</script>

<template>
  <router-view />
  <Toaster />
</template>
