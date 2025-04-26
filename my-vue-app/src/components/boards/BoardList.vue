<template>
  <div class="min-h-screen px-6 py-2 board-list w-full">
    <h1 class="text-3xl font-semibold mb-4">Мои доски</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      <BoardCard v-for="board in filteredBoards" :key="board.id" :board="board" />
      <!-- Кнопка создать новую доску -->
      <div class="flex items-center justify-center bg-white rounded-xl shadow p-5 min-w-[260px] cursor-pointer hover:bg-blue-50 transition border-2 border-dashed border-blue-300">
        <button class="flex flex-col items-center text-blue-600" @click="createBoard">
          <span class="text-4xl mb-2">+</span>
          <span class="text-base">Создать новую доску</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import BoardCard from '@/components/boards/BoardCard.vue'
import type { Board as BoardType } from '@/components/boards/types'

// Моковые данные для досок
const boards = ref<BoardType[]>([
  {
    id: 1,
    title: 'Проект <b>“Bordex”</b>',
    members: 4,
    tasks: 6,
    avatars: [
      { initials: 'КО' },
      { initials: 'AA' },
    ],
  },
  {
    id: 2,
    title: 'Историческая игра',
    members: 6,
    tasks: 12,
    avatars: [
      { initials: 'KL' },
      { initials: 'AA' },
    ],
  },
  {
    id: 3,
    title: 'Портфолио–визитка',
    members: 1,
    tasks: 7,
    avatars: [
      { initials: 'AA' },
    ],
  },
])

const userStore = useUserStore()
const filteredBoards = computed(() =>
  boards.value.filter(board =>
    board.avatars.some(a =>
      (a.initials && a.initials === userStore.getUserById(1)?.avatar.initials) ||
      (a.img && a.img === userStore.getUserById(1)?.avatar.img)
    )
  )
)

function createBoard() {
  alert('Создать новую доску')
}
</script>

<style scoped>
.board-list {
  min-height: 100vh;
}
</style>
