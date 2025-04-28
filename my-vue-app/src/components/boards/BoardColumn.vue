<template>
  <div class="flex flex-col rounded-xl p-4 min-w-[320px] max-w-[340px] w-full bg-card text-card-foreground">
    <div class="bg-task text-task-foreground flex items-center mb-4">
      <span class="font-semibold text-lg flex-1">{{ column.title }}</span>
      <button class="ml-2 text-xl text-muted-foreground hover:text-foreground" @click="emit('createTask', column.id)">+</button>
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
