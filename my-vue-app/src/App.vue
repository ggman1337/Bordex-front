<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
// Apply 'dark' class on <html> based on system or saved preference
useColorMode({ attribute: 'class' })
</script>

<template>
  <router-view />
</template>
