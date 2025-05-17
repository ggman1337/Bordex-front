<template>
  <form
    class="board-settings-form flex flex-col gap-6 p-6 rounded-xl shadow-none"
    :style="{ color: routeColor, backgroundColor: formBgColor }"
  >
    <div class="flex gap-2 mb-6">
      <button
        type="button"
        class="px-4 py-2 rounded"
        :class="activeTab === 'roles'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'"
        @click="activeTab = 'roles'"
      >
        Пользователи и роли
      </button>
      <button
        type="button"
        class="px-4 py-2 rounded"
        :class="activeTab === 'columns'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'"
        @click="activeTab = 'columns'"
      >
        Колонки доски
      </button>
      <button
        v-if="isOwner"
        type="button"
        class="px-4 py-2 rounded"
        :class="activeTab === 'owner'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'"
        @click="activeTab = 'owner'"
      >
        Сменить владельца/доступность
      </button>
    </div>
    <div v-if="activeTab === 'roles'" class="mb-6 rounded-xl">
      <h2 class="text-xl font-semibold mb-2">Пользователи доски</h2>
      <div class="user-table-scroll rounded-xl dark:bg-dark-800">
        <table class="w-full text-sm border-separate border-spacing-y-2">
          <thead>
          <tr>
            <th class="text-left text-muted-foreground">Имя</th>
            <th class="text-left text-muted-foreground">Логин</th>
            <th class="text-left text-muted-foreground">Email</th>
            <th class="text-left text-muted-foreground">Роли</th>
            <th class="text-left text-muted-foreground">Действия</th>
          </tr>
          </thead>
          <tbody>
          <tr :id="`user-row-${user.id}`" v-for="user in sortedUsers" :key="user.id" class="bg-muted dark:bg-dark-700 rounded">
            <td>{{ user.firstName }} {{ user.lastName }}
              <span v-if="boardOwner && user.id === boardOwner.id" class="ml-2 px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">Владелец</span>
            </td>
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
            <td>
              <button type="button"
                v-if="user.id !== userStore.id && user.id !== boardOwner?.id && (isOwner || (boardScope === 'PUBLIC' && !userRoles[user.id]?.includes('MANAGER')))"
                @click.prevent="openRemoveUserModal(user)"
                :disabled="removingUserId === user.id"
                class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                {{ removingUserId === user.id ? 'Удаление...' : 'Удалить' }}
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 flex flex-col gap-2 rounded-xl dark:bg-dark-800">
        <h3 class="font-semibold">Добавить пользователя</h3>
        <p v-if="duplicateMessage" class="text-red-500 dark:text-red-400">{{ duplicateMessage }}</p>
        <div class="flex flex-row items-center gap-2">
          <input v-model="newUserQuery" @keyup.enter.prevent="searchUsers" placeholder="Username или Email" class="p-2 border border-gray-300 rounded flex-1 dark:bg-dark-700 dark:text-dark-100 dark:border-dark-600" required
                 maxlength="40"/>
          <button @click.prevent="searchUsers" :disabled="searching" class="px-3 py-1 rounded border transition-colors text-blue-700 border-blue-600 hover:bg-blue-50 dark:bg-blue-800 dark:text-white dark:border-blue-800 dark:hover:bg-blue-700">
            {{ searching ? 'Поиск...' : 'Поиск' }}
          </button>
        </div>
        <div v-if="searchResults.length" class="mt-2 max-h-60 overflow-y-auto flex flex-col gap-2">
          <div v-for="user in searchResults" :key="user.id" class="flex items-center justify-between p-2 bg-muted dark:bg-dark-700 rounded">
            <span>{{ user.firstName }} {{ user.lastName }} ({{ user.username }} | {{ user.email }})</span>
            <button v-if="canAddUser" @click.prevent="addUserToBoard(user)" :disabled="addingUserId === user.id" class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
              {{ addingUserId === user.id ? 'Добавление...' : 'Добавить' }}
            </button>
          </div>
        </div>
        <div v-else-if="!searching && newUserQuery && hasSearched && !searchResults.length" class="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
          Пользователи не найдены
        </div>
      </div>
    </div>

    <!-- Секция управления колонками -->
    <div v-if="activeTab === 'columns'" class="mb-6 rounded-xl dark:bg-dark-800">
      <h2 class="text-xl font-semibold mb-2">Колонки доски</h2>
      <div class="mb-2 flex flex-col gap-2">
        <div v-for="col in localColumns" :key="col.id"
             class="flex items-center gap-2 rounded p-2">
          <span class="flex-1 font-semibold">{{ col.title }}</span>
          <span class="text-xs text-muted-foreground">({{ col.status }})</span>
          <button class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 rounded hover:bg-blue-200"
                  @click="openEditColumn(col)">Редактировать
          </button>
          <button class="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 rounded hover:bg-red-200"
                  @click="deleteColumn(col)" :disabled="localColumns.length <= 3">Удалить
          </button>
        </div>
      </div>
      <button class="mt-2 px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700" @click="openAddColumn">Добавить
        колонку
      </button>
    </div>

    <div v-if="activeTab === 'owner'" class="mb-6 rounded-xl">
      <h2 class="text-xl font-semibold mb-2">Сменить владельца доски</h2>
      <div class="flex-row items-center gap-2">
        <select v-model="newOwnerId" :style="{ color: routeColor, backgroundColor: formBgColor }" class="mr-2 p-2 border border-gray-300 rounded dark:bg-dark-700 dark:text-dark-100 dark:border-dark-600">
          <option :value="null" disabled :style="{ color: routeColor, backgroundColor: formBgColor }" class="dark:bg-dark-700 dark:text-dark-100 dark:border-dark-600">Выберите пользователя</option>
          <option v-for="user in boardUsers.filter(u => u.id !== boardOwner?.id)" :key="user.id" :value="user.id"
                  :style="{ color: routeColor, backgroundColor: formBgColor }" class="dark:bg-dark-700 dark:text-dark-100 dark:border-dark-600">
            {{ user.firstName }} {{ user.lastName }} ({{ user.username }})
          </option>
        </select>
        <button :disabled="!newOwnerId || transferringOwner" @click.prevent="transferOwner"
                class="px-3 py-1 rounded border transition-colors text-green-700 dark:bg-green-800 dark:text-white dark:border-green-800 dark:hover:bg-green-700 hover:bg-green-50">
          {{ transferringOwner ? 'Передача...' : 'Передать' }}
        </button>
      </div>
      <div class="mt-4 rounded-xl">
        <label class="block text-sm font-semibold mb-1">Доступность доски</label>
        <div class="flex-row items-center gap-2">
          <select v-model="boardScope" :style="{ color: routeColor, backgroundColor: formBgColor }" class="mr-2 p-2 border border-gray-300 rounded dark:bg-dark-700 dark:text-dark-100 dark:border-dark-600">
            <option value="PRIVATE">Приватная</option>
            <option value="PUBLIC">Публичная</option>
          </select>
          <button :disabled="savingScope" @click.prevent="updateScope"
                  class="px-3 py-1 rounded border transition-colors text-blue-700 dark:bg-blue-800 dark:text-white dark:border-blue-800 dark:hover:bg-blue-700 hover:bg-blue-50">
            {{ savingScope ? 'Сохраняем...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модалка для создания/редактирования колонки -->
    <div v-if="showColumnModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-xl w-full max-w-xs relative">
        <button class="absolute top-2 right-2 text-2xl text-muted-foreground hover:text-foreground"
                @click="closeColumnModal">×
        </button>
        <h3 class="text-lg font-semibold mb-2">{{ editingColumn ? 'Редактировать колонку' : 'Добавить колонку' }}</h3>
        <form @submit.prevent="saveColumn">
          <div class="mb-6 bg-white dark:bg-dark-800 rounded-xl">
            <label class="block text-sm font-semibold mb-1">Название</label>
            <input v-model="columnForm.title"
                   class="w-full p-2 border border-gray-300 rounded dark:bg-dark-600 dark:border-dark-600 dark:text-dark-100" required
                   maxlength="40"/>
          </div>
          <div class="mb-6 bg-white dark:bg-dark-800 rounded-xl">
            <label class="block text-sm font-semibold mb-1">Статус</label>
            <select v-model="columnForm.status" :style="{ color: routeColor, backgroundColor: formBgColor }"
                    class="w-full p-2 border border-gray-300 rounded dark:bg-dark-600 dark:border-dark-600 dark:text-dark-100" required>
              <option v-for="s in statusList" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <button type="submit" class="w-full mt-2 px-3 py-1 rounded border transition-colors bg-white text-blue-700 border-blue-600 hover:bg-blue-50 dark:bg-blue-800 dark:text-white dark:border-blue-800 dark:hover:bg-blue-700">
            Сохранить
          </button>
        </form>
      </div>
    </div>
    <div v-if="showRemoveUserModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div :style="{ color: routeColor, backgroundColor: formBgColor }" :class="['p-6 rounded-xl shadow-xl w-full max-w-xs']">
        <h3 class="text-lg font-semibold mb-4">Вы действительно хотите удалить пользователя?</h3>
        <p class="mb-4">{{ userToRemove?.firstName }} {{ userToRemove?.lastName }} ({{ userToRemove?.username }})</p>
        <div class="flex justify-end gap-2">
          <button type="button" @click="closeRemoveUserModal" class="px-3 py-1 border rounded">Отмена</button>
          <button type="button" @click="confirmRemoveUser" :disabled="removingUserId === userToRemove?.id" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
            {{ removingUserId === userToRemove?.id ? 'Удаление...' : 'Удалить' }}
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import {computed, ref, watch, onMounted, onBeforeUnmount, nextTick} from 'vue'
import {useUserStore} from '@/stores/userStore'
import {BOARD_ROLES} from '@/constants/boardRoles'
import RoleMenu from './RoleMenu.vue'
import {type BoardColumn, Status} from '@/components/boards/types'
import {apiFetch} from '@/api/apiFetch'
import {useBoardRoles} from '@/composables/useBoardRoles.ts'
import { urlConfig } from '@/config/websocket.config'
import {unsubscribe} from '@/lib/websocket'

const props = defineProps({boardId: {type: Number, required: true}})
const BASE_URL = urlConfig.restUrl
const userStore = useUserStore()
const boardId = computed(() => props.boardId)
const boardUsers = computed(() => userStore.boardUsers[boardId.value] || [])
const allRoles = BOARD_ROLES
const activeTab = ref<'roles' | 'columns' | 'owner'>('roles')

// Логика передачи владельца
const boardOwner = ref<any>(null)
const newOwnerId = ref<number|null>(null)
const transferringOwner = ref(false)
const currentUserId = computed(() => userStore.id)
const isOwner = computed(() => boardOwner.value?.id === currentUserId.value)
const boardScope = ref<string>('PRIVATE')
const savingScope = ref(false)

async function loadBoardDetails() {
  try {
    const res = await apiFetch(`${BASE_URL}/api/boards/${boardId.value}`)
    const data = await res.json()
    boardOwner.value = data.owner
    boardScope.value = data.scope
  } catch (e) {
    console.error('Failed to load board details', e)
  }
}

async function transferOwner() {
  if (!newOwnerId.value) return
  transferringOwner.value = true
  try {
    await apiFetch(`${BASE_URL}/api/boards/${boardId.value}/owner-transfer/${newOwnerId.value}`, {
      method: 'PATCH'
    })
    await loadBoardDetails()
    // Смена вкладки обратно после передачи владельца
    activeTab.value = 'roles'
  } catch (e) {
    console.error('Failed to transfer owner', e)
  } finally {
    transferringOwner.value = false
  }
}

async function updateScope() {
  savingScope.value = true
  try {
    await apiFetch(`${BASE_URL}/api/boards/${boardId.value}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({scope: boardScope.value})
    })
    await loadBoardDetails()
  } catch (e) {
    console.error('Failed to update scope', e)
  } finally {
    savingScope.value = false
  }
}

onMounted(() => {
  loadBoardDetails()
  // подписка на события доски теперь осуществляется в BoardPage.vue
})
onBeforeUnmount(() => {
  unsubscribe(`/topic/user/${userStore.id}/board`)
})
watch(boardId, () => {
  loadBoardDetails()
})

const statusList = Object.values(Status)
const localColumns = ref<BoardColumn[]>([
  {id: 1, title: 'Нужно сделать', status: Status.NEW, tasks: []},
  {id: 2, title: 'В процессе', status: Status.IN_PROGRESS, tasks: []},
  {id: 3, title: 'На рассмотрении', status: Status.REVIEW, tasks: []},
  {id: 4, title: 'Готово', status: Status.DONE, tasks: []},
])
const showColumnModal = ref(false)
const editingColumn = ref<BoardColumn | null>(null)
const columnForm = ref({title: '', status: statusList[0]})
const hasSearched = ref(false)

function openAddColumn() {
  editingColumn.value = null
  columnForm.value = {title: '', status: statusList[0]}
  showColumnModal.value = true
}

function openEditColumn(col: BoardColumn) {
  editingColumn.value = col
  columnForm.value = {title: col.title, status: col.status}
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

const userRoles = computed(() => {
  const map: Record<number, string[]> = {}
  const entries = userStore.boardRolesCache[boardId.value] || []
  for (const entry of entries) {
    map[entry.user.id] = [...entry.boardRoles]
  }
  return map
})

const sortedUsers = computed(() => [
  ...boardUsers.value.filter(u => (userRoles.value[u.id] || []).includes('MANAGER')),
  ...boardUsers.value.filter(u => (userRoles.value[u.id] || []).includes('DEVELOPER') && !(userRoles.value[u.id] || []).includes('MANAGER')),
  ...boardUsers.value.filter(u => !(userRoles.value[u.id] || []).includes('MANAGER') && !(userRoles.value[u.id] || []).includes('DEVELOPER'))
])

const loadingUserId = ref<number | null>(null)

async function updateUserRoles({userId, roles}: { userId: number, roles: string[] }) {
  await apiFetch(`${BASE_URL}/api/users/boards/roles/${userId}/${boardId.value}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({boardRoles: roles})
  })
  // После обновления, прокрутить обновленную строку вверх
  await nextTick()
  document.getElementById(`user-row-${userId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const newUserQuery = ref('')
const searchResults = ref<any[]>([])
const searching = ref(false)
const addingUserId = ref<number|null>(null)
const removingUserId = ref<number|null>(null)
const duplicateMessage = ref<string|null>(null)

async function addUserToBoard(user: any) {
  duplicateMessage.value = null
  if (boardUsers.value.some(u => u.id === user.id)) {
    duplicateMessage.value = `Пользователь ${user.username} уже находится на доске`
    return
  }
  addingUserId.value = user.id
  try {
    await apiFetch(`${BASE_URL}/api/boards/${boardId.value}/add-user/${user.id}`, {
      method: 'PATCH',
    })
    await userStore.fetchUsersFromBoard(boardId.value, true)
    searchResults.value = []
    newUserQuery.value = ''
  } catch (e) {
    console.error('Failed to add user to board', e)
  } finally {
    addingUserId.value = null
  }
}

const showRemoveUserModal = ref(false)
const userToRemove = ref<any>(null)
function openRemoveUserModal(user: any) {
  userToRemove.value = user
  showRemoveUserModal.value = true
}
function closeRemoveUserModal() {
  showRemoveUserModal.value = false
  userToRemove.value = null
}
async function confirmRemoveUser() {
  if (userToRemove.value) {
    await removeUserFromBoard(userToRemove.value)
  }
  closeRemoveUserModal()
}

async function removeUserFromBoard(user: any) {
  removingUserId.value = user.id
  try {
    await apiFetch(`${BASE_URL}/api/boards/${boardId.value}/remove-user/${user.id}`, {
      method: 'PATCH',
    })
    await userStore.fetchUsersFromBoard(boardId.value, true)
  } catch (e) {
    console.error('Failed to remove user from board', e)
  } finally {
    removingUserId.value = null
  }
}

async function searchUsers() {
  hasSearched.value = true
  searching.value = true
  try {
    let url = `${BASE_URL}/api/users?username=${newUserQuery.value}&email=${newUserQuery.value}&telegramUsername=${newUserQuery.value}`
    const res = await apiFetch(url, {
      method: 'GET',
    })
    const data: any = await res.json()
    searchResults.value = data.content || []
  } catch (e) {
    console.error('Failed to search users', e)
  } finally {
    searching.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'roles') {

  }
}, {immediate: true})

// динамическая настройка цветов в зависимости от темы
const routeColor = ref<string>('')
const formBgColor = ref<string>('')
function updateColors() {
  const isDark = document.documentElement.classList.contains('dark')
  routeColor.value = isDark ? '#fff' : '#000'
  formBgColor.value = isDark ? '#232323' : '#fff'
}
onMounted(() => {
  updateColors()
  const obs = new MutationObserver(updateColors)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

const { hasRole } = useBoardRoles(boardId)
const isManager = computed(() => hasRole('MANAGER'))
const canAddUser = computed(() => isOwner.value || (boardScope.value === 'PUBLIC' && isManager.value))
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

.dark th {
  color: #a1a1aa;
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

:deep(.dark .user-table-scroll) {
  background: #232837;
  scrollbar-color: #60a5fa #232837;
}

:deep(.dark .user-table-scroll::-webkit-scrollbar-track) {
  background: #232837;
}

:deep(.dark .user-table-scroll::-webkit-scrollbar-thumb) {
  background: #60a5fa;
}

:deep(.dark .board-settings-form select),
:deep(.dark .board-settings-form select option) {
  background-color: #232323 !important;
  color: #fff !important;
}
</style>
