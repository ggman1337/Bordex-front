<template>
  <Avatar class="user-avatar fixed right-4 top-4">
    <AvatarImage src="https://vkplay.ru/pre_0x736_resize/hotbox/content_files/news/2022/12/19/6c80e15a83144b22955d6e7379cde0ec.jpg?quality=85" alt="@unovue" />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
</script>

<style scoped>
.user-avatar { cursor: pointer; width: 32px; height: 32px; border-radius: 50%; background: #ccc; }
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
</style>
