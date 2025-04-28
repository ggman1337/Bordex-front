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
          @updateTask="onTaskUpdate"
          @deleteTask="deleteTask"
          @assignTask="assignCurrentUser"
          @assignToUser="assignToUser"
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
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

const route = useRoute()
const boardId = Number(route.params.id)
const boardStore = useBoardStore()
const taskStore = useTaskStore()
const userStore = useUserStore()
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
const modalTag = ref<TagValue>(tagValues[0])
const modalDeadline = ref<DateValue | undefined>(undefined)
const df = new DateFormatter('ru-RU', { dateStyle: 'long' })

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
  await taskStore.fetchTasks(boardId)
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
    await taskStore.createTask(boardId, {
      name: modalTitle.value,
      description: modalDescription.value,
      status: modalStatus.value,
      priority: modalPriority.value,
      tag: modalTag.value,
      deadline,
    })
  }
  showTaskModal.value = false
  await taskStore.fetchTasks(boardId)
}

// удаление задачи
async function deleteTask(task: BoardTask) {
  await taskStore.deleteTask(boardId, task.id)
}

// assign current user to task and refresh task list
async function assignCurrentUser(task: BoardTask) {
  await taskStore.assignUser(task.id, userStore.id)
  await taskStore.fetchTasks(boardId)
}

// assign specified user and refresh tasks
async function assignToUser(task: BoardTask, user: User) {
  await taskStore.assignUser(task.id, user.id)
  await taskStore.fetchTasks(boardId)
}

onMounted(() => {
  // load current user for assignment highlighting
  userStore.fetchCurrentUser()
  // load all users for assignment from board
  userStore.fetchUsersFromBoard(boardId)
  // load tasks
  taskStore.fetchTasks(boardId)
  taskStore.connect(boardId)
})
onBeforeUnmount(() => taskStore.disconnect())

</script>

<style scoped>
</style>
