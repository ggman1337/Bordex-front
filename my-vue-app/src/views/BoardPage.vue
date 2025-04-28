<template>
  <MainLayout>
    <div class="px-6 py-2 dark:bg-dark-800 text-foreground">
      <h1 v-if="board" class="text-3xl font-semibold mb-4 dark:text-dark-100" v-text="board.title" />
      <div class="flex gap-6 overflow-x-auto">
        <BoardColumn
          v-for="col in columns"
          :key="col.id"
          :column="col"
          @createTask="openNewTaskForm"
          @updateTask="openEditTaskForm"
        />
      </div>
      <teleport to="body" v-if="showTaskModal">
        <!-- Модальное окно задачи -->
        <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <Card class="w-96 dark:bg-dark-700">
            <CardHeader>
              <CardTitle class="dark:text-dark-100">{{ editTask ? 'Редактировать задачу' : 'Создать задачу' }}</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex flex-col gap-4">
                <input v-model="modalTitle" placeholder=" " class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100" />
                <textarea v-model="modalDescription" placeholder="Описание" class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100"></textarea>
                <select v-model="modalStatus" class="bg-card text-card-foreground w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100">
                  <option value="NEW">Нужно сделать</option>
                  <option value="IN_PROGRESS">В процессе</option>
                  <option value="DONE">Готово</option>
                </select>
                <select v-model="modalPriority" class="bg-card text-card-foreground w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100">
                  <option value="LOW">Низкий</option>
                  <option value="MEDIUM">Средний</option>
                  <option value="HIGH">Высокий</option>
                </select>
              </div>
            </CardContent>
            <CardFooter class="flex justify-end gap-2">
              <CardAction><button @click="closeTaskModal" class="px-4 py-2 dark:text-dark-200">Отмена</button></CardAction>
              <CardAction><button @click="submitTaskModal" class="px-4 py-2 bg-blue-600 text-white rounded dark:bg-blue-500 dark:hover:bg-blue-600">{{ editTask ? 'Сохранить' : 'Создать' }}</button></CardAction>
            </CardFooter>
          </Card>
        </div>
      </teleport>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import BoardColumn from '@/components/boards/BoardColumn.vue'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import CardAction from '@/components/ui/card/CardAction.vue'
import type { Task as BoardTask, BoardColumn as ColumnType } from '@/components/boards/types.ts'
import { useRoute } from 'vue-router'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useBoardStore } from '@/stores/boardStore'
import { useTaskStore } from '@/stores/taskStore'

const route = useRoute()
const boardId = Number(route.params.id)
const boardStore = useBoardStore()
const taskStore = useTaskStore()
const board = computed(() => boardStore.boardById(boardId))
const columns = computed(() => taskStore.columns)

boardStore.fetchBoards()

// Модальный режим
const showTaskModal = ref(false)
const editTask = ref<BoardTask | null>(null)
const selectedColumnId = ref<number | null>(null)
const modalTitle = ref('')
const modalDescription = ref('')
const modalStatus = ref<'NEW' | 'IN_PROGRESS' | 'DONE'>('NEW')
const modalPriority = ref<'LOW' | 'MEDIUM' | 'HIGH'>('LOW')

// Открыть форму создания
function openNewTaskForm(columnId: number) {
  editTask.value = null
  selectedColumnId.value = columnId
  modalTitle.value = ''
  modalDescription.value = ''
  modalStatus.value = columnId === 1 ? 'NEW' : columnId === 2 ? 'IN_PROGRESS' : 'DONE'
  modalPriority.value = 'LOW'
  showTaskModal.value = true
}

// Открыть форму редактирования
function openEditTaskForm(task: BoardTask) {
  editTask.value = task
  selectedColumnId.value = null
  modalTitle.value = task.title
  modalDescription.value = task.description
  modalStatus.value = task.tag.label as any
  modalPriority.value = task.priority as any
  showTaskModal.value = true
}

function closeTaskModal() {
  showTaskModal.value = false
}

async function submitTaskModal() {
  if (editTask.value) {
    // редактирование
    await taskStore.updateTask(editTask.value.id, {
      name: modalTitle.value,
      description: modalDescription.value,
      status: modalStatus.value,
      priority: modalPriority.value
    })
  } else if (selectedColumnId.value) {
    // создание
    await taskStore.createTask(boardId, {
      name: modalTitle.value,
      description: modalDescription.value,
      status: modalStatus.value,
      priority: modalPriority.value
    })
  }
  closeTaskModal()
}

onMounted(() => taskStore.connect(boardId))
onBeforeUnmount(() => taskStore.disconnect())
</script>

<style scoped>
</style>
