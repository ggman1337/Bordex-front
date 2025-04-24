<template>
  <form @submit.prevent="onSubmit">
    <!-- тут будут поля для входа -->
    <button type="submit">Войти</button>
  </form>
</template>

<script setup>
const onSubmit = () => {
  // тут мы будем обрабатывать вход
};
</script>

<style scoped>
</style>
