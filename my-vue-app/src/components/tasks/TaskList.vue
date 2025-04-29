<template>
  <div class="min-h-screen w-full bg-background text-foreground flex flex-col">
    <div class="flex-1 flex flex-col justify-start">
      <div class="max-w-full w-full px-6 py-2">
        <div class="mb-4 flex items-center justify-between">
          <h1 class="text-3xl font-semibold dark:text-dark-100">Мои задачи</h1>
        </div>
        <div class="flex flex-col lg:flex-row gap-8 w-full">
          <div class="flex-1 bg-card rounded-xl shadow-md p-8 min-h-[500px] dark:bg-dark-800">
            <h2 class="font-semibold text-lg mb-4 text-muted-foreground">Текущие задачи</h2>
            <div v-if="loading" class="text-muted-foreground">Загрузка задач...</div>
            <div v-else-if="tasks.length === 0" class="text-muted-foreground">Нет задач</div>
            <div v-else class="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              <TaskCard
                v-for="task in tasks"
                :key="task.id"
                :task="task"
                @deleteTask="handleDelete"
                @updateTask="handleUpdate"
              />
            </div>
          </div>
          <div class="w-full lg:w-96 flex-shrink-0 bg-card rounded-xl shadow-md p-8 dark:bg-dark-800">
            <h2 class="font-semibold text-lg mb-4 text-muted-foreground">Другие задачи</h2>
            <div class="text-muted-foreground">Пока ничего нет</div>
          </div>
        </div>
      </div>
    </div>
    <TaskModal v-if="showModal" :task="selectedTask!" @close="closeModal" @updated="onUpdated" />
    <TaskDeleteModal
      v-if="showDeleteModal"
      :task="selectedDeleteTask!"
      @close="closeDeleteModal"
      @deleted="onDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import TaskCard from './TaskCard.vue'
import TaskModal from './TaskModal.vue'
import TaskDeleteModal from './TaskDeleteModal.vue'
import { useTaskStore } from '@/stores/taskStore'
import { useUserStore } from '@/stores/userStore'
import type { Task } from '@/components/boards/types'

const taskStore = useTaskStore()
const userStore = useUserStore()
const tasks = computed(() => taskStore.userTasks)
const loading = ref(true)
const showModal = ref(false)
const selectedTask = ref<Task | null>(null)
const showDeleteModal = ref(false)
const selectedDeleteTask = ref<Task | null>(null)

onMounted(async () => {
  await userStore.fetchCurrentUser()
  await taskStore.fetchTasksForUser(userStore.id)
  loading.value = false
})

function handleDelete(task: Task) {
  selectedDeleteTask.value = task
  showDeleteModal.value = true
}

function handleUpdate(task: Task) {
  selectedTask.value = task
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedTask.value = null
}

async function onUpdated() {
  await taskStore.fetchTasksForUser(userStore.id)
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selectedDeleteTask.value = null
}

async function onDeleted() {
  await taskStore.fetchTasksForUser(userStore.id)
}
</script>

<style scoped>
.shadow-md {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.13);
}
.dark .bg-card {
  background-color: #1a1d23;
}
.dark .shadow-md {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.45);
}
</style>
