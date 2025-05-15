<template>
  <div class="flex justify-center items-center min-h-[80vh]">
    <div v-if="!showTelegramForm" class="bg-white dark:bg-black rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col gap-6">
      <div class="flex items-center gap-3 mb-2">
          <svg class="w-8 h-8 mr-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15.9999V7.9999C20.9996 7.64917 20.9071 7.30471 20.7315 7.00106C20.556 6.69741 20.3037 6.44526 20 6.2699L13 2.2699C12.696 2.09436 12.3511 2.00195 12 2.00195C11.6489 2.00195 11.304 2.09436 11 2.2699L4 6.2699C3.69626 6.44526 3.44398 6.69741 3.26846 7.00106C3.09294 7.30471 3.00036 7.64917 3 7.9999V15.9999C3.00036 16.3506 3.09294 16.6951 3.26846 16.9987C3.44398 17.3024 3.69626 17.5545 4 17.7299L11 21.7299C11.304 21.9054 11.6489 21.9978 12 21.9978C12.3511 21.9978 12.696 21.9054 13 21.7299L20 17.7299C20.3037 17.5545 20.556 17.3024 20.7315 16.9987C20.9071 16.6951 20.9996 16.3506 21 15.9999Z" :stroke="routeColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7.5 4.20996L12 6.80996L16.5 4.20996" :stroke="routeColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7.5 19.79V14.6L3 12" :stroke="routeColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12L16.5 14.6V19.79" :stroke="routeColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.27002 6.95996L12 12.01L20.73 6.95996" stroke="#1A87D7" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 22.08V12" stroke="#1A87D7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        <span class="font-bold text-lg">Bordex</span>
      </div>
      <h2 class="text-2xl font-bold mb-2">Войти в аккаунт</h2>
      <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm mb-1">Email или логин</label>
          <input v-model="login" type="text" placeholder="myemail@yandex.ru" class="w-full border rounded-lg px-4 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p v-if="errors.login || errors.username" class="text-red-600 text-xs mt-1">
            {{ Array.isArray(errors.login) ? errors.login[0] : errors.login || Array.isArray(errors.username) ? errors.username[0] : errors.username }}
          </p>
        </div>
        <div class="relative">
          <label class="block text-sm mb-1">Пароль</label>
          <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="••••••••" class="w-full border rounded-lg px-4 py-2 pr-10 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="button" @click="toggleShowPassword" class="absolute right-3 top-8 text-gray-400 hover:text-blue-600 focus:outline-none">
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.21.655-.482 1.28-.807 1.87M15.362 17.362A9.956 9.956 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.964 9.964 0 012.293-3.95"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.978 9.978 0 012.293-3.951m3.153-2.602A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7-.328 1.024-.81 1.99-1.417 2.877M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </button>
          <p v-if="errors.password" class="text-red-600 text-xs mt-1">
            {{ Array.isArray(errors.password) ? errors.password[0] : errors.password }}
          </p>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold text-base hover:bg-blue-700 transition">Войти</button>
        <div class="flex items-center my-2">
          <span class="flex-1 border-t"></span>
          <span class="mx-2 text-xs text-muted-foreground">или</span>
          <span class="flex-1 border-t"></span>
        </div>
        <button type="button" @click="onContinueTelegram" class="w-full flex items-center justify-center gap-2 border border-blue-400 text-blue-600 rounded-lg py-2 font-medium hover:bg-blue-50 transition">
          <svg width="20" height="20" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="120" cy="120" r="120" fill="#29B6F6"></circle><path d="M179.5 79.5L158.5 171.5C158.5 171.5 157.5 176.5 152.5 176.5C149.5 176.5 148 175 148 175L97.5 135.5L74.5 124.5L51.5 117.5C51.5 117.5 48 116.5 48 113C48 109.5 52.5 108.5 52.5 108.5L175.5 60.5C175.5 60.5 180.5 59 181.5 62C182.5 65 179.5 79.5 179.5 79.5Z" fill="white"></path><path d="M113 154.5L96.5 171.5C96.5 171.5 95.5 172.5 94 172.5C93.5 172.5 93 172.5 92.5 172L97.5 135.5L113 154.5Z" fill="#B0BEC5"></path><path d="M148 92.5L97.5 135.5L113 154.5L97.5 135.5L148 92.5Z" fill="#CFD8DC"></path></svg>
          <span>Продолжить с Telegram</span>
        </button>
      </form>
    </div>
    <div v-else class="bg-white dark:bg-black rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center gap-6">
      <h2 class="text-2xl font-bold mb-2">Регистрация через Telegram</h2>
      <img :src="qrCodeUrl" alt="QR code" class="w-40 h-40 mb-4" />
      <a :href="telegramUrl" target="_blank" class="w-full bg-blue-600 text-white rounded-lg py-2 text-center font-semibold text-base hover:bg-blue-700 transition mb-4">Перейти</a>
      <div class="w-full flex flex-col items-center text-center">
        <label class="text-sm mb-1">Введите код из Telegram</label>
        <PinInput v-model="telegramCode" class="mx-auto" @paste.native.prevent="onTelegramPaste">
          <PinInputSlot v-for="i in 5" :key="i" :index="i-1" />
        </PinInput>
        <p v-if="telegramError" class="text-red-600 text-xs mt-1">{{ telegramError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {useUserStore} from '@/stores/userStore'
import { PinInput, PinInputSlot } from '@/components/ui/pin-input'
import { toast } from 'vue-sonner'
import { urlConfig } from '@/config/websocket.config'
import qrDark from '@/assets/qrcode_black.png'
import qrLight from '@/assets/qrcode_light.png'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const routeColor = ref('#000')
const routeInline = ref('none')
let observer: MutationObserver | null = null 
const BASE_URL = urlConfig.restUrl

function updateRouteColor() {
  routeColor.value = document.documentElement.classList.contains('dark') ? '#fff' : '#000'
}

function updateRouteInline() {
  routeInline.value = document.documentElement.classList.contains('dark') ? 'inline' : 'none'
}

onMounted(() => {
  if (route.query.telegram) {
    showTelegramForm.value = true
  }
  updateRouteColor()
  updateRouteInline()
  observer = new MutationObserver(() => {
    updateRouteColor()
    updateRouteInline()
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
const login = ref('')
const password = ref('')
const showPassword = ref(false)
const errors = ref<Record<string, string | string[]>>({})
function toggleShowPassword() {
  showPassword.value = !showPassword.value
}

const showTelegramForm = ref(false)
const telegramCode = ref<string[]>([])
const telegramError = ref('')
const telegramUrl = 'https://t.me/bordex_bot?start=registration'

const qrCodeUrl = computed(() => routeColor.value === '#fff' ? qrDark : qrLight)

function onContinueTelegram() {
  showTelegramForm.value = true
}

function onTelegramPaste(e: ClipboardEvent) {
  e.preventDefault()
  const pasted = e.clipboardData?.getData('text') ?? ''
  const digits = pasted.replace(/\D/g, '').slice(0,5).split('')
  telegramCode.value = digits
}

watch(telegramCode, async (newVal) => {
  const raw = newVal.join('')
  const code = raw.replace(/\D/g, '')
  if (code.length === 5) {
    telegramError.value = ''
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramPasscode: code }),
        credentials: 'include'
      })
      if (!response.ok) {
        const data = await response.json()
        telegramError.value = data.message || 'Неверный код'
        telegramCode.value = []
        return
      }
      toast('Успешная авторизация через Telegram', { description: 'Добро пожаловать!', duration: 2000, class: 'bg-green-600 text-white' })
      await userStore.fetchCurrentUser()
      router.push('/')
    } catch {
      telegramError.value = 'Сервер недоступен'
      telegramCode.value = []
    }
  }
}, { deep: true })

const onSubmit = async () => {
  errors.value = {}
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: login.value,
        password: password.value
      }),
      credentials: 'include'
    })

    if (!response.ok) {
      toast('Ошибка авторизации', { description: 'Ошибка', duration: 4000, class: 'bg-red-600 text-white' })
      return
    }
    toast('Успешный вход', { description: 'Добро пожаловать!', duration: 2000, class: 'bg-green-600 text-white' })
    await userStore.fetchCurrentUser()
    router.push('/')
  } catch (error) {
    console.log('error:', error)
    toast('Ошибка', { description: 'Сервер недоступен', duration: 4000, class: 'bg-red-600 text-white' })
  }
}
</script>

<style scoped>
.bg-input {
  background: #f7f8fa;
}
.text-muted-foreground {
  color: #7c7c8a;
}
.dark .bg-input {
  background: #23242a;
}
.dark .text-muted-foreground {
  color: #bbb;
}
</style>
