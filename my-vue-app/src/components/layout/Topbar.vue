<template>
  <div class="topbar flex items-center justify-between w-full">
    <SearchBar />
    <div class="actions flex items-center gap-3 ml-auto">
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
.topbar {
  padding-left: 24px;
  padding-right: 0;
  height: 60px;
  min-width: 0;
  background: #f4f7fa;
}
.actions {
  gap: 16px;
}
</style>
