<template>
  <Dialog v-model:open="isOpen">
    <DialogPortal>
      <DialogOverlay />
      <DialogContent>
        <DialogTitle>Привязка Telegram</DialogTitle>
        <DialogDescription class="sr-only">Привязка аккаунта Telegram</DialogDescription>
        <div>
          <template v-if="loading">Загрузка...</template>
          <template v-else>
            <template v-if="telegramUsername">
              <div class="flex flex-col gap-2">
                <p>Ваш Telegram: @{{ telegramUsername }}</p>
                <button @click="unassignTelegram" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Отвязать Телеграмм</button>
              </div>
            </template>
            <template v-else-if="passcode">
              <a :href="telegramLink" target="_blank" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Продолжить в телеграмм</a>
            </template>
            <template v-else>
              <button @click="assignTelegram" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Привязать Телеграмм</button>
            </template>
          </template>
        </div>
        <div class="mt-4 text-right">
          <button @click="close" class="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-dark-200 rounded hover:bg-gray-300 dark:hover:bg-dark-600">Закрыть</button>
        </div>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed, watch } from 'vue'
import { Dialog, DialogOverlay, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DialogPortal } from 'reka-ui'
import { apiFetch } from '@/api/apiFetch'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()
const isOpen = computed({ get: () => props.open, set: (value: boolean) => emit('update:open', value) })

const loading = ref(false)
const telegramUsername = ref<string | null>(null)
const passcode = ref<string | null>(null)
const telegramBot = 'bordex_bot'
const telegramLink = computed(() => `https://t.me/${telegramBot}?start=assign_account_${passcode.value}`)

async function close() {
  emit('update:open', false)
}

async function loadData() {
  loading.value = true
  try {
    const res = await apiFetch('http://localhost:8080/api/auth/me', { credentials: 'include' })
    const data = await res.json()
    telegramUsername.value = data.telegramUsername || null
  } catch (e) {
    console.error('Failed to fetch user', e)
  } finally {
    loading.value = false
  }
}

async function assignTelegram() {
  loading.value = true
  try {
    const res = await apiFetch('http://localhost:8080/api/auth/telegram-assign', { method: 'POST', credentials: 'include' })
    const data = await res.json()
    passcode.value = data.telegramPasscode
  } catch (e) {
    console.error('Failed to assign', e)
  } finally {
    loading.value = false
  }
}

async function unassignTelegram() {
  loading.value = true
  try {
    await apiFetch('http://localhost:8080/api/auth/telegram-unassign', { method: 'POST', credentials: 'include' })
    telegramUsername.value = null
    passcode.value = null
  } catch (e) {
    console.error('Failed to unassign', e)
  } finally {
    loading.value = false
  }
}

watch(() => props.open, (val) => { if (val) loadData() })
</script>

<style scoped>
/* Styles for UserSettingsOverlay if needed */
</style>
