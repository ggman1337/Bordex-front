<template>
  <MainLayout>
    <TaskList />
  </MainLayout>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import TaskList from '@/components/tasks/TaskList.vue'
import { useTaskStore } from '@/stores/taskStore'
import { useUserStore } from '@/stores/userStore'

const taskStore = useTaskStore()
const userStore = useUserStore()

onMounted(() => {
  taskStore.connectUserTasks(userStore.id)
})
onBeforeUnmount(() => {
  taskStore.disconnectUserTasks()
})
</script>

<style scoped>
</style>
