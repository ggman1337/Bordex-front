<template>
  <teleport to="body">
    <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <Card class="w-96 dark:bg-dark-700 scale-90">
        <CardHeader>
          <CardTitle class="dark:text-dark-100">{{ isEditMode ? 'Редактировать задачу' : 'Создать задачу' }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-4">
            <label v-if="isManager || !isEditMode">
              <span class="text-sm font-semibold dark:text-dark-200">Название</span>
              <input v-model="modalTitle" placeholder=" " class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100" :class="{'border-red-500': showTitleError}" :disabled="isDeveloper && !isManager && isEditMode" />
              <span v-if="showTitleError" class="text-xs text-red-500">Название задачи обязательно</span>
            </label>
            <label v-if="isManager || !isEditMode">
              <span class="text-sm font-semibold dark:text-dark-200">Описание</span>
              <textarea v-model="modalDescription" placeholder="Описание" class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100" :disabled="isDeveloper && !isManager && isEditMode"></textarea>
            </label>
            <label v-if="isManager || !isEditMode">
              <span class="text-sm font-semibold dark:text-dark-200">Тег</span>
              <select v-model="modalTag" class="bg-card text-card-foreground w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100" :disabled="isDeveloper && !isManager && isEditMode">
                <option v-for="t in tagValues" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>
            <label>
              <span class="text-sm font-semibold dark:text-dark-200">Статус</span>
              <select v-model="modalStatus" class="bg-card text-card-foreground w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100">
                <option :value="Status.NEW">Нужно сделать</option>
                <option :value="Status.IN_PROGRESS">В процессе</option>
                <option :value="Status.REVIEW">На рассмотрении</option>
                <option :value="Status.DONE">Готово</option>
              </select>
            </label>
            <label v-if="isManager || !isEditMode">
              <span class="text-sm font-semibold dark:text-dark-200">Приоритет</span>
              <select v-model="modalPriority" class="bg-card text-card-foreground w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100" :disabled="isDeveloper && !isManager && isEditMode">
                <option value="LOW">Не важно</option>
                <option value="MEDIUM">Нормально</option>
                <option value="HIGH">Важно</option>
              </select>
            </label>
            <label>
              <span class="text-sm font-semibold dark:text-dark-200">Прогресс (%)</span>
              <input
                type="number"
                v-model.number="modalProgress"
                min="0" max="100"
                class="w-full p-2 border rounded dark:bg-dark-600 dark:border-white dark:text-dark-100"
                placeholder="0-100"
              />
            </label>
            <label v-if="isManager || !isEditMode">
              <span class="text-sm font-semibold dark:text-dark-200">Дедлайн</span>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    :class="cn('w-full justify-start text-left font-normal', !modalDeadline && 'text-muted-foreground')"
                  >
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    {{ modalDeadline ? df.format(modalDeadline.toDate(getLocalTimeZone())) : 'Выберите дату' }}
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
          <CardAction><button @click="closeModal" class="px-4 py-2 text-muted-foreground hover:text-foreground">Отмена</button>
            <button @click="submitModal" :disabled="!modalTitle.trim()" :class="['px-4 py-2 rounded', !modalTitle.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90']">{{ isEditMode ? 'Сохранить' : 'Создать' }}</button></CardAction>
        </CardFooter>
      </Card>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, computed } from 'vue'
import { useBoardRoles } from '@/composables/useBoardRoles'
import { useRoute } from 'vue-router'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import CardAction from '@/components/ui/card/CardAction.vue'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import { CalendarIcon } from 'lucide-vue-next'
import { cn } from '@/utils'
import { useTaskStore } from '@/stores/taskStore'
import type { Task as BoardTask, TagValue } from '@/components/boards/types.ts'
import { tagValues } from '@/components/boards/types.ts'

// Определяем boardId для проверки ролей
const route = useRoute()
const boardId = computed(() => props.task?.boardId ?? props.boardId ?? Number(route.params.id))
const { roles } = useBoardRoles(boardId)
const isManager = computed(() => roles.value.includes('MANAGER'))
const isDeveloper = computed(() => roles.value.includes('DEVELOPER'))
const isEditMode = computed(() => !!props.task && !!props.task.id)

import { Status } from '@/components/boards/types'
const props = defineProps<{ task?: BoardTask, boardId?: number, status?: Status }>()
const emit = defineEmits(['close', 'updated'])

const taskStore = useTaskStore()
const modalTitle = ref(props.task?.name ?? '')
const modalDescription = ref(props.task?.description ?? '')
const modalStatus = ref<Status>(props.task?.status ?? props.status ?? Status.NEW)
const modalPriority = ref((props.task?.priority as any) ?? 'LOW')
const modalTag = ref<TagValue>(props.task?.tag?.value ?? tagValues[0])
const modalDeadline = ref(props.task?.deadline ? parseDate(props.task.deadline.slice(0, 10)) : undefined)
const modalProgress = ref(typeof props.task?.progress === 'number' ? props.task.progress : 0)

watch(
  () => props.task,
  (t) => {
    if (!t) return
    modalTitle.value = t.name
    modalDescription.value = t.description ?? ''
    modalStatus.value = t.status as Status
    modalPriority.value = (t.priority as any) ?? 'LOW'
    modalTag.value = t.tag.value
    modalDeadline.value = t.deadline ? parseDate(t.deadline.slice(0, 10)) : undefined
    modalProgress.value = typeof t.progress === 'number' ? t.progress : 0
  }
)

watch(
  () => props.status,
  (s) => {
    if (!isEditMode.value && s) {
      modalStatus.value = s as Status
    }
  },
  { immediate: true }
)

const df = new DateFormatter('ru-RU', { dateStyle: 'long' })

function closeModal() {
  emit('close')
}

const showTitleError = ref(false)

async function submitModal() {
  showTitleError.value = !modalTitle.value.trim()
  if (!modalTitle.value.trim()) {
    return
  }
  const deadline = modalDeadline.value ? modalDeadline.value.toString() + 'T00:00:00' : undefined
  if (isEditMode.value && props.task) {
    const payload = (isDeveloper.value && !isManager.value)
      ? { status: modalStatus.value, progress: Math.max(0, Math.min(100, modalProgress.value)) }
      : {
          name: modalTitle.value,
          description: modalDescription.value,
          status: modalStatus.value,
          priority: modalPriority.value,
          tag: modalTag.value,
          deadline,
          progress: Math.max(0, Math.min(100, modalProgress.value)),
        }
    await taskStore.updateTask(props.task.id, payload)
  } else {
    if (!props.boardId) throw new Error('boardId is required for creating a task')
    await taskStore.createTask(props.boardId, {
      name: modalTitle.value,
      description: modalDescription.value,
      status: modalStatus.value,
      priority: modalPriority.value,
      tag: modalTag.value,
      deadline,
      progress: Math.max(0, Math.min(100, modalProgress.value)),
    })
  }
  emit('updated')
  emit('close')
}
</script>

<style scoped>
</style>
