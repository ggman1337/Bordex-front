<template>
  <label class="switch">
    <input
      type="checkbox"
      :checked="checked"
      @change="onChange"
    />
    <span class="slider"></span>
  </label>
</template>

<script setup lang="ts">
const { checked } = defineProps<{ checked: boolean }>()
const emit = defineEmits<{
  (e: 'update:checked', value: boolean): void
}>()

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:checked', target.checked)
}
</script>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.2s;
  border-radius: 20px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #4caf50;
}
input:checked + .slider:before {
  transform: translateX(20px);
}
</style>
