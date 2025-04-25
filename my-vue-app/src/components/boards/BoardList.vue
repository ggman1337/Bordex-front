<template>
  <div class="px-6 py-4 board-list">
    <h1 class="text-3xl font-semibold mb-6">Мои доски</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BoardCard v-for="board in boards" :key="board.id" :board="board" />
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
import { ref } from 'vue'
import BoardCard from '@/components/boards/BoardCard.vue'

// Моковые данные для досок
const boards = ref([
  {
    id: 1,
    title: 'Проект <b>“Bordex”</b>',
    members: 4,
    tasks: 6,
    avatars: [
      { initials: 'КО' },
      { img: 'https://randomuser.me/api/portraits/men/32.jpg' },
    ],
  },
  {
    id: 2,
    title: 'Историческая игра',
    members: 6,
    tasks: 12,
    avatars: [
      { initials: 'KL' },
    ],
  },
  {
    id: 3,
    title: 'Портфолио–визитка',
    members: 1,
    tasks: 7,
    avatars: [
      { img: 'https://randomuser.me/api/portraits/men/33.jpg' },
    ],
  },
])

function createBoard() {
  alert('Создать новую доску')
}
</script>

<style scoped>
.board-list {
  background: #f4f7fa;
  min-height: 100vh;
}
</style>
