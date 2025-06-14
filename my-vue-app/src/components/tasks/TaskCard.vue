<template>
  <div>
    <transition name="task-collapse">
      <div v-if="visible" :id="`task-${task.id}`"
        :class="[
          'bg-[var(--task)] text-[var(--task-foreground)] rounded-xl p-4 shadow flex flex-col gap-2 transition-all duration-200',
          { 'border-l-4 border-[var(--border-primary)]': isAssigned }
        ]"
        v-bind="$attrs"
      >
        <div class="flex items-center justify-between mb-1">
          <div class="flex flex-col items-start gap-1 min-w-0">
            <span
              class="text-xs font-semibold px-2 py-1 rounded-full text-white"
              :style="{ backgroundColor: task.tag.color }"
            >{{ task.tag.label }}</span>
            <span
              v-if="task.deadline"
              :class="['deadline-badge', 'text-xs px-1 py-1 rounded border border-border flex items-center gap-1 mt-0.3', deadlineBadgeClass(task.deadline)]"
              :title="formatDeadline(task.deadline)"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline align-middle"><g id="Calendar Event"><path id="Vector" d="M10.6667 2V4.66667M5.33335 2V4.66667M2.66669 7.33333H13.3334M4.00002 3.33333H12C12.7364 3.33333 13.3334 3.93029 13.3334 4.66667V12.6667C13.3334 13.403 12.7364 14 12 14H4.00002C3.26364 14 2.66669 13.403 2.66669 12.6667V4.66667C2.66669 3.93029 3.26364 3.33333 4.00002 3.33333ZM5.33335 10H6.66669V11.3333H5.33335V10Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>
              {{ formatDeadline(task.deadline) }}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild v-if="canEdit">
              <button class="text-muted-foreground hover:text-foreground text-xl mb-6"><span>...</span></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-32">
              <DropdownMenuItem v-if="canEdit" @click="openEditModal">Изменить</DropdownMenuItem>
              <DropdownMenuSeparator v-if="canEdit && (canAssign || canDelete)" />
              <DropdownMenuSub v-if="canAssign">
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
              <DropdownMenuSeparator v-if="canAssign && canDelete" />
              <DropdownMenuSub v-if="canAssign">
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
              <DropdownMenuSeparator v-if="canDelete && (canEdit || canAssign)" />
              <DropdownMenuItem v-if="canDelete" variant="destructive" @click="openDeleteModal">Удалить</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <div class="font-semibold text-base mb-1">{{ task.name }}</div>
          <div class="text-xs text-muted-foreground mb-1">{{ task.description }}</div>
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
        <div v-if="typeof task.progress === 'number'" class="w-full mt-2">
          <template v-if="!isBoardView">
            <div class="cursor-ew-resize" ref="progressContainer" @mousedown="onProgressMouseDown">
              <Progress :model-value="progressValue" />
            </div>
          </template>
          <template v-else>
            <div>
              <Progress :model-value="task.progress" />
            </div>
          </template>
        </div>
      </div>
    </transition>
    <TaskModal v-if="showEditModal" :task="task" @close="closeEditModal" @updated="onUpdated" />
    <TaskDeleteModal v-if="showDeleteModal" :task="task" @close="closeDeleteModal" @deleted="onDeleted" />
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useBoardRoles } from '@/composables/useBoardRoles'
import type { Task } from '../boards/types.ts'
import { useUserStore } from '@/stores/userStore'
import type { User } from '@/stores/userStore'
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
import Progress from '@/components/ui/progress/Progress.vue'

const props = defineProps<{ task: Task }>();

const progressValue = ref<number>(props.task.progress ?? 0)
const isDragging = ref(false)
const progressContainer = ref<HTMLElement | null>(null)

watch(() => props.task.progress, v => {
  progressValue.value = v ?? 0
})

function formatDeadline(deadline: string | null | undefined): string {
  if (!deadline) return ''
  const date = new Date(deadline)
  if (isNaN(date.getTime())) return deadline
  return format(date, 'dd.MM.yyyy')
}

function deadlineBadgeClass(deadline: string | null | undefined): string {
  if (!deadline) return ''
  const d = new Date(deadline)
  if (isNaN(d.getTime())) return ''
  const today = new Date()
  today.setHours(0,0,0,0)
  d.setHours(0,0,0,0)
  if (d < today) {
    return 'bg-[#ffe5e5] text-[#e23b3b] border-[#ffd6d6] dark:bg-[#2a0000] dark:text-[#ff8cc3] dark:border-[#ff8cc3]'
  } else if (d.getTime() === today.getTime()) {
    return 'bg-[#fffbe6] text-[#bfa900] border-[#ffe066] dark:bg-[#2d2a00] dark:text-[#ffe066] dark:border-[#ffe066]'
  } else {
    return 'bg-[#e6fff2] text-[#13c07c] border-[#bdf5d7] dark:bg-[#00331d] dark:text-[#13c07c] dark:border-[#13c07c]'
  }
}

const showEditModal = ref(false)
const showDeleteModal = ref(false)

