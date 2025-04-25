<script setup lang="ts">
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import UserAvatar from "@/components/layout/UserAvatar.vue";
</script>

<template>
  <UserAvatar />
  <SidebarProvider>
    <AppSidebar />
    <main>
      <slot />
    </main>
  </SidebarProvider>
</template>

<style scoped>
</style>