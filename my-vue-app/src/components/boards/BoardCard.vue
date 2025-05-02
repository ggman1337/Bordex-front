<template>
  <div class="relative bg-card text-card-foreground rounded-xl shadow p-5 flex flex-col min-w-[10rem] max-w-[20rem]" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div class="flex-1">
      <div class="flex items-center justify-between mb-2">
        <div class="font-semibold text-lg" v-html="board.title"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button class="text-muted-foreground hover:text-foreground text-xl -mt-2"><span>...</span></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-32">
            <DropdownMenuItem @click="emit('updateBoard', board)">Изменить</DropdownMenuItem>
            <DropdownMenuItem class="text-red-500" @click="openDeleteModal">Удалить</DropdownMenuItem>
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
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
import { ref, onUnmounted, toRef } from 'vue'
import type { Board as BoardType } from '@/components/boards/types'
import DropdownMenu from '@/components/ui/dropdown-menu/DropdownMenu.vue'
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import BoardDeleteModal from './BoardDeleteModal.vue'

const props = defineProps<{ board: BoardType }>()
const board = toRef(props, 'board')
const router = useRouter()
const boardStore = useBoardStore()
const showDescription = ref(false)
let hoverTimer: number | null = null

const showDeleteModal = ref(false)
function openDeleteModal() { showDeleteModal.value = true }
function closeDeleteModal() { showDeleteModal.value = false }
function onDeleted() { emit('deleteBoard', board.value) }

const emit = defineEmits<{
  (e: 'updateBoard', board: BoardType): void;
  (e: 'deleteBoard', board: BoardType): void;
}>()

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

onUnmounted(() => {
  if (hoverTimer !== null) {
    clearTimeout(hoverTimer)
  }
})
</script>

<style scoped>
</style>