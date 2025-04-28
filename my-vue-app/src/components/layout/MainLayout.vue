<script setup lang="ts">
import {SidebarProvider} from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import Topbar from "@/components/layout/Topbar.vue";
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <div class="flex flex-col flex-1 overflow-hidden bg-background text-foreground">
      <Topbar />
      <main class="flex-1 overflow-hidden p-6">
        <slot />
      </main>
    </div>
  </SidebarProvider>
</template>

<style scoped>
main {
  min-height: 100vh;
  /* Hide scrollbar */
  -ms-overflow-style: none;
  scrollbar-width: none;
}
main::-webkit-scrollbar {
  display: none;
}
</style>