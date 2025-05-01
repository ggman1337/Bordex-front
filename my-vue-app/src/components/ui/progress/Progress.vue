<script setup lang="ts">
import { cn } from '@/lib/utils'
import {
  ProgressIndicator,
  ProgressRoot,
  type ProgressRootProps,
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = withDefaults(
  defineProps<ProgressRootProps & { class?: HTMLAttributes['class'] }>(),
  {
    modelValue: 0,
  },
)

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

// Цвет прогресс-бара в зависимости от процента
const progressColor = computed(() => {
  const value = props.modelValue ?? 0
  if (value < 33) return '#ff4141' // красный
  if (value < 66) return '#ffe600' // жёлтый
  return '#39ff14' // неоново-зелёный
})

const progressShadow = computed(() => {
  const color = progressColor.value
  if (color === '#ff4141') return '0 0 8px 2px #ff4141, 0 0 20px 4px #ff414180'
  if (color === '#ffe600') return '0 0 8px 2px #ffe600, 0 0 20px 4px #ffe60080'
  return '0 0 8px 2px #39ff14, 0 0 20px 4px #39ff1450'
})
</script>

<template>
  <ProgressRoot
    data-slot="progress"
    v-bind="delegatedProps"
    :class="
      cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        props.class,
      )
    "
  >
    <ProgressIndicator
      data-slot="progress-indicator"
      class="h-full w-full flex-1 transition-all"
      :style="`background: ${progressColor}; box-shadow: ${progressShadow}; transform: translateX(-${100 - (props.modelValue ?? 0)}%); border-radius: 999px;`"
    />
  </ProgressRoot>
</template>
