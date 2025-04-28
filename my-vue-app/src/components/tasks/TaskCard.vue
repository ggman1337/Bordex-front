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
          <DropdownMenuItem @click="emit('updateTask', task)">Изменить</DropdownMenuItem>
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
          <DropdownMenuItem variant="destructive" @click="emit('deleteTask', task)">Удалить</DropdownMenuItem>
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
          task.priority === 'HIGH' && !$attrs['data-theme-dark'] ? 'bg-[#ffe5e5] text-[#e23b3b] border border-[#ffd6d6] shadow-[0_2px_8px_0_rgba(255,80,80,0.12)]' : '',
          task.priority === 'HIGH' && $attrs['data-theme-dark'] ? 'bg-[#2a0000] text-[#ff8cc3] border border-[#ff8cc3] shadow-[0_2px_8px_0_rgba(255,140,195,0.18)]' : '',
          task.priority === 'MEDIUM' && !$attrs['data-theme-dark'] ? 'bg-[#fffbe6] text-[#bfa900] border border-[#ffe066] shadow-[0_2px_8px_0_rgba(255,224,102,0.12)]' : '',
          task.priority === 'MEDIUM' && $attrs['data-theme-dark'] ? 'bg-[#2d2a00] text-[#ffe066] border border-[#ffe066] shadow-[0_2px_8px_0_rgba(255,224,102,0.18)]' : '',
          task.priority === 'LOW' && !$attrs['data-theme-dark'] ? 'bg-[#e6fff2] text-[#13c07c] border border-[#bdf5d7] shadow-[0_2px_8px_0_rgba(19,192,124,0.12)]' : '',
          task.priority === 'LOW' && $attrs['data-theme-dark'] ? 'bg-[#00331d] text-[#13c07c] border border-[#13c07c] shadow-[0_2px_8px_0_rgba(19,192,124,0.18)]' : ''
        ]"
        :title="priorityLabel[task.priority]"
      >
        {{ priorityLabel[task.priority] }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '../boards/types.ts'
import { useUserStore } from '@/stores/userStore.ts'
import type { User } from '@/stores/userStore.ts'
import { computed } from 'vue'
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
import { ref } from 'vue'

// события задачи: редактирование, удаление, назначение
const emit = defineEmits<{
  (e: 'updateTask', task: Task): void;
  (e: 'deleteTask', task: Task): void;
  (e: 'assignTask', task: Task): void;
  (e: 'assignToUser', user: User): void;
  (e: 'unassignUser', user: User): void;
}>()

const { task } = defineProps<{ task: Task }>()
const userStore = useUserStore()
const taskStore = useTaskStore()
const route = useRoute()
const boardId = Number(route.params.id)

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
  isDragging.value = true
}

function onDragEnd(e: DragEvent) {
  isDragging.value = false
}

// назначить указанного пользователя к задаче и обновить список
async function assignToUser(user: User) {
  await taskStore.assignUser(task.id, user.id)
  await taskStore.fetchTasks(boardId)
}

// отменить назначение указанного пользователя к задаче и обновить список
async function unassignUser(user: User) {
  await taskStore.unassignUser(task.id, user.id)
  await taskStore.fetchTasks(boardId)
}
</script>

<style scoped>
</style>
