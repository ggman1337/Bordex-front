<template>
  <teleport to="body">
    <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <Card class="w-96 dark:bg-dark-700">
        <CardHeader>
          <CardTitle class="dark:text-dark-100">Удалить задачу</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-base text-foreground">Вы уверены, что хотите удалить задачу "{{ props.task.name }}"?</p>
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
import { defineProps, defineEmits } from 'vue'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import CardAction from '@/components/ui/card/CardAction.vue'
import { useTaskStore } from '@/stores/taskStore'
import type { Task as BoardTask } from '@/components/boards/types.ts'

const props = defineProps<{ task: BoardTask }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deleted'): void
}>()

const taskStore = useTaskStore()

function closeModal() {
  emit('close')
}

async function submitModal() {
  await taskStore.deleteTask(props.task.boardId, props.task.id)
  emit('deleted')
  emit('close')
}
</script>

<style scoped>
</style>
