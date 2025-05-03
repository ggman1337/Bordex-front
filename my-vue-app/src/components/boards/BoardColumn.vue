<template>
  <div
    class="flex flex-col rounded-xl p-4 min-w-[320px] max-w-[340px] w-full bg-card text-card-foreground"
    @dragover.prevent
    @drop="onDrop"
  >
    <div class="bg-task text-task-foreground flex items-center mb-4">
      <span class="font-semibold text-lg flex-1">{{ column.title }}</span>
      <button class="ml-2 text-xl text-muted-foreground hover:text-foreground" @click="openCreateTaskModal">+</button>
    </div>
    <transition-group name="task-fade" tag="div" class="flex flex-col">
      <template v-for="(task, idx) in column.tasks" :key="task.id">
        <TaskCard
          v-if="task"
          :task="task"
          :style="{ marginBottom: idx !== column.tasks.length - 1 ? '16px' : '0' }"
          draggable="true"
          @dragstart="(event: globalThis.DragEvent) => onDragStart(task, event)"
          @updateTask="emit('updateTask', $event)"
          @deleteTask="emit('deleteTask', $event)"
        />
      </template>
    </transition-group>
  </div>
  <template v-if="showCreateModal">
    <TaskModal :board-id="boardId" @close="closeCreateTaskModal" @updated="handleTaskCreated" />
  </template>
</template>

<script setup lang="ts">
import TaskCard from '../tasks/TaskCard.vue'
import TaskModal from '../tasks/TaskModal.vue'
import type { BoardColumn, Task } from './types.ts'
import type { User } from '@/stores/userStore'
import { ref } from 'vue'

const props = defineProps<{ column: BoardColumn, boardId: number }>()
const emit = defineEmits<{
  (e: 'createTask', columnId: number): void
  (e: 'updateTask', task: Task | { id: number, status: 'NEW' | 'IN_PROGRESS' | 'DONE' }): void
  (e: 'deleteTask', task: Task): void
  (e: 'assignTask', userId: number): void
  (e: 'assignToUser', task: Task, user: User): void
}>()

const showCreateModal = ref(false)

function openCreateTaskModal() {
  showCreateModal.value = true
}
function closeCreateTaskModal() {
  showCreateModal.value = false
}
function handleTaskCreated() {
  showCreateModal.value = false
  // Можно добавить emit('taskCreated') если нужно обновить родителя
}

function onDragStart(task: Task, event: globalThis.DragEvent) {
  event.dataTransfer?.setData('taskId', String(task.id))
}

function onDrop(event: globalThis.DragEvent) {
  const taskId = event.dataTransfer?.getData('taskId')
  if (taskId) {
    let status: 'NEW' | 'IN_PROGRESS' | 'DONE' = 'NEW';
    if (props.column.title === 'В процессе') status = 'IN_PROGRESS';
    else if (props.column.title === 'Готово') status = 'DONE';
    emit('updateTask', { id: Number(taskId), status })
  }
}
</script>

<style scoped>
.task-fade-move {
  transition: transform 0.35s cubic-bezier(.22,1.12,.36,1);
  z-index: 1;
}
.task-fade-enter-active, .task-fade-leave-active {
  transition: opacity 0.2s, transform 0.35s cubic-bezier(.22,1.12,.36,1);
}
.task-fade-enter-from, .task-fade-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
.task-fade-enter-to, .task-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
