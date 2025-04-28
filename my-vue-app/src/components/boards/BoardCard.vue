<template>
  <div class="bg-card text-card-foreground rounded-xl shadow p-5 flex flex-col min-w-[260px]">
    <div class="flex-1">
      <div class="font-semibold text-lg mb-2" v-html="board.title"></div>
      <div class="flex items-center text-xs text-muted-foreground mb-3">
        <span class="mr-4">Участников: {{ board.membersCount }}</span>
        <span>Задач: {{ board.tasksCount }}</span>
      </div>
    </div>
    <div class="flex items-center justify-between mt-auto">
      <button @click="openBoard" class="text-primary hover:underline text-sm">Открыть доску</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
import type { Board as BoardType } from '@/components/boards/types'
const props = defineProps<{ board: BoardType }>()
const { board } = props
const router = useRouter()
const boardStore = useBoardStore()
function openBoard() {
  // Сохраняем последнюю открытую доску
  boardStore.setCurrentBoard(board.id)
  router.push({ name: 'Board', params: { id: board.id } })
}
</script>

<style scoped>
</style>
