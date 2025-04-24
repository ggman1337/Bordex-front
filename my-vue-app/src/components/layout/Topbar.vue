<template>
  <div class="topbar">
    <SearchBar />
    <div class="actions">
      <NotificationBell />
      <UserAvatar />
    </div>
  </div>
</template>

<script setup>
import SearchBar from '@/components/layout/SearchBar.vue'
import NotificationBell from '@/components/layout/NotificationBell.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
</script>

<style scoped>
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 0 16px; height: 60px; }
.actions { display: flex; align-items: center; gap: 12px; }
</style>
