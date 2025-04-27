<script setup lang="ts">
import { Calendar, Home, Inbox, Settings } from "lucide-vue-next"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'

// Динамические пункты меню с текущим id доски
const route = useRoute()
const boardStore = useBoardStore()
const boardId = computed(() => Number(route.params.id) || boardStore.currentBoardId)

// Показать пункт 'Текущая доска' только если есть boardId
const showCurrentBoard = computed(() => !!boardId.value)
// Составляем меню в зависимости от наличия boardId
const items = computed(() => {
  const menu = [
    { title: "Мои доски", url: "/boards", icon: Home, iconSize: 24 },
  ]
  if (showCurrentBoard.value) {
    menu.push({ title: "Текущая доска", url: `/boards/${boardId.value}`, icon: Inbox, iconSize: 24 })
  }
  menu.push(
    { title: "Мои задачи", url: "/tasks", icon: Calendar, iconSize: 24 },
    { title: "Настройки", url: "/settings", icon: Settings, iconSize: 24 }
  )
  return menu
})
</script>

<template>
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarHeader class="border-b border-gray-200">
          <div class="flex items-center px-4 py-2">
            <svg class="w-8 h-8 mr-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15.9999V7.9999C20.9996 7.64917 20.9071 7.30471 20.7315 7.00106C20.556 6.69741 20.3037 6.44526 20 6.2699L13 2.2699C12.696 2.09436 12.3511 2.00195 12 2.00195C11.6489 2.00195 11.304 2.09436 11 2.2699L4 6.2699C3.69626 6.44526 3.44398 6.69741 3.26846 7.00106C3.09294 7.30471 3.00036 7.64917 3 7.9999V15.9999C3.00036 16.3506 3.09294 16.6951 3.26846 16.9987C3.44398 17.3024 3.69626 17.5545 4 17.7299L11 21.7299C11.304 21.9054 11.6489 21.9978 12 21.9978C12.3511 21.9978 12.696 21.9054 13 21.7299L20 17.7299C20.3037 17.5545 20.556 17.3024 20.7315 16.9987C20.9071 16.6951 20.9996 16.3506 21 15.9999Z" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7.5 4.20996L12 6.80996L16.5 4.20996" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7.5 19.79V14.6L3 12" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12L16.5 14.6V19.79" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.27002 6.95996L12 12.01L20.73 6.95996" stroke="#1A87D7" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 22.08V12" stroke="#1A87D7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="text-2xl font-bold">Bordex</span>
          </div>
        </SidebarHeader> 
        <div class="h-px bg-gray-200 mb-3"></div>
        <SidebarGroupContent>
          <SidebarMenu class="pl-5 space-y-2">
              <SidebarMenuItem v-for="item in items" :key="item.title" class="text-lg hover:bg-gray-100">
                <SidebarMenuButton asChild>
                    <router-link :to="item.url">
                      <component
                        :is="item.icon"
                        :style="{ width: item.iconSize + 'px', height: item.iconSize + 'px' }"
                      />
                      <span class="ml-3 text-xl">{{item.title}}</span>
                    </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <div class="fixed bottom-5 left-5 z-50">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger><SidebarTrigger /></TooltipTrigger>
        <TooltipContent>
          <p>Ctrl + B</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>

<style scoped>
</style>