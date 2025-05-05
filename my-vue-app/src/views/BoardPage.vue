<template>
  <MainLayout>
    <div class="px-6 py-2 dark:bg-dark-800 text-foreground">
      <h1 v-if="!isUserLoading" class="text-3xl font-semibold mb-4 dark:text-dark-100">{{ boardName }}</h1>
      <div v-else class="text-xl font-semibold mb-4 dark:text-dark-100">Загрузка...</div>
      <div class="flex gap-6 overflow-x-auto">
        <BoardColumn
          v-for="col in columns"
          :key="col.id"
          :column="col"
          :board-id="boardId"
          @createTask="openNewTaskForm"
          @updateTask="onTaskUpdate"
          @deleteTask="openDeleteModal"
          @assignToUser="assignToUser"
        />
      </div>
      <teleport to="body" v-if="showTaskModal && !editTask">
        <!-- Модальное окно задачи -->
        <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <Card class="w-96 dark:bg-dark-700">
            <CardHeader>
              <CardTitle class="dark:text-dark-100">{{ editTask ? 'Редактировать задачу' : 'Создать задачу' }}</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex flex-col gap-4">
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Название</span>
                  <input v-model="modalTitle" placeholder=" " class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100" />
                </label>
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Описание</span>
                  <textarea v-model="modalDescription" placeholder="Описание" class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100"></textarea>
                </label>
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Тег</span>
                  <select v-model="modalTag" class="bg-card text-card-foreground w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100">
                    <option v-for="t in tagValues" :key="t" :value="t">{{ t }}</option>
                  </select>
                </label>
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Статус</span>
                  <select v-model="modalStatus" class="bg-card text-card-foreground w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100">
                    <option value="NEW">Нужно сделать</option>
                    <option value="IN_PROGRESS">В процессе</option>
                    <option value="DONE">Готово</option>
                  </select>
                </label>
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Приоритет</span>
                  <select v-model="modalPriority" class="bg-card text-card-foreground w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100">
                    <option value="LOW">Не важно</option>
                    <option value="MEDIUM">Нормально</option>
                    <option value="HIGH">Важно</option>
                  </select>
                </label>
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Дедлайн</span>
                  <Popover>
                    <PopoverTrigger as-child>
                      <Button
                        variant="outline"
                        :class="cn(
                          'w-full justify-start text-left font-normal',
                          !modalDeadline && 'text-muted-foreground',
                        )"
                      >
                        <CalendarIcon class="mr-2 h-4 w-4" />
                        {{ modalDeadline ? df.format(modalDeadline.toDate(getLocalTimeZone())) : "Выберите дату" }}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0">
                      <Calendar v-model="modalDeadline" initial-focus />
                    </PopoverContent>
                  </Popover>
                </label>
              </div>
            </CardContent>
            <CardFooter class="flex justify-end gap-2">
              <CardAction><button @click="closeTaskModal" class="px-4 py-2 dark:text-dark-200">Отмена</button></CardAction>
              <CardAction><button @click="submitTaskModal" class="px-4 py-2 bg-blue-600 text-white rounded dark:bg-blue-500 dark:hover:bg-blue-600">{{ editTask ? 'Сохранить' : 'Создать' }}</button></CardAction>
            </CardFooter>
          </Card>
        </div>
      </teleport>
      <TaskModal v-if="showTaskModal && editTask" :task="editTask!" @close="closeTaskModal" @updated="onModalUpdated" />
      <TaskDeleteModal v-if="showDeleteModal" :task="selectedDeleteTask!" @close="closeDeleteModal" @deleted="onDeleted" />
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
import type { Task as BoardTask, TagValue } from '@/components/boards/types.ts'
import { tagValues } from '@/components/boards/types.ts'
import { useRoute } from 'vue-router'
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useBoardStore } from '@/stores/boardStore'
import { useTaskStore } from '@/stores/taskStore'
import { useUserStore, type User } from '@/stores/userStore'
import { cn } from '@/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DateFormatter,
  getLocalTimeZone,
  parseDate,
  type DateValue,
} from '@internationalized/date'
import { CalendarIcon } from 'lucide-vue-next'
import TaskModal from '@/components/tasks/TaskModal.vue'
import TaskDeleteModal from '@/components/tasks/TaskDeleteModal.vue'

const route = useRoute()
const boardId = computed(() => Number(route.params.id))
const boardStore = useBoardStore()
const taskStore = useTaskStore()
const userStore = useUserStore()
const isUserLoading = ref(false)

onMounted(async () => {
  if (!userStore.userLoaded) {
    isUserLoading.value = true
    await userStore.fetchCurrentUser()
    isUserLoading.value = false
  }
})

const boardName = computed(() => {
  return userStore.boards.find(b => b.id === boardId.value)?.name || 'Без названия'
})

