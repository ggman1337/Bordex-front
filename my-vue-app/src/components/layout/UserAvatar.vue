<template>
  <Avatar>
    <AvatarImage src="https://github.com/unovue.png" alt="@unovue" />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
</script>

<style scoped>
.user-avatar { cursor: pointer; width: 32px; height: 32px; border-radius: 50%; background: #ccc; }
</style>
