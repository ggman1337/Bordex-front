<template>
  <Dialog v-model:open="isOpen">
    <DialogPortal>
      <DialogOverlay />
      <DialogContent>
        <DialogTitle>Настройки профиля</DialogTitle>
        <DialogDescription>Редактирование данных пользователя и привязка Telegram</DialogDescription>
        <div v-if="!showPostRegisterForm" class="mb-4">
          <label class="block text-sm font-semibold">Имя</label>
          <div class="flex items-center gap-2">
            <input v-model="firstName" class="w-full p-2 border rounded" />
            <button @click="saveFirstName" :disabled="firstNameUpdating" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              {{ firstNameUpdating ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <span v-if="firstNameSuccess" class="text-green-600">Сохранено</span>
          </div>
        </div>
        <div v-if="!showPostRegisterForm" class="mb-4">
          <label class="block text-sm font-semibold">Фамилия</label>
          <div class="flex items-center gap-2">
            <input v-model="lastName" class="w-full p-2 border rounded" />
            <button @click="saveLastName" :disabled="lastNameUpdating" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              {{ lastNameUpdating ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <span v-if="lastNameSuccess" class="text-green-600">Сохранено</span>
          </div>
        </div>
        <div v-if="!showPostRegisterForm" class="mb-4">
          <label class="block text-sm font-semibold">Email</label>
          <div class="flex items-center gap-2">
            <input v-model="email" type="email" class="w-full p-2 border rounded" />
            <button @click="saveEmail" :disabled="emailUpdating" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              {{ emailUpdating ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <span v-if="emailSuccess" class="text-green-600">Сохранено</span>
          </div>
        </div>
        <div class="mt-6 pt-4 border-t border-gray-300 dark:border-dark-600">
          <h3 class="text-lg font-semibold mb-2">Привязка Telegram</h3>
          <div>
            <div v-if="loading">Загрузка...</div>
            <div v-else>
              <div v-if="telegramUsername">
                <div class="flex flex-col gap-2">
                  <p>Ваш Telegram: @{{ telegramUsername }}</p>
                  <button @click="unassignTelegram" class="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">Отвязать Telegram</button>
                </div>
              </div>
              <div v-else>
                <button v-if="!assigning" @click="assignTelegram" class="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">Привязать Telegram</button>
                <span v-else class="px-4 py-2 text-gray-500">Идёт привязка...</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="showPostRegisterForm" class="mt-6 p-4 border rounded">
          <h3 class="text-lg font-semibold mb-2">Дополнительная регистрация</h3>
          <div v-if="regError" class="text-red-600 mb-2">{{ regError }}</div>
          <div class="grid grid-cols-1 gap-2">
            <input v-model="regFirstName" placeholder="Имя" class="p-2 border rounded" />
            <input v-model="regLastName" placeholder="Фамилия" class="p-2 border rounded" />
            <input v-model="regEmail" type="email" placeholder="Email" class="p-2 border rounded" />
            <input v-model="regUsername" placeholder="Username" class="p-2 border rounded" />
            <input v-model="regPassword" type="password" placeholder="Пароль" class="p-2 border rounded" />
            <input v-model="regPasswordConfirm" type="password" placeholder="Подтвердите пароль" class="p-2 border rounded" />
            <button @click="submitTelegramPostRegister" :disabled="regSubmitting" class="mt-2 px-3 py-1 bg-green-600 text-white rounded">
              {{ regSubmitting ? 'Отправка...' : 'Зарегистрировать' }}
            </button>
            <span v-if="regSuccess" class="text-green-600">Успешно зарегистрировано</span>
          </div>
        </div>
        <div class="mt-4 text-right">
          <button @click="close" class="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-dark-200 rounded hover:bg-gray-300 dark:hover:bg-dark-600">Закрыть</button>
        </div>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Dialog, DialogOverlay, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DialogPortal } from 'reka-ui'
import { apiFetch } from '@/api/apiFetch'
import { urlConfig } from '@/config/websocket.config'

const BASE_URL = urlConfig.restUrl

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()
const isOpen = computed({ get: () => props.open, set: (value: boolean) => emit('update:open', value) })

const loading = ref(false)
const telegramUsername = ref<string | null>(null)
const passcode = ref<string | null>(null)
const telegramBot = 'bordex_bot'
const assigning = ref(false)
const userId = ref<number | null>(null)
const firstName = ref<string>('')
const lastName = ref<string>('')
const email = ref<string>('')
const firstNameUpdating = ref(false)
const firstNameSuccess = ref(false)
const lastNameUpdating = ref(false)
const lastNameSuccess = ref(false)
const emailUpdating = ref(false)
const emailSuccess = ref(false)
const showPostRegisterForm = ref(false)
const regFirstName = ref('')
const regLastName = ref('')
const regEmail = ref('')
const regUsername = ref('')
const regPassword = ref('')
const regPasswordConfirm = ref('')
const regSubmitting = ref(false)
const regError = ref<string | null>(null)
const regSuccess = ref(false)

async function close() {
  emit('update:open', false)
}

async function loadData() {
  loading.value = true
  try {
    const res = await apiFetch(`${BASE_URL}/api/auth/me`, { credentials: 'include' })
    const data = await res.json()
    telegramUsername.value = data.telegramUsername || null
    userId.value = data.id
    firstName.value = data.firstName || ''
    lastName.value = data.lastName || ''
    email.value = data.email || ''
  } catch (e) {
    console.error('Failed to fetch user', e)
  } finally {
    loading.value = false
  }
}

async function assignTelegram() {
  try {
    assigning.value = true
    const res = await apiFetch(`${BASE_URL}/api/auth/telegram-assign`, { method: 'POST', credentials: 'include' })
    const data = await res.json()
    passcode.value = data.telegramPasscode
    window.open(`https://t.me/${telegramBot}?start=assign_account_${passcode.value}`, '_blank')
  } catch (e) {
    console.error('Failed to assign', e)
  } finally {
    assigning.value = false
  }
}

async function unassignTelegram() {
  loading.value = true
  try {
    const res = await apiFetch(`${BASE_URL}/api/auth/telegram-unassign`, { method: 'POST', credentials: 'include' })
    if (res.status === 403) {
      showPostRegisterForm.value = true
      return
    }
    if (!res.ok) throw new Error('Unassign failed')
    telegramUsername.value = null
    passcode.value = null
  } catch (e: any) {
    if (!showPostRegisterForm.value) console.error('Failed to unassign', e)
  } finally {
    loading.value = false
  }
}

async function submitTelegramPostRegister() {
  regSubmitting.value = true
  regError.value = null
  try {
    const res = await apiFetch(`${BASE_URL}/api/auth/telegram-post-register`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: regUsername.value,
        firstName: regFirstName.value,
        lastName: regLastName.value,
        email: regEmail.value,
        password: regPassword.value,
        passwordConfirm: regPasswordConfirm.value
      })
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Registration failed')
    }
    regSuccess.value = true
    showPostRegisterForm.value = false
    loadData()
  } catch (e: any) {
    regError.value = e.message
  } finally {
    regSubmitting.value = false
  }
}

async function saveFirstName() {
  if (!userId.value) return
  firstNameUpdating.value = true
  firstNameSuccess.value = false
  try {
    await apiFetch(`${BASE_URL}/api/users/${userId.value}`, {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: firstName.value })
    })
    firstNameSuccess.value = true
  } catch (e) { console.error('saveFirstName', e) } finally { firstNameUpdating.value = false }
}
async function saveLastName() {
  if (!userId.value) return
  lastNameUpdating.value = true
  lastNameSuccess.value = false
  try {
    await apiFetch(`${BASE_URL}/api/users/${userId.value}`, {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastName: lastName.value })
    })
    lastNameSuccess.value = true
  } catch (e) { console.error('saveLastName', e) } finally { lastNameUpdating.value = false }
}
async function saveEmail() {
  if (!userId.value) return
  emailUpdating.value = true
  emailSuccess.value = false
  try {
    await apiFetch(`${BASE_URL}/api/users/${userId.value}`, {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })
    emailSuccess.value = true
  } catch (e) { console.error('saveEmail', e) } finally { emailUpdating.value = false }
}

watch(() => props.open, (val) => { if (val) loadData() })
</script>

<style scoped>
</style>
