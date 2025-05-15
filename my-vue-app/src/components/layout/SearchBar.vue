<template>
  <div class="relative flex-1">
    <div class="flex items-center gap-2 w-full min-w-0">
      <div class="relative w-full">
        <input
          type="text"
          v-model="query"
          @input="onInput"
          placeholder="Поиск..."
          class="pl-9 pr-9 w-full h-10 rounded border bg-transparent"
        />
        <span class="absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon class="w-4 h-4 text-muted-foreground"/>
        </span>
        <button
          v-if="query"
          @click.stop="clearQuery"
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </div>
      <select v-model="filterBy" class="bg-background border rounded px-2 py-1">
        <option value="name">По имени</option>
        <option value="description">По описанию</option>
      </select>
    </div>
    <ul v-if="isOpen && query.trim()" class="absolute z-10 mt-1 w-full bg-background border rounded-md max-h-60 overflow-auto">
      <li v-if="filteredItems.length === 0" class="p-2 text-sm text-muted-foreground">Ничего не найдено</li>
      <li
        v-for="item in filteredItems"
        :key="item.id"
        @mousedown.prevent="selectItem(item)"
        class="p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
      >
        {{ filterBy === 'name' ? item.name : item.description }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search as SearchIcon, X as XIcon } from 'lucide-vue-next'
import { apiFetch } from '@/api/apiFetch'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const route = useRoute()
const query = ref('')
const filterBy = ref<'name'|'description'>('name')
const items = ref<any[]>([])
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const isOpen = ref(false)

async function fetchItems() {
  if (!query.value.trim()) {
    items.value = []
    return
  }
  let url = ''
  if (route.name === 'Boards' || route.name === 'Home') {
    url = `${BASE_URL}/api/boards?${filterBy.value}=${encodeURIComponent(query.value)}&memberIds=${userStore.id}&page=0&size=200`
  } else if (route.name === 'Board') {
    const boardId = route.params.id
    url = `${BASE_URL}/api/tasks?boardId=${boardId}&${filterBy.value}=${encodeURIComponent(query.value)}&page=0&size=200`
  } else {
    url = `${BASE_URL}/api/tasks?${filterBy.value}=${encodeURIComponent(query.value)}&assigneeIds=${userStore.id}&page=0&size=200`
  }
  const res = await apiFetch(url)
  const data = await res.json()
  items.value = data.content
}

const filteredItems = computed(() => {
  if (!query.value.trim()) return items.value
  return items.value.filter(item => {
    const value = filterBy.value === 'name' ? item.name : item.description
    return value.toLowerCase().includes(query.value.toLowerCase())
  })
})

let timer: number|null = null
watch(query, () => {
  if (timer) clearTimeout(timer)
  timer = window.setTimeout(fetchItems, 300)
  isOpen.value = true
})

watch(filterBy, () => {
  items.value = []
  timer = null
  if (query.value.trim()) {
    fetchItems()
  }
  isOpen.value = true
})

function clearQuery() {
  query.value = ''
  items.value = []
  timer = null
  isOpen.value = false
}

function onInput() {
  isOpen.value = true
}

function selectItem(item: any) {
  query.value = filterBy.value === 'name' ? item.name : item.description
  items.value = []
  timer = null
  isOpen.value = false
  // Determine prefix based on current route: board for Boards/Home, task otherwise
  const prefix = route.name === 'Boards' || route.name === 'Home' ? 'board' : 'task'
  setTimeout(() => {
    const el = document.getElementById(`${prefix}-${item.id}`)
    if (el) {
      el.classList.add(
        'ring-4',
        'ring-green-400',
        'bg-green-100',
        'dark:ring-green-600',
        'dark:bg-green-800',
        'animate-pulse'
      )
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        el.classList.remove(
          'ring-4',
          'ring-green-400',
          'bg-green-100',
          'dark:ring-green-600',
          'dark:bg-green-800',
          'animate-pulse'
        )
      }, 3000)
    }
  }, 100)
}
</script>