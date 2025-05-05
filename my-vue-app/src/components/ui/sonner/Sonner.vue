<script lang="ts" setup>
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner'
import { useColorMode, usePreferredDark } from '@vueuse/core'
import { computed, watchEffect } from 'vue'

const props = defineProps<ToasterProps>()
const mode = useColorMode()
const isSystemDark = usePreferredDark()

const sonnerTheme = computed(() => {
  if (mode.value === 'auto') {
    return isSystemDark.value ? 'dark' : 'light'
  }
  return mode.value
})

watchEffect(() => {
  console.log('Sonner theme:', sonnerTheme.value)
})
</script>

<template>
  <Sonner
    v-bind="props"
    :theme="sonnerTheme"
    :key="sonnerTheme"
    class="toaster group"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
    }"
  />
</template>

<style scoped>
.toaster {
  /* Светлая тема */
  background: var(--popover, #fff);
  color: var(--popover-foreground, #222);
  border: 1px solid var(--border, #e5e7eb);
}
.dark .toaster {
  background: #23242a !important;
  color: #fff !important;
  border-color: #404040 !important;
}
</style>
