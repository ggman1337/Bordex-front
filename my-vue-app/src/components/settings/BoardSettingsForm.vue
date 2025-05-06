<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-6 p-6 rounded-xl shadow-none">
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Пользователи доски</h2>
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
    <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500 transition border-none dark:bg-blue-500 dark:hover:bg-blue-400">
      Сохранить настройки
    </button>
  </form>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { BOARD_ROLES } from '@/constants/boardRoles'
import RoleMenu from './RoleMenu.vue'
const props = defineProps({ boardId: { type: Number, required: true } })
const userStore = useUserStore()
const boardId = computed(() => props.boardId)
const boardUsers = computed(() => userStore.boardUsers[boardId.value] || [])
const allRoles = BOARD_ROLES

// Локальное состояние ролей для быстрого UI-отклика
const userRoles = ref({})
const loadingUserId = ref(null)

// Синхронизировать локальные роли при загрузке пользователей
watch(boardUsers, (users) => {
  const map = {}
  for (const user of users) {
    map[user.id] = (user.boardRoles && user.boardRoles[boardId.value]) ? [...user.boardRoles[boardId.value]] : []
  }
  userRoles.value = map
}, { immediate: true })

// Обновление ролей пользователя
async function updateUserRoles({ userId, roles }) {
  loadingUserId.value = userId
  try {
    await fetch(`http://localhost:8080/api/users/boards/roles/${userId}/${boardId.value}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardRoles: roles })
    })
    await userStore.fetchUsersFromBoard(boardId.value)
  } finally {
    loadingUserId.value = null
  }
}

onMounted(() => {
  if (!userStore.boardUsers[boardId.value]) {
    userStore.fetchUsersFromBoard(boardId.value)
  }
})

const onSubmit = () => {
  // тут мы будем сохранять настройки доски
}
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
</style>
