<template>
  <MainLayout>
    <div class="px-6 py-2 dark:bg-dark-800 text-foreground">
      <div class="flex items-center justify-between mb-4">
        <h1 v-if="!isUserLoading" class="text-3xl font-semibold dark:text-dark-100">
          {{ boardName }} <span :class="['ml-2 px-2 py-1 text-sm font-normal border rounded', scopeClasses]">{{ scopeLabel }}</span>
          <span v-if="isManager" class="text-base font-normal text-muted-foreground ml-2">Прогресс: {{ boardProgress }}%</span>
        </h1>
        <button v-if="isManager"
            class="flex items-center gap-2 bg-card text-card-foreground border border-border rounded px-3 py-1 shadow hover:bg-muted dark:bg-dark-700 dark:text-dark-100 dark:border-dark-300"
            @click="showSettingsModal = true"
        >
          <Settings class="w-5 h-5"/>
          Настройки
        </button>
      </div>

      <div class="flex flex-nowrap gap-6 overflow-x-auto board-columns-wrapper">
        <BoardColumn
            v-for="col in columns"
            :key="col.id"
            :column="col"
            :board-id="boardId"
            @createTask="openNewTaskForm"
            @deleteTask="openDeleteModal"
            @assignToUser="assignToUser"
            @updateTask="onUpdateTask"
        />
      </div>

      <teleport to="body" v-if="isManager && showSettingsModal">
        <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div class="modal-settings-container bg-white p-6 rounded-xl shadow-xl w-full max-w-4xl relative dark:bg-[#23272f]">
            <button class="absolute top-2 right-2 text-2xl text-muted-foreground hover:text-foreground"
                    @click="showSettingsModal = false">×
            </button>
            <BoardSettingsForm :board-id="boardId"/>
          </div>
        </div>
      </teleport>
      <teleport to="body" v-if="showTaskModal && !editTask">
        <!-- Модальное окно задачи -->
        <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <Card class="w-96 dark:bg-dark-700">
            <CardHeader>
              <CardTitle class="dark:text-dark-100">{{
                  editTask ? 'Редактировать задачу' : 'Создать задачу'
                }}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex flex-col gap-4">
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Название</span>
                  <input v-model="modalTitle" placeholder=" "
                         class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100"/>
                </label>
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Описание</span>
                  <textarea v-model="modalDescription" placeholder="Описание"
                            class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100"></textarea>
                </label>
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Тег</span>
                  <select v-model="modalTag"
                          class="bg-card text-card-foreground w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100">
                    <option v-for="t in tagValues" :key="t" :value="t">{{ t }}</option>
                  </select>
                </label>
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Статус</span>
                  <select v-model="modalStatus"
                          class="bg-card text-card-foreground w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100">
                    <option value="NEW">Нужно сделать</option>
                    <option value="IN_PROGRESS">В процессе</option>
                    <option value="REVIEW">На рассмотрении</option>
                    <option value="DONE">Готово</option>
                  </select>
                </label>
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Приоритет</span>
                  <select v-model="modalPriority"
                          class="bg-card text-card-foreground w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100">
                    <option value="LOW">Не важно</option>
                    <option value="MEDIUM">Нормально</option>
                    <option value="HIGH">Важно</option>
                  </select>
                </label>
                <label>
                  <span class="text-sm font-semibold dark:text-dark-200">Прогресс</span>
                  <input v-model="modalProgress" type="number" min="0" max="100"
                         class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100"/>
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
                        <CalendarIcon class="mr-2 h-4 w-4"/>
                        {{ modalDeadline ? df.format(modalDeadline.toDate(getLocalTimeZone())) : "Выберите дату" }}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0">
                      <Calendar v-model="modalDeadline" initial-focus/>
                    </PopoverContent>
                  </Popover>
                </label>
              </div>
            </CardContent>
            <CardFooter class="flex justify-end gap-2">
              <CardAction>
                <button @click="closeTaskModal" class="px-4 py-2 dark:text-dark-200">Отмена</button>
              </CardAction>
              <CardAction>
                <button @click="submitTaskModal"
                        class="px-4 py-2 bg-blue-600 text-white rounded dark:bg-blue-500 dark:hover:bg-blue-600">
                  {{ editTask ? 'Сохранить' : 'Создать' }}
                </button>
              </CardAction>
            </CardFooter>
          </Card>
        </div>
      </teleport>
      <teleport to="body" v-if="showTaskModal && editTask">
        <TaskModal
            :task="editTask!"
            @close="closeTaskModal"
            @updated="onModalUpdated"
        />
      </teleport>
      <TaskDeleteModal v-if="showDeleteModal" :task="selectedDeleteTask!" @close="closeDeleteModal"
                       @deleted="onDeleted"/>
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
import type {TagValue, Task as BoardTask} from '@/components/boards/types.ts'
import {tagValues} from '@/components/boards/types.ts'
import {useRoute} from 'vue-router'
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useBoardStore} from '@/stores/boardStore'
import {useTaskStore} from '@/stores/taskStore'
import {type User, useUserStore} from '@/stores/userStore'
import {cn} from '@/utils'
import {Button} from '@/components/ui/button'
import {Calendar} from '@/components/ui/calendar'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {DateFormatter, type DateValue, getLocalTimeZone, parseDate,} from '@internationalized/date'
import {CalendarIcon, Settings} from 'lucide-vue-next'
import TaskModal from '@/components/tasks/TaskModal.vue'
import TaskDeleteModal from '@/components/tasks/TaskDeleteModal.vue'
import BoardSettingsForm from '@/components/settings/BoardSettingsForm.vue'
import {Status} from '@/components/boards/types'
import {useBoardRoles} from "@/composables/useBoardRoles.ts";


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
  if (userStore.id && userStore.id !== 0) {
    userStore.subscribeBoardRolesRealtime(boardId.value)
    loadData(boardId.value)
    boardStore.connectUserBoardRealtime(userStore.id)
  } else {
    return
  }
})

