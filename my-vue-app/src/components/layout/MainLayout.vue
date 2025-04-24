<template>
  <div class="main-layout">
    <Sidebar />
    <div class="content-area">
      <Topbar />
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'
</script>

<style scoped>
.main-layout { display: flex; height: 100vh; }
.content-area { flex: 1; display: flex; flex-direction: column; }
</style>
