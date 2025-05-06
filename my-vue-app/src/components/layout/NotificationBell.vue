<template>
  <div class="relative inline-block notification-bell-wrapper">
    <Avatar class="notification-bell text-foreground w-8 h-8 flex items-center justify-center" @click.stop="toggleMenu">
      <svg class="w-5 h-5 text-foreground" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
      </svg>
      <span v-if="hasUnread" class="notification-badge"></span>
    </Avatar>
    <transition name="fade">
      <div v-if="showMenu" ref="menuRef" class="notification-menu notification-menu-scroll absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-md z-50">
        <div v-if="loading" class="p-4 text-gray-500 text-center">Загрузка...</div>
        <div v-else-if="error" class="p-4 text-red-500 text-center">{{ error }}</div>
        <div v-else-if="notifications.length === 0" class="p-4 text-gray-500 text-center">Нет новых уведомлений</div>
        <ul v-else>
          <li v-for="(notif, idx) in notifications" :key="notif.id || idx" class="px-4 py-3 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer relative group" :class="{'unread-notification': notif.isRead === false}" @click="markAsRead(notif)">
            <div class="flex items-center justify-between">
              <div class="font-medium">{{ notif.title }}</div>
              <div class="flex items-center gap-2">
                <span class="event-type-badge" :class="badgeClass(notif.eventType)" :style="{background: eventTypeColorMap[notif.eventType] || '#2563eb'}">{{ eventTypeMap[notif.eventType] || notif.eventType }}</span>
                <button class="delete-btn ml-2" :disabled="deletingMap[notif.id]" @click.stop="deleteNotification(notif.id, idx)" title="Удалить уведомление">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" :class="{'delete-cross': true}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="text-sm text-gray-700 mb-1">{{ notif.content }}</div>
            <div class="text-xs text-gray-500">{{ formatTime(notif.createdAt) }}</div>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Avatar } from '@/components/ui/avatar'
import { subscribe, unsubscribe } from '@/lib/websocket'
import { useUserStore } from '@/stores/userStore'

const deletingMap = ref<Record<number, boolean>>({})

async function deleteNotification(id: number, idx: number) {
  if (!id) return
  deletingMap.value[id] = true
  try {
    const resp = await fetch(`http://localhost:8080/api/notifications/${id}`, { method: 'DELETE' })
    if (!resp.ok) throw new Error('Ошибка удаления')
    notifications.value.splice(idx, 1)
  } catch (e: any) {
    alert(e.message || 'Ошибка удаления')
  } finally {
    deletingMap.value[id] = false
  }
}

const showMenu = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const eventTypeMap: Record<string, string> = {
  // TASK
  TASK_CREATED: 'Создана задача',
  TASK_UPDATED: 'Обновлена задача',
  TASK_DELETED: 'Удалена задача',
  TASK_ASSIGNED: 'Назначена задача',
  TASK_UNASSIGNED: 'Задача снята',
  // BOARD
  BOARD_ASSIGNED: 'Назначена доска',
  BOARD_UNASSIGNED: 'Доска снята',
  BOARD_SCOPE_CHANGED: 'Изменён доступ к доске',
  // BOARD ROLE
  BOARD_ROLE_CREATED: 'Создана роль на доске',
  BOARD_ROLE_UPDATED: 'Обновлена роль на доске',
  BOARD_ROLE_DELETED: 'Удалена роль на доске',
}

const eventTypeColorMap: Record<string, string> = {
  // TASK
  TASK_CREATED: '#2563eb',      // синий
  TASK_UPDATED: '#f59e42',      // оранжевый
  TASK_DELETED: '#dc2626',      // красный
  TASK_ASSIGNED: '#16a34a',     // зелёный
  TASK_UNASSIGNED: '#6b7280',   // серый
  // BOARD
  BOARD_ASSIGNED: '#a21caf',    // фиолетовый
  BOARD_UNASSIGNED: '#06b6d4',  // бирюзовый
  BOARD_SCOPE_CHANGED: '#eab308',// жёлтый
  // BOARD ROLE
  BOARD_ROLE_CREATED: '#ec4899',// розовый
  BOARD_ROLE_UPDATED: '#84cc16',// лаймовый
  BOARD_ROLE_DELETED: '#111827',// чёрный
}

const notifications = ref<any[]>([])
const loading = ref(false)
const error = ref('')
let loadedOnce = false

async function fetchNotifications() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch('http://localhost:8080/api/notifications?page=0&size=20&sort=id,desc')
    if (!response.ok) throw new Error('Ошибка загрузки уведомлений')
    const data = await response.json()
    notifications.value = Array.isArray(data.content) ? data.content.map((n: any) => ({
      id: n.id,
      title: n.title || 'Уведомление',
      content: n.content || '',
      createdAt: n.createdAt || '',
      eventType: n.eventType || '',
      isRead: n.isRead || false
    })) : []
  } catch (e: any) {
    error.value = e.message || 'Ошибка'
  } finally {
    loading.value = false
  }
}

function toggleMenu() {
  // Скрываем меню, если оно уже открыто, иначе открываем
  if (showMenu.value) {
    showMenu.value = false
    return
  }
  showMenu.value = true
  // Загружаем уведомления только при первом открытии
  if (!loadedOnce) {
    fetchNotifications()
    loadedOnce = true
  }
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    showMenu.value = false
  }
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'Только что'
  if (diffSec < 3600) return `${Math.floor(diffSec/60)} мин назад`
  if (diffSec < 86400) return `${Math.floor(diffSec/3600)} ч назад`
  return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function markAsRead(notif: any) {
  if (notif.isRead === false) notif.isRead = true
}

