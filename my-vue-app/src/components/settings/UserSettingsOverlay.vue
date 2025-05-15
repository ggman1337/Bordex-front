<template>
  <Dialog v-model:open="isOpen">
    <DialogPortal>
      <DialogOverlay />
      <DialogContent>
        <DialogTitle>Привязка Telegram</DialogTitle>
        <DialogDescription class="sr-only">Привязка аккаунта Telegram</DialogDescription>
        <div>
          <div v-if="loading">Загрузка...</div>
          <div v-else>
            <div v-if="telegramUsername">
              <div class="flex flex-col gap-2">
                <p>Ваш Telegram: @{{ telegramUsername }}</p>
                <button @click="unassignTelegram" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Отвязать Телеграмм</button>
              </div>
            </div>
            <div v-else>
              <button v-if="!assigning" @click="assignTelegram" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Привязать Телеграмм</button>
              <span v-else class="px-4 py-2 text-gray-500">Идёт привязка...</span>
            </div>
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

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()
const isOpen = computed({ get: () => props.open, set: (value: boolean) => emit('update:open', value) })

const loading = ref(false)
const telegramUsername = ref<string | null>(null)
const passcode = ref<string | null>(null)
const telegramBot = 'bordex_bot'
const assigning = ref(false)

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
  try {
    assigning.value = true
    const res = await apiFetch('http://localhost:8080/api/auth/telegram-assign', { method: 'POST', credentials: 'include' })
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
</style>
