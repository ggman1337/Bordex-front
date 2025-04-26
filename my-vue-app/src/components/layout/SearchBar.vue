<template>
  <div class="search-bar flex items-center">
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="#707070" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 19L14.65 14.65" stroke="#707070" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <input type="text" placeholder="Поиск..." class="text-muted-foreground focus:outline-none ml-2 flex-1" />
  </div>
</template>

<script setup>
</script>

<style scoped>
.search-bar { padding: 10px; background: #f4f7fa; margin-left: 14px; width: 100%; }
.search-bar:focus { outline: none; }
</style>
