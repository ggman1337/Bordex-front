<template>
  <div class="bg-white rounded-xl shadow p-5 flex flex-col min-w-[260px]">
    <div class="flex-1">
      <div class="font-semibold text-lg mb-2" v-html="board.title"></div>
      <div class="flex items-center text-xs text-gray-500 mb-3">
        <span class="mr-4">Участников: {{ board.members }}</span>
        <span>Задач: {{ board.tasks }}</span>
      </div>
    </div>
    <div class="flex items-center justify-between mt-auto">
      <button @click="openBoard" class="text-blue-600 hover:underline text-sm">Открыть доску</button>
      <div class="flex -space-x-2">
        <template v-for="(avatar, idx) in board.avatars" :key="idx">
          <img
            v-if="avatar.img"
            :src="avatar.img"
            class="w-7 h-7 rounded-full border-2 border-white shadow"
          />
          <span
            v-else
            class="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow"
          >
            {{ avatar.initials }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
interface Avatar { img?: string; initials?: string }
interface Board { id: number; title: string; members: number; tasks: number; avatars: Avatar[] }
const props = defineProps<{ board: Board }>()
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
