<template>
  <div class="sidebar-item" @click="$emit('click')">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({ label: String, active: Boolean })
defineEmits(['click'])
</script>

<style scoped>
</style>