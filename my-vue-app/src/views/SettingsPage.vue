<template>
  <MainLayout>
    <div class="px-6 py-2 dark:bg-dark-800 text-foreground">
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
                  <Switch v-model:checked="settings.autosave" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Настройка темы</span>
                  <ThemeToggle />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700 dark:text-gray-300">Звуковые эффекты</span>
                  <Switch v-model:checked="settings.soundEffects" />
                </div>
                <div class="space-y-2">
                  <span class="text-gray-700 dark:text-gray-300">Размер шрифта</span>
                  <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>12px</span>
                    <span>24px</span>
                  </div>
                  <Slider 
                    v-model="settings.fontSize" 
                    :min="12" 
                    :max="24" 
                    :step="1" 
                    class="w-full"
                  />
                  <div class="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">{{ settings.fontSize }}px</div>
                </div>
              </div>
            </div>
            
            <!-- Заглушки для других вкладок -->
            <div v-else-if="activeTab === 'notifications'">
              <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Уведомления</h2>
              <p class="text-gray-600 dark:text-gray-400">Настройки уведомлений скоро появятся здесь.</p>
            </div>
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
import { ref, shallowRef } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { Switch } from '@/components/ui/switch'
import Slider from '@/components/ui/slider/Slider.vue'
import { Settings as SettingsIcon, Bell, Home, Languages } from 'lucide-vue-next'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const activeTab = ref('general')

const tabs = shallowRef([
  { id: 'general', name: 'Общие', icon: SettingsIcon },
  { id: 'notifications', name: 'Уведомления', icon: Bell },
  { id: 'appearance', name: 'Внешний вид', icon: Home },
  { id: 'language', name: 'Язык', icon: Languages },
])

const settings = ref({
  autosave: true,
  soundEffects: false,
  fontSize: [16],
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