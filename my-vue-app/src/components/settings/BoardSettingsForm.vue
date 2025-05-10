<template>
  <form class="flex flex-col gap-6 p-6 rounded-xl shadow-none">
  <!-- Tabs -->
  <div class="flex gap-2 mb-6">
    <button
      type="button"
      class="px-4 py-2 rounded"
      :class="activeTab === 'roles' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-dark-700'"
      @click="activeTab = 'roles'"
    >
      Пользователи и роли
    </button>
    <button
      type="button"
      class="px-4 py-2 rounded"
      :class="activeTab === 'columns' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-dark-700'"
      @click="activeTab = 'columns'"
    >
      Колонки доски
    </button>
  </div>
    <div v-if="activeTab === 'roles'" class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Пользователи доски</h2>
      <div class="user-table-scroll">
        <table class="w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th class="text-left text-muted-foreground">Имя</th>
              <th class="text-left text-muted-foreground">Логин</th>
              <th class="text-left text-muted-foreground">Email</th>
              <th class="text-left text-muted-foreground">Роли</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in boardUsers" :key="user.id" class="bg-muted dark:bg-dark-700 rounded">
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <RoleMenu
                  :user="user"
                  :board-id="boardId"
                  :roles="userRoles[user.id] || []"
                  :all-roles="allRoles"
                  @update-roles="updateUserRoles"
                  :loading="loadingUserId === user.id"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Секция управления колонками -->
    <div v-if="activeTab === 'columns'" class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Колонки доски</h2>
      <div class="mb-2 flex flex-col gap-2">
        <div v-for="col in localColumns" :key="col.id" class="flex items-center gap-2 bg-muted dark:bg-dark-700 rounded p-2">
          <span class="flex-1 font-semibold">{{ col.title }}</span>
          <span class="text-xs text-muted-foreground">({{ col.status }})</span>
          <button class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 rounded hover:bg-blue-200" @click="openEditColumn(col)">Редактировать</button>
          <button class="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 rounded hover:bg-red-200" @click="deleteColumn(col)" :disabled="localColumns.length <= 3">Удалить</button>
        </div>
      </div>
      <button class="mt-2 px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700" @click="openAddColumn">Добавить колонку</button>
    </div>

    <!-- Модалка для создания/редактирования колонки -->
    <div v-if="showColumnModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-xl w-full max-w-xs relative">
        <button class="absolute top-2 right-2 text-2xl text-muted-foreground hover:text-foreground" @click="closeColumnModal">×</button>
        <h3 class="text-lg font-semibold mb-2">{{ editingColumn ? 'Редактировать колонку' : 'Добавить колонку' }}</h3>
        <form @submit.prevent="saveColumn">
          <div class="mb-3">
            <label class="block text-sm font-semibold mb-1">Название</label>
            <input v-model="columnForm.title" class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100" required maxlength="40" />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-semibold mb-1">Статус</label>
            <select v-model="columnForm.status" class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100" required>
              <option v-for="s in statusList" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <button type="submit" class="w-full mt-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Сохранить</button>
        </form>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { BOARD_ROLES } from '@/constants/boardRoles'
import RoleMenu from './RoleMenu.vue'
import { Status, type BoardColumn } from '@/components/boards/types'
import { apiFetch } from '@/api/apiFetch'

const props = defineProps({ boardId: { type: Number, required: true } })
const userStore = useUserStore()
const boardId = computed(() => props.boardId)
const boardUsers = computed(() => userStore.boardUsers[boardId.value] || [])
const allRoles = BOARD_ROLES

// Tabs
const activeTab = ref<'roles' | 'columns'>('roles')

// --- Колонки ---
const statusList = Object.values(Status)
const localColumns = ref<BoardColumn[]>([
  { id: 1, title: 'Нужно сделать', status: Status.NEW, tasks: [] },
  { id: 2, title: 'В процессе', status: Status.IN_PROGRESS, tasks: [] },
  { id: 3, title: 'Готово', status: Status.DONE, tasks: [] },
])
const showColumnModal = ref(false)
const editingColumn = ref<BoardColumn | null>(null)
const columnForm = ref({ title: '', status: statusList[0] })

