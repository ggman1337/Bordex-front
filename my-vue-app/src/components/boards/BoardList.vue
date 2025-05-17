<template>
  <div class="min-h-screen px-6 py-2 board-list w-full bg-background text-foreground">
    <h1 class="text-3xl font-semibold mb-4">Мои доски</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      <BoardCard v-for="board in boards" :key="board.id" :board="board" @updateBoard="openEditBoardModal" />
      <!-- Кнопка создать новую доску -->
      <div @click="openBoardModal" class="flex items-center justify-center bg-card text-card-foreground rounded-xl shadow p-5 min-w-[10rem] max-w-[20rem] cursor-pointer border-2 border-dashed border-border transition hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-primary hover:shadow-lg">
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
            <label for="newBoardDescription" class="block mt-4 mb-2 text-sm font-semibold dark:text-dark-200">Описание доски</label>
            <textarea v-model="newBoardDescription" id="newBoardDescription" rows="3" class="w-full p-2 border border-input rounded bg-input text-foreground placeholder:text-muted-foreground focus:outline-none dark:border-white"></textarea>
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
    <teleport to="body" v-if="showEditBoardModal">
      <!-- Модальное окно редактирования доски -->
      <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
        <Card class="w-96 bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Изменить доску</CardTitle>
          </CardHeader>
          <CardContent>
            <label for="editBoardName" class="block mb-2 text-sm font-semibold dark:text-dark-200">Название доски</label>
            <input v-model="editBoardName" id="editBoardName" placeholder=" " class="w-full p-2 border border-input rounded bg-input text-foreground placeholder:text-muted-foreground focus:outline-none dark:border-white" />
            <label for="editBoardDescription" class="block mt-4 mb-2 text-sm font-semibold dark:text-dark-200">Описание доски</label>
            <textarea v-model="editBoardDescription" id="editBoardDescription" rows="3" class="w-full p-2 border border-input rounded bg-input text-foreground placeholder:text-muted-foreground focus:outline-none dark:border-white"></textarea>
          </CardContent>
          <CardFooter class="flex justify-end gap-2">
            <CardAction>
              <button @click="closeEditBoardModal" class="px-4 py-2 text-muted-foreground hover:text-foreground">Отмена</button>
            </CardAction>
            <CardAction>
              <button @click="submitEditBoardModal" class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">Сохранить</button>
            </CardAction>
          </CardFooter>
        </Card>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, onMounted, onBeforeUnmount, watch } from 'vue'
import { useBoardStore } from '@/stores/boardStore'
import { useUserStore } from '@/stores/userStore'
import BoardCard from '@/components/boards/BoardCard.vue'
import type { Board as BoardType } from '@/components/boards/types'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import CardAction from '@/components/ui/card/CardAction.vue'

const props = defineProps<{ boards: BoardType[] }>()
const boards = toRef(props, 'boards')
const boardStore = useBoardStore()
const userStore = useUserStore()
let connectedBoardIds: number[] = []

async function connectAllBoards() {
  await userStore.fetchCurrentUser()
  if (userStore.id) {
    boardStore.connectUserBoardRealtime(userStore.id)
  }
}
function disconnectAllBoards() {
  boardStore.disconnectUserBoardRealtime(userStore.id)
  connectedBoardIds = []
}

onMounted(() => {
  connectAllBoards()
})
onBeforeUnmount(() => {
  disconnectAllBoards()
})

// Модальное окно создания доски
const showBoardModal = ref(false)
const newBoardName = ref('')
const newBoardDescription = ref('')
function openBoardModal() {
  newBoardName.value = ''
  newBoardDescription.value = ''
  showBoardModal.value = true
}
function closeBoardModal() {
  showBoardModal.value = false
}
async function submitBoardModal() {
  const name = newBoardName.value.trim()
  const description = newBoardDescription.value.trim()
  if (!name) return
  await boardStore.createBoard(name, description || undefined)
  if (userStore.id) {
    await boardStore.fetchBoards(userStore.id)
  } else {
    const stop = watch(() => userStore.id, async (id) => {
      if (id) {
        await boardStore.fetchBoards(id)
        stop()
      }
    })
  }
  closeBoardModal()
}

// Модальное окно редактирования доски
const showEditBoardModal = ref(false)
const editBoardId = ref<number | null>(null)
const editBoardName = ref('')
const editBoardDescription = ref('')
function openEditBoardModal(board: BoardType) {
  editBoardId.value = board.id
  editBoardName.value = board.title
  editBoardDescription.value = board.description ?? ''
  showEditBoardModal.value = true
}
function closeEditBoardModal() {
  showEditBoardModal.value = false
}
async function submitEditBoardModal() {
  const id = editBoardId.value
  if (!id) return
  const name = editBoardName.value.trim()
  if (!name) return
  await boardStore.updateBoard(id, { name, description: editBoardDescription.value })
  closeEditBoardModal()
}
</script>

<style scoped>
.board-list {
  min-height: 100vh;
}
</style>