function badgeClass(eventType: string) {
  // Для красных badge (TASK_DELETED) возвращаем класс
  if (eventType === 'TASK_DELETED') return 'red-badge'
  return ''
}

const userStore = useUserStore()
const topic = `/topic/notification/user/${userStore.id}`

console.log('[NotificationBell] userStore.id:', userStore.id)
console.log('[NotificationBell] Подписка на топик:', topic)

const hasUnread = computed(() => notifications.value.some(n => n.isRead === false))

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  subscribe(topic, (msg: any) => {
    console.log('[NotificationBell] Получено сообщение по WebSocket:', msg)
    try {
      const notif = JSON.parse(msg.body)
      console.log('[NotificationBell] Парсинг уведомления:', notif)
      notifications.value.unshift({
        id: notif.id,
        title: notif.title || 'Уведомление',
        content: notif.content || '',
        createdAt: notif.createdAt || '',
        eventType: notif.eventType || '',
        isRead: notif.isRead || false
      })
    } catch (e) {
      console.error('[NotificationBell] Ошибка парсинга уведомления:', e)
    }
  })
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  unsubscribe(topic)
})
</script>

<style scoped>
.notification-bell-wrapper {
  position: relative;
  display: inline-block;
}
.notification-bell {
  cursor: pointer;
  position: relative;
}
.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #ff3b30;
  border-radius: 50%;
  border: 2px solid white;
  z-index: 2;
  box-shadow: 0 0 2px rgba(0,0,0,0.15);
}
.notification-menu {
  min-width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  overflow: hidden;
}
.dark .notification-menu {
  background: #18181b;
  color: #f3f4f6;
  box-shadow: 0 4px 16px rgba(0,0,0,0.45);
}

.notification-menu-scroll {
  max-height: 265px;
  overflow-y: scroll;
  scrollbar-width: thin;
  scrollbar-color: #2563eb #e0e7ef;
}
.notification-menu-scroll::-webkit-scrollbar {
  width: 10px;
  background: #e5e5e5;
  display: block;
}
.dark .notification-menu-scroll::-webkit-scrollbar {
  background: #27272a;
  display: block;
}
.notification-menu-scroll::-webkit-scrollbar-thumb {
  background: #1e40af;
  border-radius: 6px;
  box-shadow: 0 0 4px 2px rgba(30,64,175,0.15);
  transition: background 0.2s;
}
.dark .notification-menu-scroll::-webkit-scrollbar-thumb {
  background: #818cf8;
}
.notification-menu-scroll::-webkit-scrollbar-thumb:hover {
  background: #000;
}
.dark .notification-menu-scroll::-webkit-scrollbar-thumb:hover {
  background: #fff;
}
.notification-menu-scroll::-webkit-scrollbar-track {
  background: #e5e5e5;
  border-radius: 6px;
}
.dark .notification-menu-scroll::-webkit-scrollbar-track {
  background: #27272a;
}

.dark .notification-menu-scroll {
  scrollbar-color: #818cf8 #27272a;
}
.notification-menu-scroll ul {
  padding-right: 0;
}

.notification-menu-scroll::-webkit-scrollbar {
  width: 10px;
  background: #e5e5e5;
}
.dark .notification-menu-scroll::-webkit-scrollbar {
  background: #27272a;
}
.notification-menu-scroll::-webkit-scrollbar-thumb {
  background: #1e40af;
  border-radius: 6px;
  box-shadow: 0 0 4px 2px rgba(30,64,175,0.15);
  transition: background 0.2s;
}
.dark .notification-menu-scroll::-webkit-scrollbar-thumb {
  background: #818cf8;
}
.notification-menu-scroll::-webkit-scrollbar-thumb:hover {
  background: #000;
}
.dark .notification-menu-scroll::-webkit-scrollbar-thumb:hover {
  background: #fff;
}
.notification-menu-scroll::-webkit-scrollbar-track {
  background: #e5e5e5;
  border-radius: 6px;
}
.dark .notification-menu-scroll::-webkit-scrollbar-track {
  background: #27272a;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Dark theme notification item hover */
.dark .notification-menu ul li:hover {
  background: #27272a;
}

/* Dark theme border */
.dark .notification-menu ul li {
  border-color: #27272a;
}

/* Dark theme text */
.dark .notification-menu ul li .text-gray-700 {
  color: #d1d5db;
}
.dark .notification-menu ul li .text-gray-500 {
  color: #a1a1aa;
}

.event-type-badge {
  background: #2563eb;
  color: #fff;
  font-size: 10px;
  padding: 1px 7px 1px 7px;
  border-radius: 8px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.5;
  display: inline-block;
  vertical-align: middle;
  box-shadow: 0 1px 4px rgba(37,99,235,0.08);
  letter-spacing: 0.01em;
}

.delete-cross {
  stroke: #6b7280;
  transition: stroke 0.15s;
}
.delete-btn:hover .delete-cross {
  stroke: #dc2626;
}
.delete-btn:disabled .delete-cross {
  stroke: #a1a1aa;
}

.dark .event-type-badge {
  color: #e0e7ef;
  box-shadow: 0 1px 4px rgba(129,140,248,0.15);
  background: #2563eb;
}

.dark .event-type-badge.red-badge {
  background: #dc2626 !important;
  color: #fff !important;
}

.unread-notification {
  font-weight: bold;
  background: #fef2f2;
}

.dark .unread-notification {
  background: #27272a;
  color: #e5e5e5;
}
</style>
