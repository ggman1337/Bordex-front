<template>
  <div class="min-h-screen px-6 py-2 board-list w-full bg-background text-foreground">
    <h1 class="text-3xl font-semibold mb-4">Мои доски</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      <BoardCard v-for="board in boards" :key="board.id" :board="board" />
      <!-- Кнопка создать новую доску -->
      <div @click="openBoardModal" class="flex items-center justify-center bg-card text-card-foreground rounded-xl shadow p-5 min-w-[260px] cursor-pointer border-2 border-dashed border-border transition hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-primary hover:shadow-lg">
        <button class="flex flex-col items-center text-primary hover:text-primary dark:hover:text-white">
          <span class="text-4xl mb-2">+</span>
          <span class="text-base ">Создать новую доску</span>
        </button>
      </div>
    </div>
    <teleport to="body" v-if="showBoardModal">
      <!-- Модальное окно создания доски -->
      <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
        <Card class="w-96 bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Создать доску</CardTitle>
          </CardHeader>
          <CardContent>
            <label for="newBoardName" class="block mb-2 text-sm font-semibold dark:text-dark-200">Название доски</label>
            <input
              v-model="newBoardName"
              placeholder=" "
              class="w-full p-2 border border-input rounded bg-input text-foreground placeholder:text-muted-foreground focus:outline-none dark:border-white"
              id="newBoardName" />
          </CardContent>
          <CardFooter class="flex justify-end gap-2">
            <CardAction>
              <button @click="closeBoardModal" class="px-4 py-2 text-muted-foreground hover:text-foreground">Отмена</button>
            </CardAction>
            <CardAction>
              <button @click="submitBoardModal" class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">Создать</button>
            </CardAction>
          </CardFooter>
        </Card>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBoardStore } from '@/stores/boardStore'
import BoardCard from '@/components/boards/BoardCard.vue'
import type { Board as BoardType } from '@/components/boards/types'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import CardAction from '@/components/ui/card/CardAction.vue'

const { boards } = defineProps<{ boards: BoardType[] }>()
const boardStore = useBoardStore()

// Модальное окно создания доски
const showBoardModal = ref(false)
const newBoardName = ref('')
function openBoardModal() {
  newBoardName.value = ''
  showBoardModal.value = true
}
function closeBoardModal() {
  showBoardModal.value = false
}
async function submitBoardModal() {
  const name = newBoardName.value.trim()
  if (!name) return
  await boardStore.createBoard(name)
  closeBoardModal()
}
</script>

<style scoped>
.board-list {
  min-height: 100vh;
}
</style>