function openAddColumn() {
  editingColumn.value = null
  columnForm.value = { title: '', status: statusList[0] }
  showColumnModal.value = true
}
function openEditColumn(col: BoardColumn) {
  editingColumn.value = col
  columnForm.value = { title: col.title, status: col.status }
  showColumnModal.value = true
}
function closeColumnModal() {
  showColumnModal.value = false
}
function saveColumn() {
  if (editingColumn.value) {
    // Редактирование
    editingColumn.value.title = columnForm.value.title
    editingColumn.value.status = columnForm.value.status
  } else {
    // Добавление
    const newId = Math.max(...localColumns.value.map(c => c.id)) + 1
    localColumns.value.push({
      id: newId,
      title: columnForm.value.title,
      status: columnForm.value.status,
      tasks: [],
    })
  }
  showColumnModal.value = false
}
function deleteColumn(col: BoardColumn) {
  if (localColumns.value.length > 3) {
    localColumns.value = localColumns.value.filter(c => c.id !== col.id)
  }
}

// --- Роли (оставляем как было) ---
const userRoles = computed(() => {
  const map: Record<number, string[]> = {}
  for (const user of boardUsers.value) {
    map[user.id] = (user.boardRoles && user.boardRoles[boardId.value]) ? [...user.boardRoles[boardId.value]] : []
  }
  return map
})
const loadingUserId = ref<number|null>(null)

async function updateUserRoles({ userId, roles }: { userId: number, roles: string[] }) {
  loadingUserId.value = userId
  try {
    await apiFetch(`http://localhost:8080/api/users/boards/roles/${userId}/${boardId.value}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardRoles: roles })
    })
    userStore.boardRolesCache[boardId.value] = undefined
    await userStore.fetchUsersFromBoard(boardId.value, true)
  } finally {
    loadingUserId.value = null
  }
}


onMounted(() => {
  // Экспортируем userStore и boardId в window для отладки
  // @ts-ignore
  window.userStore = userStore
  // @ts-ignore
  window.boardId = boardId.value
  userStore.fetchUsersFromBoard(boardId.value, true) // всегда force
})

onUnmounted(() => {
})

// Гарантировать загрузку при каждом открытии вкладки 'roles'
watch(activeTab, (tab) => {
  if (tab === 'roles') {
    userStore.fetchUsersFromBoard(boardId.value, true)
  }
}, { immediate: true })

</script>

<style scoped>
form {
  border-radius: 1.25rem;
  min-width: 320px;
  max-width: 100%;
  padding: 0;
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
}
th, td {
  padding: 6px 10px;
}
th {
  font-weight: 600;
  font-size: 0.98em;
  color: #6b7280;
}
tr {
  border-radius: 8px;
}
tr > td {
  background: inherit;
}
.dark tr {
  background: #232837;
}
.dark th {
  color: #a1a1aa;
}
:deep(input), :deep(select), :deep(textarea) {
  background: #f6f6f6;
  color: #222;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 12px;
  transition: background 0.2s, color 0.2s;
}
:deep(button) {
  font-weight: 600;
  font-size: 1.1rem;
}
@media (prefers-color-scheme: dark) {
  :deep(input), :deep(select), :deep(textarea) {
    background: #232837;
    color: #f3f3f3;
    border: 1px solid #353945;
  }
  :deep(button) {
    background: #2563eb;
    color: #fff;
    border: none;
  }
  :deep(button:hover) {
    background: #1d4ed8;
  }
}
.user-table-scroll {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #2563eb #f3f4f6;
}
.user-table-scroll::-webkit-scrollbar {
  width: 8px;
}
.user-table-scroll::-webkit-scrollbar-thumb {
  background: #2563eb;
  border-radius: 4px;
}
.user-table-scroll::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}
</style>
