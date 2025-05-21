<template>
  <div
    class="flex-none flex flex-col rounded-xl p-4 min-w-[320px] max-w-[340px] bg-card text-card-foreground"
    @dragover.prevent
    @drop.prevent="onDrop($event, column.status)"
  >
    <div class="bg-task text-task-foreground flex items-center mb-4">
      <span class="font-semibold text-lg flex-1">{{ column.title }}</span>
      <button
        v-if="canCreateTask"
        class="ml-2 text-xl text-muted-foreground hover:text-foreground"
        @click="openCreateTaskModal"
      >+</button>
    </div>
    <transition-group
      name="task-fade"
      tag="div"
      class="flex flex-col min-h-[100px]"
    >
      <div
        v-for="(task, idx) in column.tasks"
        :key="task.id"
        :draggable="canDragTask(task)"
        @dragstart="e => canDragTask(task) && onDragStart(e, task)"
        :style="{ marginBottom: idx !== column.tasks.length - 1 ? '16px' : '0' }"
      >
        <TaskCard
          :task="task"
          @updateTask="emit('updateTask', $event)"
          @deleteTask="emit('deleteTask', $event)"
        />
      </div>
    </transition-group>
  </div>
  <template v-if="showCreateModal">
    <TaskModal :board-id="boardId" :status="statusForModal" @close="closeCreateTaskModal" @updated="handleTaskCreated" />
  </template>
</template>

<script setup lang="ts">

import TaskCard from '../tasks/TaskCard.vue'
import TaskModal from '../tasks/TaskModal.vue'
import type { BoardColumn, Task } from './types.ts'
import type { User } from '@/stores/userStore'
import { ref, computed } from 'vue'
import { Status } from '@/components/boards/types'
import { useBoardRoles } from '@/composables/useBoardRoles'
import { useUserStore } from '@/stores/userStore'
import { useBoardStore } from '@/stores/boardStore'

const props = defineProps<{ column: BoardColumn, boardId: number }>()
const emit = defineEmits<{
  (e: 'createTask', payload: { columnId: number, status: Status }): void
  (e: 'updateTask', payload: { id: number, status: Status }): void
  (e: 'deleteTask', task: Task): void
  (e: 'assignTask', userId: number): void
  (e: 'assignToUser', task: Task, user: User): void
}>()

const showCreateModal = ref(false)

const statusForModal = computed<Status>(() => props.column.status)

const { hasAnyRole } = useBoardRoles(props.boardId)
const userStore = useUserStore()
const boardStore = useBoardStore()
const userId = computed(() => userStore.id)
const boardOwnerId = computed(() => boardStore.boardById(props.boardId)?.owner.id)
const isManager = computed(() => hasAnyRole('MANAGER'))
const isOwner = computed(() => userId.value === boardOwnerId.value)
const isDeveloper = computed(() => hasAnyRole('DEVELOPER'))
const canCreateTask = computed(() => isManager.value || isOwner.value)

function canDragTask(task: Task) {
  if (isOwner.value || isManager.value) return true
  if (isDeveloper.value) {
    return task.assignees?.some(a => a.id === userId.value) ?? false
  }
  return false
}

function openCreateTaskModal() {
  showCreateModal.value = true;
}

function closeCreateTaskModal() {
  showCreateModal.value = false
}

function handleTaskCreated() {
  showCreateModal.value = false
}

function onDragStart(e: DragEvent, task: Task) {
  e.dataTransfer?.setData('taskId', task.id.toString());
}

function onDrop(e: DragEvent, status: Status) {
  e.preventDefault();
  const id = Number(e.dataTransfer?.getData('taskId'));
  emit('updateTask', { id, status });
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
