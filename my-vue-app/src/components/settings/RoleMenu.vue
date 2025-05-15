<template>
  <div>
    <DropdownMenu >
      <DropdownMenuTrigger as-child>
        <button class="inline-flex items-center px-2 py-1 rounded border bg-transparent dark:bg-dark-700 hover:bg-muted dark:hover:bg-dark-600 text-xs font-semibold shadow-sm border-gray-300 dark:border-dark-400">
          <span v-if="roles.length">{{ roles.map(r => roleLabels[r] || r).join(', ') }}</span>
          <span v-else class="text-muted-foreground">Нет ролей</span>
          <svg class="ml-1 w-4 h-4 opacity-60" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[180px] max-h-[220px] overflow-y-auto custom-scroll bg-white text-black border border-gray-300 rounded shadow-md dark:bg-[#232837] dark:text-white dark:border-white">
        <div v-for="role in allRoles" :key="role">
          <label class="flex items-center gap-2 px-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              class="dark:bg-dark-700 dark:border-dark-600 dark:text-dark-100"
              :checked="roles.includes(role)"
              :disabled="isRoleDisabled(role)"
              @change="toggleRole(role)"
            />
            <span>{{ roleLabels[role] || role }}</span>
          </label>
        </div>
        <div v-if="loading" class="px-2 py-1 text-xs text-muted-foreground">Сохраняем...</div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import { useUserStore } from '@/stores/userStore'
import { useBoardStore } from '@/stores/boardStore'

const props = defineProps({
  user: { type: Object, required: true },
  boardId: { type: [Number, String], required: true },
  roles: { type: Array, required: true },
  allRoles: { type: Array, required: true },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['update-roles'])

const localRoles = ref([...props.roles])
watch(() => props.roles, (val) => { localRoles.value = [...val] })

const userStore = useUserStore()
const boardStore = useBoardStore()
const boardOwnerId = computed(() => boardStore.boardById(Number(props.boardId))?.owner.id)

const roleLabels = {
  DEVELOPER: 'Разработчик',
  MANAGER: 'Менеджер',
  VIEWER: 'Наблюдатель'
}

function toggleRole(role) {
  const idx = localRoles.value.indexOf(role)
  if (idx === -1) {
    localRoles.value.push(role)
  } else {
    localRoles.value.splice(idx, 1)
  }
  emit('update-roles', { userId: props.user.id, roles: [...localRoles.value] })
}

function isRoleDisabled(role) {
  if (props.loading) return true
  if (props.user.id === boardOwnerId.value && userStore.id !== boardOwnerId.value) {
    return true
  }
  if (role === 'MANAGER' && userStore.id !== boardOwnerId.value) {
    return true
  }
  return false
}
</script>

<style scoped>

:deep(.custom-scroll) {
  scrollbar-width: thin;
  scrollbar-color: #888 #232837;
}
:deep(.custom-scroll::-webkit-scrollbar) {
  width: 6px;
}
:deep(.custom-scroll::-webkit-scrollbar-thumb) {
  background: #888;
  border-radius: 4px;
}
:deep(.custom-scroll::-webkit-scrollbar-track) {
  background: transparent;
}

label {
  color: inherit;
}
input[type="checkbox"] {
  accent-color: #2563eb;
  background: white;
  border-radius: 4px;
  border: 1px solid #bbb;
}
.dark input[type="checkbox"] {
  accent-color: #60a5fa;
  background: #232837;
  border: 1px solid #fff;
}

button {
  min-width: 90px;
}
input[type="checkbox"] {
  accent-color: #2563eb;
}
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #2563eb #f3f4f6;
}
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #2563eb;
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}
</style>
