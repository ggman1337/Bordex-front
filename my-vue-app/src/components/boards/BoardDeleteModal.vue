<template>
  <teleport to="body">
    <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <Card class="w-96 dark:bg-dark-700">
        <CardHeader>
          <CardTitle class="dark:text-dark-100">Удалить доску</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-base text-foreground">Вы уверены, что хотите удалить доску "{{ board.title }}"?</p>
        </CardContent>
        <CardFooter class="flex justify-end gap-2">
          <CardAction>
            <button @click="closeModal" class="px-4 py-2 dark:text-dark-200">Отмена</button>
          </CardAction>
          <CardAction>
            <button @click="submitModal" class="px-4 py-2 bg-red-600 text-white rounded dark:bg-red-500 dark:hover:bg-red-600">Удалить</button>
          </CardAction>
        </CardFooter>
      </Card>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import CardAction from '@/components/ui/card/CardAction.vue'
import { useBoardStore } from '@/stores/boardStore'
import type { Board } from '@/components/boards/types'

const props = defineProps<{ board: Board }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'deleted'): void }>()
const boardStore = useBoardStore()

function closeModal() {
  emit('close')
}

async function submitModal() {
  await boardStore.deleteBoard(props.board.id)
  emit('deleted')
  emit('close')
}
</script>

<style scoped>
</style>