const columns = computed(() => taskStore.columns)

// Модальный режим
const showTaskModal = ref(false)
const editTask = ref<BoardTask | null>(null)
const selectedColumnId = ref<number | null>(null)
const modalTitle = ref('')
const modalDescription = ref('')
const modalStatus = ref<'NEW' | 'IN_PROGRESS' | 'DONE'>('NEW')
const modalPriority = ref<'LOW' | 'MEDIUM' | 'HIGH'>('LOW')
const modalTag = ref<TagValue>(tagValues[0])
const modalDeadline = ref<DateValue | undefined>(undefined)
const df = new DateFormatter('ru-RU', { dateStyle: 'long' })

// Deletion modal state and handlers
const showDeleteModal = ref(false)
const selectedDeleteTask = ref<BoardTask | null>(null)

// Открыть форму создания
function openNewTaskForm(columnId: number) {
  editTask.value = null
  selectedColumnId.value = columnId
  modalTitle.value = ''
  modalDescription.value = ''
  modalTag.value = tagValues[0]
  modalStatus.value = columnId === 1 ? 'NEW' : columnId === 2 ? 'IN_PROGRESS' : 'DONE'
  modalPriority.value = 'LOW'
  modalDeadline.value = undefined
  showTaskModal.value = true
}

// Drag&Drop: обработка смены статуса задачи
async function onTaskUpdate(payload: BoardTask | { id: number, status: 'NEW' | 'IN_PROGRESS' | 'DONE' }) {
  // Если это просто BoardTask, открыть редактор
  if ('name' in payload) {
    openEditTaskForm(payload as BoardTask)
    return
  }
  // Если это drop: {id, status}
  await taskStore.updateTask(payload.id, { status: payload.status })
  // fetchTasks убран для избежания гонки с WebSocket
}

// Открыть форму редактирования
function openEditTaskForm(task: BoardTask) {
  editTask.value = task
  selectedColumnId.value = null
  modalTitle.value = task.name
  modalDescription.value = task.description ?? ''
  modalStatus.value = task.status
  modalPriority.value = task.priority as any
  modalTag.value = task.tag.value
  modalDeadline.value = task.deadline ? parseDate(task.deadline.slice(0, 10)) : undefined
  showTaskModal.value = true
}

function closeTaskModal() {
  showTaskModal.value = false
}

async function submitTaskModal() {
  if (!modalTitle.value) return
  const deadline = modalDeadline.value ? modalDeadline.value.toString() + 'T00:00:00' : undefined
  if (editTask.value) {
    await taskStore.updateTask(editTask.value.id, {
      name: modalTitle.value,
      description: modalDescription.value,
      status: modalStatus.value,
      priority: modalPriority.value,
      tag: modalTag.value,
      deadline,
    })
  } else {
    await taskStore.createTask(boardId.value, {
      name: modalTitle.value,
      description: modalDescription.value,
      status: modalStatus.value,
      priority: modalPriority.value,
      tag: modalTag.value,
      deadline,
    })
  }
  showTaskModal.value = false
  await taskStore.fetchTasks(boardId.value)
}

// удаление задачи
function openDeleteModal(task: BoardTask) {
  selectedDeleteTask.value = task
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selectedDeleteTask.value = null
}

async function onDeleted() {
  await taskStore.fetchTasks(boardId.value)
  closeDeleteModal()
}

// Handle TaskModal updated event
async function onModalUpdated() {
  closeTaskModal()
  await taskStore.fetchTasks(boardId.value)
}

// assign specified user and refresh tasks
async function assignToUser(task: BoardTask, user: User) {
  await taskStore.assignUser(task.id, user.id)
  await taskStore.fetchTasks(boardId.value)
}

// Load boards and tasks, and subscribe via WebSocket when boardId changes
async function loadData(id: number) {
  // очистить предыдущие задачи сразу при смене доски
  taskStore.columns = []
  // загрузить доски
  await boardStore.fetchBoards()
  // загрузить текущего пользователя и список участников доски
  await userStore.fetchCurrentUser()
  await userStore.fetchUsersFromBoard(id)
  // обновить задачи по доске
  taskStore.disconnect()
  await taskStore.fetchTasks(id)
  taskStore.connect(id)
  // открыть модальное окно редактирования при переходе из Мои задачи
  if (route.query.editTaskId) {
    const editId = Number(route.query.editTaskId)
    const allTasks = taskStore.columns.flatMap(col => col.tasks)
    const taskToEdit = allTasks.find(t => t.id === editId)
    if (taskToEdit) openEditTaskForm(taskToEdit)
  }
}
onMounted(() => loadData(boardId.value))
watch(boardId, (newId, oldId) => {
  if (newId !== oldId) loadData(newId)
})
onBeforeUnmount(() => taskStore.disconnect())

</script>

<style scoped>
</style>
