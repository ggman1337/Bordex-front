<template>
  <Avatar class="user-avatar">
    <AvatarImage v-if="avatar.img" :src="avatar.img" :alt="store.name" />
    <AvatarFallback v-else>{{ avatar.initials }}</AvatarFallback>
  </Avatar>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/stores/userStore'
import { computed } from 'vue'

const store = useUserStore()
const avatar = computed(() => store.avatar)
</script>

<style scoped>
.user-avatar { cursor: pointer; width: 32px; height: 32px; border-radius: 50%; background: #ccc; }
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
</style>
