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

const boardStore = useBoardStore()

onMounted(() => {
  boardStore.fetchBoards()
})

const boards = computed(() => boardStore.allBoards)
</script>

<style scoped>
</style>
