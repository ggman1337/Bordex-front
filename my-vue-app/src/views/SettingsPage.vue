<template>
  <MainLayout>
    <div v-if="userStore.id && userStore.id !== 0" class="px-6 py-2 dark:bg-dark-800 text-foreground">
        <h1 class="text-3xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Настройки</h1>
      <div class="flex flex-col md:flex-row gap-8 w-full h-full p-6 bg-gray-100 dark:bg-[#181b20] min-h-screen shadow-md rounded-2xl">
        <div class="w-full md:w-1/4 mb-6 md:mb-0">
          <div class="bg-white dark:bg-[#23272f] rounded-xl shadow p-4">
            <nav class="space-y-2">
              <button 
                v-for="tab in tabs" 
                :key="tab.id" 
                @click="activeTab = tab.id"
                :class="[
                  'w-full flex items-center px-4 py-2 rounded-md text-left transition-colors duration-150',
                  activeTab === tab.id ? 'bg-blue-100 text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                ]"
              >
                <component :is="tab.icon" class="w-5 h-5 mr-3" />
                <span>{{ tab.name }}</span>
              </button>
            </nav>
          </div>
        </div>
        <div class="flex-1">
          <div class="bg-white dark:bg-[#23272f] rounded-xl shadow p-6">
            <!-- Контент для вкладки "Общие" -->
            <div v-if="activeTab === 'general'">
              <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Общие настройки</h2>
              <div class="space-y-5">
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Автосохранение</span>
                  <MySwitch v-model:checked="settings.autosave" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Настройка темы</span>
                  <ThemeToggle />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Звуковые эффекты</span>
                  <MySwitch v-model:checked="settings.soundEffects" />
                </div>
                <div class="space-y-2">
                  <span class="text-gray-700 dark:text-gray-300">Размер шрифта</span>
                  <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>12px</span>
                    <span>24px</span>
                  </div>
                  <Slider 
                    v-model="userStore.fontSize" 
                    :min="12" 
                    :max="24" 
                    :step="1" 
                    class="w-full"
                  />
                  <div class="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">{{ userStore.fontSize }}px</div>
                </div>
              </div>
            </div>
            
            <!-- Контент для вкладки "Уведомления" -->
            <div v-else-if="activeTab === 'notifications'">
              <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Уведомления</h2>
              <div class="space-y-5">
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Веб-уведомления</span>
                  <MySwitch v-model:checked="allowOnSite" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="flex items-center text-gray-700 dark:text-gray-300">
  Уведомления Telegram
  <svg width="20" height="20" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="telegram-icon ml-1"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><circle cx="120" cy="120" r="120" fill="#29B6F6"></circle><path d="M179.5 79.5L158.5 171.5C158.5 171.5 157.5 176.5 152.5 176.5C149.5 176.5 148 175 148 175L97.5 135.5L74.5 124.5L51.5 117.5C51.5 117.5 48 116.5 48 113C48 109.5 52.5 108.5 52.5 108.5L175.5 60.5C175.5 60.5 180.5 59 181.5 62C182.5 65 179.5 79.5 179.5 79.5Z" fill="white"></path><path d="M113 154.5L96.5 171.5C96.5 171.5 95.5 172.5 94 172.5C93.5 172.5 93 172.5 92.5 172L97.5 135.5L113 154.5Z" fill="#B0BEC5"></path><path d="M148 92.5L97.5 135.5L113 154.5L97.5 135.5L148 92.5Z" fill="#CFD8DC"></path></g></svg>
</span>
                  <MySwitch v-model:checked="allowTelegram" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Уведомления Email</span>
                  <MySwitch v-model:checked="allowEmail" />
                </div>
              </div>
            </div>

            <!-- Заглушки для других вкладок -->
            <div v-else-if="activeTab === 'appearance'">
              <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Внешний вид</h2>
              <p class="text-gray-600 dark:text-gray-400">Настройки внешнего вида скоро появятся здесь.</p>
            </div>
            <div v-else-if="activeTab === 'language'">
              <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Язык</h2>
              <p class="text-gray-600 dark:text-gray-400">Настройки языка скоро появятся здесь.</p>
            </div>

          </div>
        </div>
      </div>
    </div>  
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import MySwitch from '@/components/ui/MySwitch.vue'
import Slider from '@/components/ui/slider/Slider.vue'
import { Settings as SettingsIcon, Bell, Home, Languages } from 'lucide-vue-next'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { useUserStore } from '@/stores/userStore'
import { apiFetch } from '@/api/apiFetch'

const userStore = useUserStore()
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const activeTab = ref('general')

const tabs = shallowRef([
  { id: 'general', name: 'Общие', icon: SettingsIcon },
  { id: 'notifications', name: 'Уведомления', icon: Bell },
  { id: 'appearance', name: 'Внешний вид', icon: Home },
  { id: 'language', name: 'Язык', icon: Languages },
])

// Local settings for general tab
interface UserSettings {
  autosave: boolean
  soundEffects: boolean
  fontSize: number
}
const settings = ref<UserSettings>({
  autosave: true,
  soundEffects: false,
  fontSize: 16,
})

// Computed bindings for notification toggles
const allowOnSite = computed<boolean>({
  get: () => userStore.allowOnSiteNotifications ?? false,
  set: async (val: boolean) => {
    await apiFetch(`${baseUrl}/api/users/${userStore.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowOnSiteNotifications: val })
    })
    userStore.allowOnSiteNotifications = val
  }
})

const allowTelegram = computed<boolean>({
  get: () => userStore.allowTelegramNotifications ?? false,
  set: async (val: boolean) => {
    await apiFetch(`${baseUrl}/api/users/${userStore.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowTelegramNotifications: val })
    })
    userStore.allowTelegramNotifications = val
  }
})

const allowEmail = computed<boolean>({
  get: () => userStore.allowEmailNotifications ?? false,
  set: async (val: boolean) => {
    await apiFetch(`${baseUrl}/api/users/${userStore.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowEmailNotifications: val })
    })
    userStore.allowEmailNotifications = val
  }
})
</script>

<style scoped>
.shadow-md {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.13);
}
.dark .shadow-md {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.45);
}
</style>