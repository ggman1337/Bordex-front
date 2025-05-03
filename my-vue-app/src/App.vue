<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { Toaster } from 'vue-sonner'
// Apply 'dark' class on <html> based on system or saved preference
useColorMode({ attribute: 'class' })
</script>

<template>
  <router-view />
  <Toaster />
</template>
