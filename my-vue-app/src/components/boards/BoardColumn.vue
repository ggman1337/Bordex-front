<template>
  <div
    class="flex flex-col rounded-xl p-4 min-w-[320px] max-w-[340px] w-full bg-card text-card-foreground"
    @dragover.prevent
    @drop="onDrop"
  >
    <div class="bg-task text-task-foreground flex items-center mb-4">
      <span class="font-semibold text-lg flex-1">{{ column.title }}</span>
      <button class="ml-2 text-xl text-muted-foreground hover:text-foreground" @click="emit('createTask', column.id)">+</button>
    </div>
    <transition-group name="task-fade" tag="div" class="flex flex-col gap-4">
      <template v-for="task in column.tasks" :key="task.id">
        <TaskCard
          v-if="task"
          :task="task"
          draggable="true"
          @dragstart="(event: globalThis.DragEvent) => onDragStart(task, event)"
          @updateTask="emit('updateTask', $event)"
          @deleteTask="emit('deleteTask', $event)"
        />
      </template>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import TaskCard from '../tasks/TaskCard.vue'
import type { BoardColumn, Task } from './types.ts'

const { column } = defineProps<{ column: BoardColumn }>()
const emit = defineEmits<{
  (e: 'createTask', columnId: number): void
  (e: 'updateTask', task: Task | { id: number, status: 'NEW' | 'IN_PROGRESS' | 'DONE' }): void
  (e: 'deleteTask', task: Task): void
}>()

function onDragStart(task: Task, event: globalThis.DragEvent) {
  event.dataTransfer?.setData('taskId', String(task.id))
}

function onDrop(event: globalThis.DragEvent) {
  const taskId = event.dataTransfer?.getData('taskId')
  if (taskId) {
    let status: 'NEW' | 'IN_PROGRESS' | 'DONE' = 'NEW';
    if (column.title === 'В процессе') status = 'IN_PROGRESS';
    else if (column.title === 'Готово') status = 'DONE';
    emit('updateTask', { id: Number(taskId), status })
  }
}
</script>

<style scoped>
.task-fade-move {
  transition: transform 0.2s;
}
.task-fade-enter-active, .task-fade-leave-active {
  transition: opacity 0.2s;
}
.task-fade-enter-from, .task-fade-leave-to {
  opacity: 0;
}
</style>
