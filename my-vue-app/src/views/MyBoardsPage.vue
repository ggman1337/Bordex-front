<template>
  <MainLayout>
    <BoardList :boards="boards" />
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import BoardList from '@/components/boards/BoardList.vue'
import { useBoardStore } from '@/stores/boardStore'
import { useUserStore } from '@/stores/userStore'

const boardStore = useBoardStore()
const userStore = useUserStore()

onMounted(() => {
  boardStore.fetchBoards(userStore.id)
})

const boards = computed(() => boardStore.allBoards)
</script>

<style scoped>
</style>
