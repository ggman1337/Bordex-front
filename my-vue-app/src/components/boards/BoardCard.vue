<template>
  <div :id="`board-${board.id}`" :class="['relative bg-card text-card-foreground rounded-xl shadow p-5 flex flex-col min-w-[10rem] max-w-[20rem]', isCurrent ? 'border-2 border-blue-500' : '']" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div class="flex-1">
      <div class="flex items-center justify-between mb-2">
        <div class="font-semibold text-lg" v-html="board.title || 'Без названия'"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button class="text-muted-foreground hover:text-foreground text-xl -mt-2"><span>...</span></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-32">
            <template v-if="isOwner">
              <DropdownMenuItem @click="emit('updateBoard', board)">Изменить</DropdownMenuItem>
              <DropdownMenuItem class="text-red-500" @click="openDeleteModal">Удалить</DropdownMenuItem>
            </template>
            <template v-else>
              <DropdownMenuItem class="text-red-500" @click="openLeaveModal">Покинуть</DropdownMenuItem>
            </template>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div class="flex items-center text-xs text-muted-foreground mb-3">
        <template v-if="showDescription && board.description">
          {{ board.description }}
        </template>
        <template v-else>
          <span class="mr-4">Участников: {{ board.membersCount }}</span>
          <span>Задач: {{ board.tasksCount }}</span>
        </template>
      </div>
    </div>
    <div class="flex items-center justify-between mt-auto">
      <button @click="openBoard" class="text-primary hover:underline text-sm">Открыть доску</button>
    </div>
    <BoardDeleteModal v-if="showDeleteModal" :board="board" @close="closeDeleteModal" @deleted="onDeleted" />
    <teleport to="body">
      <div v-if="showLeaveModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div :class="[isDark ? 'bg-black text-white' : 'bg-white text-black', 'p-6 rounded-xl shadow-xl w-full max-w-xs']">
          <h3 class="text-lg font-semibold mb-4">Вы действительно хотите покинуть доску?</h3>
          <div class="flex justify-end gap-2">
            <button @click="closeLeaveModal" class="px-3 py-1 border rounded">Отмена</button>
            <button @click="leaveBoardCard" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Покинуть</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
import { useUserStore } from '@/stores/userStore'
import { ref, onMounted, onUnmounted, toRef, computed } from 'vue'
import { apiFetch } from '@/api/apiFetch'
import type { Board as BoardType } from '@/components/boards/types'
import DropdownMenu from '@/components/ui/dropdown-menu/DropdownMenu.vue'
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import BoardDeleteModal from './BoardDeleteModal.vue'
import { urlConfig } from '@/config/websocket.config'

const BASE_URL = urlConfig.restUrl
const props = defineProps<{ board: BoardType }>()
const board = toRef(props, 'board')
const router = useRouter()
const boardStore = useBoardStore()
const userStore = useUserStore()
const isCurrent = computed(() => boardStore.currentBoardId === board.value.id)
const isOwner = computed(() => userStore.id === board.value.owner.id)
const showDescription = ref(false)
let hoverTimer: number | null = null

const showDeleteModal = ref(false)
function openDeleteModal() { showDeleteModal.value = true }
function closeDeleteModal() { showDeleteModal.value = false }
function onDeleted() { emit('deleteBoard', board.value) }

const showLeaveModal = ref(false)
function openLeaveModal() { showLeaveModal.value = true }
function closeLeaveModal() { showLeaveModal.value = false }

const isDark = ref(false)
let themeObserver: MutationObserver | null = null
function updateIsDark() { isDark.value = document.documentElement.classList.contains('dark') }
onMounted(() => {
  updateIsDark()
  themeObserver = new MutationObserver(updateIsDark)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
onUnmounted(() => {
  if (themeObserver) { themeObserver.disconnect(); themeObserver = null }
  if (hoverTimer !== null) {
    clearTimeout(hoverTimer)
  }
})

const emit = defineEmits<{
  (e: 'updateBoard', board: BoardType): void;
  (e: 'deleteBoard', board: BoardType): void;
}>()

async function leaveBoardCard() {
  showLeaveModal.value = false
  await apiFetch(`${BASE_URL}/api/boards/${board.value.id}/leave`, { method: 'DELETE' })
  if (userStore.id) await boardStore.fetchBoards(userStore.id)
  if (boardStore.currentBoardId === board.value.id) router.push('/boards')
}

function openBoard() {
  boardStore.setCurrentBoard(board.value.id)
  router.push(`/boards/${board.value.id}`)
}

function onMouseEnter() {
  hoverTimer = window.setTimeout(() => {
    showDescription.value = true
  }, 1000)
}

function onMouseLeave() {
  if (hoverTimer !== null) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
  showDescription.value = false
}
</script>

<style scoped>
</style>