const userStore = useUserStore()
const taskStore = useTaskStore()
const route = useRoute()
const boardId = Number(route.params.id)

const isBoardView = computed(() => !isNaN(boardId))

const boardUsersLocal = ref<User[]>([])

if (!isBoardView.value) {
  watch(
    () => props.task.boardId,
    async (id) => {
      if (!isNaN(id)) {
        await userStore.fetchUsersFromBoard(id)
        boardUsersLocal.value = userStore.boardUsers[id] || []
      }
    },
    { immediate: true }
  )
}

watch(() => props.task.boardId, (id) => {
  userStore.fetchUsersFromBoard(id)
}, { immediate: true })

const isAssigned = computed(() => assignedUsers.value.some(u => u.id === userStore.id))

const userRoles = computed(() => {
  const map: Record<number, string[]> = {}
  const entries = userStore.boardRolesCache[props.task.boardId] || []
  for (const entry of entries) {
    map[entry.user.id] = [...entry.boardRoles]
  }
  return map
})

// Список пользователей для назначения на задачу
const usersForAssignment = computed<User[]>(() => {
  return (userStore.boardRolesCache[props.task.boardId] || []).map(e => e.user)
})

// Список пользователей, которым задача еще не назначена
// Получить роли пользователя на доске из кэша boardRolesCache
function getUserBoardRole(user: User) {
  return userRoles.value[user.id] || []
}

const unassignedUsers = computed<User[]>(() => {
  return usersForAssignment.value.filter(u => {
    const roles = getUserBoardRole(u)
    return roles.includes('DEVELOPER') && !assignedUsers.value.some(a => a.id === u.id)
  })
})

// Список пользователей, которым задача назначена
const assignedUsers = computed<User[]>(() => props.task.assignees ?? [])

const priorityLabel: Record<string, string> = {
  HIGH: 'Важно',
  MEDIUM: 'Нормально',
  LOW: 'Не важно',
}

// назначить указанного пользователя к задаче и обновить список
async function assignToUser(user: User) {
  await taskStore.assignUser(props.task.id, user.id)
}

// отменить назначение указанного пользователя к задаче и обновить список
async function unassignUser(user: User) {
  await taskStore.unassignUser(props.task.id, user.id)
}

function openEditModal() {
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
}

async function onUpdated() {
}

function openDeleteModal() {
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

async function onDeleted() {
  handleDelete()
}

const visible = ref(true)

// Используем boardId из props.task.boardId, если нет — из маршрута
const fallbackBoardId = Number(route.params.id)
const effectiveBoardId = computed(() => {
  return typeof props.task.boardId === 'number' && !isNaN(props.task.boardId)
    ? props.task.boardId
    : (isNaN(fallbackBoardId) ? 0 : fallbackBoardId)
})
const { hasRole } = useBoardRoles(effectiveBoardId)
const canAssign = computed(() => hasRole('MANAGER'))
const canDelete = computed(() => hasRole('MANAGER'))
const isAssignedToMe = computed(() => assignedUsers.value.some(u => u.id === userStore.id))
const canEdit = computed(() => hasRole('MANAGER') || (hasRole('DEVELOPER') && isAssignedToMe.value))

watch(
  () => effectiveBoardId.value,
  (id: number) => {
    if (id && !userStore.userBoardRoles[id]) {
      userStore.fetchUserBoardRoles(id)
    }
  },
  { immediate: true }
)

function handleDelete() {
  visible.value = false
  setTimeout(() => emit('deleteTask', props.task), 250)
}

const emit = defineEmits(['updateTask', 'deleteTask', 'assignTask', 'assignToUser'])

function updateProgress(e: MouseEvent) {
  if (!progressContainer.value) return
  const rect = progressContainer.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const pct = Math.round(Math.min(Math.max(x / rect.width, 0), 1) * 100)
  progressValue.value = pct
}

function onProgressMouseMove(e: MouseEvent) {
  if (isDragging.value) updateProgress(e)
}

async function onProgressMouseUp(e: MouseEvent) {
  if (isDragging.value) {
    updateProgress(e)
    isDragging.value = false
    window.removeEventListener('mousemove', onProgressMouseMove)
    window.removeEventListener('mouseup', onProgressMouseUp)
    await taskStore.updateTask(props.task.id, { progress: progressValue.value })
  }
}

function onProgressMouseDown(e: MouseEvent) {
  isDragging.value = true
  updateProgress(e)
  window.addEventListener('mousemove', onProgressMouseMove)
  window.addEventListener('mouseup', onProgressMouseUp)
}
</script>

<style scoped>
.deadline-badge {
  max-width: 120px;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: center;
  vertical-align: center;
  line-height: 1.1;
}
.task-collapse-leave-active {
  transition: opacity 0.2s, max-height 0.25s cubic-bezier(.22,1.12,.36,1), margin 0.25s, padding 0.25s;
  overflow: hidden;
}
.task-collapse-leave-to {
  opacity: 0;
  max-height: 0;
  margin: 0;
  padding: 0;
}
.highlight {
  background-color: rgba(99, 102, 241, 0.2) !important;
  transition: background-color 0.3s ease;
}
</style>
