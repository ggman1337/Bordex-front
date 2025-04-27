<template>
  <div class="flex flex-col bg-[#f4f7fa] rounded-xl p-4 min-w-[320px] max-w-[340px] w-full">
    <div class="flex items-center mb-4">
      <span class="font-semibold text-lg flex-1">{{ column.title }}</span>
      <button class="ml-2 text-xl text-gray-400 hover:text-gray-600" @click="emit('createTask', column.id)">+</button>
    </div>
    <div class="flex flex-col gap-4">
      <TaskCard v-for="task in column.tasks" :key="task.id" :task="task" @updateTask="emit('updateTask', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TaskCard from '../tasks/TaskCard.vue'
import type { BoardColumn, Task } from './types.ts'

const { column } = defineProps<{ column: BoardColumn }>()
const emit = defineEmits<{
  (e: 'createTask', columnId: number): void
  (e: 'updateTask', task: Task): void
}>()
</script>

<style scoped>
</style>