const boardName = computed(() => boardStore.boards.find(b => b.id === boardId.value)?.title || 'Без названия')
const boardProgress = computed(() => boardStore.boards.find(b => b.id === boardId.value)?.progress ?? 0)

const columns = computed(() => taskStore.columns)

// Модальный режим
const showTaskModal = ref(false)
const editTask = ref<BoardTask | null>(null)
const selectedColumnId = ref<number | null>(null)
const modalTitle = ref('')
const modalDescription = ref('')
const modalStatus = ref<Status>(Status.NEW)
const modalPriority = ref<'LOW' | 'MEDIUM' | 'HIGH'>('LOW')
const modalTag = ref<TagValue>(tagValues[0])
const modalDeadline = ref<DateValue | undefined>(undefined)
const modalProgress = ref<number>(0)
const df = new DateFormatter('ru-RU', {dateStyle: 'long'})

// Состояние модального окна удаления и обработчики
const showDeleteModal = ref(false)
const selectedDeleteTask = ref<BoardTask | null>(null)

// Состояние модального окна настроек и обработчики
const showSettingsModal = ref(false)

// Открыть форму создания
function openNewTaskForm({columnId, status}: { columnId: number, status: Status }) {
  editTask.value = null
  selectedColumnId.value = columnId
  modalTitle.value = ''
  modalDescription.value = ''
  modalTag.value = tagValues[0]
  modalStatus.value = status
  modalPriority.value = 'LOW'
  modalDeadline.value = undefined
  modalProgress.value = 0
  showTaskModal.value = true
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
  modalProgress.value = task.progress ?? 0
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
      progress: modalProgress.value,
    })
  } else {
    await taskStore.createTask(boardId.value, {
      name: modalTitle.value,
      description: modalDescription.value,
      status: modalStatus.value,
      priority: modalPriority.value,
      tag: modalTag.value,
      deadline,
      progress: modalProgress.value,
    })
  }
  showTaskModal.value = false
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
  closeDeleteModal()
}

// Обработчик события обновления TaskModal
async function onModalUpdated() {
  closeTaskModal()
}

// Присвоить задачу пользователю и обновить задачи
async function assignToUser(task: BoardTask, user: User) {
  await taskStore.assignUser(task.id, user.id)
}

const { hasRole } = useBoardRoles(boardId)
// Доступ и видимость доски
const isManager = computed(() => {
  const b = boardStore.boardById(boardId.value)
  return hasRole('MANAGER') || (b?.owner.id === userStore.id)
})
const scopeLabel = computed(() => {
  const s = boardStore.boardById(boardId.value)?.scope ?? 'PRIVATE'
  return s === 'PUBLIC' ? 'Публичная' : 'Приватная'
})
const scopeClasses = computed(() => {
  const s = boardStore.boardById(boardId.value)?.scope ?? 'PRIVATE'
  return s === 'PUBLIC'
    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-800 dark:text-green-100 dark:border-green-700'
    : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-800 dark:text-red-100 dark:border-red-700'
})

// Загрузка досок и задач, и подписка на WebSocket при изменении boardId
async function loadData(id: number) {
  console.log("4")
  // очистить предыдущие задачи сразу при смене доски
  taskStore.columns = []
  // загрузить доски
  await boardStore.fetchBoards(userStore.id)
  // загрузить текущего пользователя и список участников доски
  await userStore.fetchCurrentUser()
  await userStore.fetchUsersFromBoard(id)
  // обновить задачи по доске
  taskStore.connect(id)
  // открыть модальное окно редактирования при переходе из Мои задачи
  if (route.query.editTaskId) {
    const editId = Number(route.query.editTaskId)
    const allTasks = taskStore.columns.flatMap(col => col.tasks)
    const taskToEdit = allTasks.find(t => t.id === editId)
    if (taskToEdit) openEditTaskForm(taskToEdit)
  }
}

// Обновление статуса задачи
async function onUpdateTask({id, status}: { id: number; status: Status }) {
  // Сохраняем новый статус на сервере
  await taskStore.updateTask(id, {status})
  // Оптимистично обновляем локальные колонки
  taskStore.optimisticUpdateTaskStatus(id, status)
  // Перезагружаем задачи для текущего пользователя, чтобы синхронизироваться с сервером
}

// Перезагрузка при смене доски
watch(boardId, (newId, oldId) => {
  if (newId !== oldId) {
    userStore._rolesUnsubscribers[oldId]?.()
    userStore.fetchUserBoardRoles(newId)
    userStore.subscribeBoardRolesRealtime(newId)
    loadData(newId)
  }
})

onBeforeUnmount(() => {
  if (userStore._rolesUnsubscribers[boardId.value]) userStore._rolesUnsubscribers[boardId.value]()
  taskStore.disconnect()
})

</script>

<style scoped>
.dark .modal-settings-container {
  background: #23272f !important;
}
.board-columns-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #888 transparent;
}
.board-columns-wrapper::-webkit-scrollbar {
  height: 6px;
}
.board-columns-wrapper::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 3px;
}
.board-columns-wrapper::-webkit-scrollbar-track {
  background: transparent;
}
</style>
