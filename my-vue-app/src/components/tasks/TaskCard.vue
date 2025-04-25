<template>
  <div class="bg-white rounded-xl p-4 shadow flex flex-col gap-2">
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs font-semibold px-2 py-1 rounded-full" :class="task.tag.color">{{ task.tag.label }}</span>
      <button class="text-gray-400 hover:text-gray-600 text-xl"><span>...</span></button>
    </div>
    <div>
      <div class="font-semibold text-base mb-1">{{ task.title }}</div>
      <div class="text-xs text-gray-500">{{ task.description }}</div>
    </div>
    <div class="flex items-center mt-2">
      <div class="flex -space-x-2">
        <template v-for="(avatar, idx) in task.avatars" :key="idx">
          <img v-if="avatar.img" :src="avatar.img" class="w-6 h-6 rounded-full border-2 border-white shadow" />
          <span v-else class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow">{{ avatar.initials }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '../boards/types.ts'

defineProps<{ task: Task }>()
</script>

<style scoped>
</style>
