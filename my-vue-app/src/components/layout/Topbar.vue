<template>
  <div :class="['topbar flex items-center w-full bg-background text-foreground', route.name === 'Settings' ? 'justify-end' : 'justify-between']">
    <SearchBar v-if="route.name !== 'Settings'" />
    <div class="actions flex items-center gap-3 ml-3">
      <NotificationBell />
      <UserAvatar />
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from '@/components/layout/SearchBar.vue'
import NotificationBell from '@/components/layout/NotificationBell.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
.topbar {
  padding-left: 24px;
  padding-right: 0;
  height: 60px;
  min-width: 0;
}
.actions {
  gap: 16px;
}
</style>
