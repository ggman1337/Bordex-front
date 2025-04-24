<template>
  <form @submit.prevent="onSubmit">
    <!-- тут будут поля настроек доски -->
    <button type="submit">Сохранить настройки</button>
  </form>
</template>

<script setup>
const onSubmit = () => {
  // тут мы будем сохранять настройки доски
};
</script>

<style scoped>
</style>
