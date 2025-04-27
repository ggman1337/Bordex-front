<template>
  <div class="bg-white rounded-xl p-4 shadow flex flex-col gap-2" :class="{ 'border-l-4 border-blue-500': isAssigned }">
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs font-semibold px-2 py-1 rounded-full" :class="task.tag?.color ?? ''">{{ task.tag?.label ?? '' }}</span>
      <button class="text-gray-400 hover:text-gray-600 text-xl" @click="emit('updateTask', task)"><span>...</span></button>
    </div>
    <div>
      <div class="font-semibold text-base mb-1">{{ task.title }}</div>
      <div class="text-xs text-gray-500">{{ task.description }}</div>
    </div>
    <div class="flex items-center mt-2">
      <div class="flex -space-x-2">
        <template v-for="(avatar, idx) in avatarsToShow" :key="idx">
          <img v-if="avatar.img" :src="avatar.img" class="w-6 h-6 rounded-full border-2 border-white shadow object-cover" />
          <span v-else class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow">{{ avatar.initials }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, Avatar } from '../boards/types.ts'
import { useUserStore } from '@/stores/userStore.ts'
import { computed } from 'vue'

// событие редактирования задачи
const emit = defineEmits<{
  (e: 'updateTask', task: Task): void;
}>()

const { task } = defineProps<{ task: Task }>()
const userStore = useUserStore()

const isAssigned = computed(() => 
  task.assignees?.includes(userStore.id)
)

const avatarsToShow = computed(() => 
  task.assignees
    ?.map(id => userStore.getUserById(id)?.avatar)
    .filter((a): a is Avatar => !!a) || []
)
</script>

<style scoped>
</style>
