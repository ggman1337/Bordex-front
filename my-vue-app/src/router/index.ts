import type {RouteRecordRaw} from 'vue-router';
import {createRouter, createWebHistory} from 'vue-router';
import MyBoardsPage from '@/views/MyBoardsPage.vue';
import MyTasksPage from '@/views/MyTasksPage.vue';
import BoardPage from '@/views/BoardPage.vue';
import BoardSettingsPage from '@/views/BoardSettingsPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import RegisterPage from '@/views/RegisterPage.vue';
import SettingsPage from '@/views/SettingsPage.vue';
import TestWebSocket from "@/testwebsocket/TestWebSocket.vue";

const routes: Array<RouteRecordRaw> = [
    {path: '/', name: 'Home', component: MyBoardsPage},
    {path: '/boards', name: 'Boards', component: MyBoardsPage},
    {path: '/boards/:id', name: 'Board', component: BoardPage},
    {path: '/boards/:id/settings', name: 'BoardSettings', component: BoardSettingsPage,},
    {path: '/tasks', name: 'Tasks', component: MyTasksPage},
    {path: '/login', name: 'Login', component: LoginPage},
    {path: '/register', name: 'Register', component: RegisterPage},
    {path: '/settings', name: 'Settings', component: SettingsPage},
    {path: '/ws', name: 'WebSocket', component: TestWebSocket},

];

import { useUserStore } from '@/stores/userStore'
import { BOARD_ROLES } from '@/constants/boardRoles'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(_to, _from, _savedPosition) {
        // fallback для мгновенного скролла (например, при навигации назад)
        return false
    }
});

// Плавная анимация при переходе на новую страницу
router.afterEach(() => {
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 0)
})

// Навигационный гвард для проверки ролей
router.beforeEach(async (to, from, next) => {
  // Проверяем доступ к настройкам доски (только MANAGER)
  if (to.name === 'BoardSettings') {
    const userStore = useUserStore()
    const boardId = Number(to.params.id)
    // Если роли не загружены — загрузить
    if (!userStore.userBoardRoles[boardId]) {
      await userStore.fetchUserBoardRoles(boardId)
    }
    if (!userStore.hasBoardRole(boardId, 'MANAGER')) {
      // Можно заменить на кастомную страницу или toast
      alert('Недостаточно прав для доступа к настройкам доски')
      return next({ name: 'Boards' })
    }
  }
  next()
})

export default router;
