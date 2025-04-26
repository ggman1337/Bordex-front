<script setup lang="ts">
import {SidebarProvider} from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import Topbar from "@/components/layout/Topbar.vue";
</script>

<template>
  <SidebarProvider>
      <AppSidebar />
      <div class="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main class="flex-1 overflow-hidden bg-gray-100 p-6">
          <slot />
        </main>
      </div>
  </SidebarProvider>
</template>

<style scoped>
main {
  min-height: 100vh;
  background: #f4f7fa;
  /* Hide scrollbar */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
}
main::-webkit-scrollbar {
  display: none;           /* Chrome, Safari, Opera */
}
</style>