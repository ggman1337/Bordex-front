<template>
  <Avatar class="user-avatar">
    <AvatarFallback>{{ initials }}</AvatarFallback>
  </Avatar>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUserStore } from '@/stores/userStore.ts'
import { computed } from 'vue'

const store = useUserStore()
const user = computed(() => store.getUserById(store.id))
const initials = computed(() => {
  if (user.value) {
    const { firstName, lastName, username } = user.value
    if (firstName && lastName) return firstName[0].toUpperCase() + lastName[0].toUpperCase()
    if (firstName) return firstName[0].toUpperCase()
    if (username) return username[0].toUpperCase()
  }
  return 'U' // placeholder если пользователь не загружен
})
</script>

<style scoped>
.user-avatar { cursor: pointer; width: 32px; height: 32px; border-radius: 50%; background: #ccc; margin-right: 1rem; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem; color: #222; }
</style>
