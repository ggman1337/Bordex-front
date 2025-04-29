<template>
  <div
    class="bg-[var(--task)] text-[var(--task-foreground)] rounded-xl p-4 shadow flex flex-col gap-2 transition-all duration-200"
    :class="[
      { 'border-l-4 border-[var(--border-primary)]': isAssigned },
      isDragging ? 'z-20 shadow-2xl scale-105 opacity-80' : ''
    ]"
    @dragstart.self="onDragStart"
    @dragend.self="onDragEnd"
    draggable="true"
    v-bind="$attrs"
  >
    <div class="flex items-center justify-between mb-1">
      <span
        class="text-xs font-semibold px-2 py-1 rounded-full text-white"
        :style="{ backgroundColor: task.tag.color }"
      >{{ task.tag.label }}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button class="text-muted-foreground hover:text-foreground text-xl"><span>...</span></button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-32">
          <DropdownMenuItem @click="openEditModal">Изменить</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Назначить
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="min-w-[160px] py-1">
              <DropdownMenuItem
                v-for="user in unassignedUsers"
                :key="user.id"
                @click="assignToUser(user)"
                class="px-4 py-2"
              >
                {{ user.username }}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Снять
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="min-w-[160px] py-1">
              <DropdownMenuItem
                v-for="user in assignedUsers"
                :key="user.id"
                @click="unassignUser(user)"
                class="px-4 py-2"
              >
                {{ user.username }}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" @click="openDeleteModal">Удалить</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div>
      <div class="font-semibold text-base mb-1">{{ task.name }}</div>
      <div class="text-xs text-muted-foreground">{{ task.description }}</div>
    </div>
    <div class="flex items-center mt-2 relative">
      <div class="flex -space-x-2">
        <template v-for="user in assignedUsers" :key="user.id">
          <span
            :title="`${user.firstName} ${user.lastName}`"
            class="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold border-2 border-border shadow"
          >{{ user.firstName?.[0] || '' }}{{ user.lastName?.[0] || '' }}</span>
        </template>
      </div>
      <span
        v-if="task.priority"
        :class="[
          'absolute right-0 bottom-0 mb-1 mr-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase z-10 transition-colors duration-200',
          task.priority === 'HIGH' ? 'bg-[#ffe5e5] text-[#e23b3b] border border-[#ffd6d6] shadow-[0_2px_8px_0_rgba(255,80,80,0.12)] dark:bg-[#2a0000] dark:text-[#ff8cc3] dark:border-[#ff8cc3] dark:shadow-[0_2px_8px_0_rgba(255,140,195,0.18)]' : '',
          task.priority === 'MEDIUM' ? 'bg-[#fffbe6] text-[#bfa900] border border-[#ffe066] shadow-[0_2px_8px_0_rgba(255,224,102,0.12)] dark:bg-[#2d2a00] dark:text-[#ffe066] dark:border-[#ffe066] dark:shadow-[0_2px_8px_0_rgba(255,224,102,0.18)]' : '',
          task.priority === 'LOW' ? 'bg-[#e6fff2] text-[#13c07c] border border-[#bdf5d7] shadow-[0_2px_8px_0_rgba(19,192,124,0.12)] dark:bg-[#00331d] dark:text-[#13c07c] dark:border-[#13c07c] dark:shadow-[0_2px_8px_0_rgba(19,192,124,0.18)]' : ''
        ]"
        :title="priorityLabel[task.priority]"
      >
        {{ priorityLabel[task.priority] }}
      </span>
    </div>
  </div>
  <TaskModal v-if="showEditModal" :task="task" @close="closeEditModal" @updated="onUpdated" />
  <TaskDeleteModal v-if="showDeleteModal" :task="task" @close="closeDeleteModal" @deleted="onDeleted" />
</template>

<script setup lang="ts">
import type { Task } from '../boards/types.ts'
import { useUserStore } from '@/stores/userStore.ts'
import type { User } from '@/stores/userStore.ts'
import { computed, ref, watch } from 'vue'
import DropdownMenu from '@/components/ui/dropdown-menu/DropdownMenu.vue'
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { useTaskStore } from '@/stores/taskStore.ts'
import { useRoute } from 'vue-router'
import TaskModal from './TaskModal.vue'
import TaskDeleteModal from './TaskDeleteModal.vue'

// props
const { task } = defineProps<{ task: Task }>()

// modal state
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const userStore = useUserStore()
const taskStore = useTaskStore()
const route = useRoute()
const boardId = Number(route.params.id)

// Fetch board users for assignment dropdown when task changes
watch(() => task.boardId, (id) => {
  userStore.fetchUsersFromBoard(id)
}, { immediate: true })

// check if current user is assigned to the task
const isAssigned = computed(() => assignedUsers.value.some(u => u.id === userStore.id))

// directly use task.assignees as array of User objects
const assignedUsers = computed<User[]>(() => task.assignees ?? [])

// users not yet assigned to this task
const unassignedUsers = computed<User[]>(() =>
  userStore.users.filter(u => !assignedUsers.value.some(a => a.id === u.id))
)

const priorityLabel: Record<string, string> = {
  HIGH: 'Важно',
  MEDIUM: 'Нормально',
  LOW: 'Не важно',
}

const isDragging = ref(false)

function onDragStart(e: DragEvent) {
  e.dataTransfer?.setData('taskId', String(task.id));
  isDragging.value = true;
}

function onDragEnd(e: DragEvent) {
  isDragging.value = false
}

// Determine board context: boardId if on BoardPage, NaN on My Tasks
const isBoardView = computed(() => !isNaN(boardId))

// Refresh tasks list based on context (board or My Tasks)
async function refreshTasks() {
  if (isBoardView.value) {
    await taskStore.fetchTasks(boardId)
  } else {
    await taskStore.fetchTasksForUser(userStore.id)
  }
}

// назначить указанного пользователя к задаче и обновить список
async function assignToUser(user: User) {
  await taskStore.assignUser(task.id, user.id)
  await refreshTasks()
}

// отменить назначение указанного пользователя к задаче и обновить список
async function unassignUser(user: User) {
  await taskStore.unassignUser(task.id, user.id)
  await refreshTasks()
}

// edit modal handlers
function openEditModal() {
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
}

async function onUpdated() {
  await refreshTasks()
}

// delete modal handlers
function openDeleteModal() {
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

async function onDeleted() {
  await refreshTasks()
}

const emit = defineEmits(['dragstart', 'updateTask', 'deleteTask'])
</script>

<style scoped>
</style>
