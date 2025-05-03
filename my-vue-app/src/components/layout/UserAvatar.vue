<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Avatar class="user-avatar">
        <AvatarFallback>{{ initials }}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="profile-menu-content right-0 left-auto origin-top-right scale-90">
      <div class="flex flex-col items-center justify-center text-center w-full h-36 border-b">
        <Avatar class="user-avatar mb-2" style="width:48px;height:48px;">
          <AvatarFallback>{{ initials }}</AvatarFallback>
        </Avatar>
        <div>
          <div class="font-semibold text-lg leading-tight">{{ user?.firstName }} {{ user?.lastName }}</div>
          <div class="text-muted-foreground text-base -mt-1">{{ user?.email }}</div>
        </div>
      </div>
      <DropdownMenuItem class="profile-menu-item" @click="goToBoards">
        <span class="icon" v-html="icons.IconBoards" />
        Мои доски
      </DropdownMenuItem>
      <DropdownMenuItem class="profile-menu-item">
        <span class="icon" v-html="icons.IconSettings" />
        Настройки профиля
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="profile-menu-item" variant="destructive">
        <span class="icon" v-html="icons.IconLogout" />
        Выйти
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useUserStore } from '@/stores/userStore.ts'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import * as icons from './ProfileMenuIcons'

const router = useRouter()
const store = useUserStore()
function goToBoards() {
  router.push('/boards')
}
const user = computed(() => store.getUserById(store.id))
const initials = computed(() => {
  if (user.value) {
    const { firstName, lastName, username } = user.value
    if (firstName && lastName) return firstName[0].toUpperCase() + lastName[0].toUpperCase()
    if (firstName) return firstName[0].toUpperCase()
    if (username) return username[0].toUpperCase()
  }
  return 'U' // placeholder если пользователь не загружен
})
</script>

<style scoped>
.user-avatar { cursor: pointer; width: 32px; height: 32px; border-radius: 50%; background: #ccc; margin-right: 1rem; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem; color: #222; }
.user-avatar :deep(.avatar-fallback) { color: inherit; }
:root.dark .user-avatar, .dark .user-avatar {
  background: #444;
  color: #fff;
}
.profile-menu-content {
  min-width: 340px;
  padding: 0;
  color: #222;
}
:root.dark .profile-menu-content, .dark .profile-menu-content {
  color: #fff;
  background: #232323;
}
.profile-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.15rem;
  padding: 1rem 1.5rem;
  color: #555;
}
:root.dark .profile-menu-item, .dark .profile-menu-item {
  color: #fff;
}
.profile-menu-item .icon {
  width: 1.7em;
  height: 1.7em;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}
:root.dark .profile-menu-item .icon, .dark .profile-menu-item .icon {
  color: #bbb;
}
.profile-menu-item[variant="destructive"] {
  color: #d32f2f;
}
:root.dark .profile-menu-item[variant="destructive"], .dark .profile-menu-item[variant="destructive"] {
  color: #ff6b6b;
}
.debug-profile-menu {
  /* outline: 2px dashed #eab308; */
}
</style>
