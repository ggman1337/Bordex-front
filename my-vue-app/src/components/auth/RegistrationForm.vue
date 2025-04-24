<template>
  <form @submit.prevent="onSubmit">
    <!-- тут будут поля для регистрации -->
    <button type="submit">Зарегистрироваться</button>
  </form>
</template>

<script setup>
const onSubmit = () => {
  // тут мы будем обрабатывать регистрацию
};
</script>

<style scoped>
</style>
