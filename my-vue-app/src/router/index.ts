import type {RouteRecordRaw} from 'vue-router';
import {createRouter, createWebHistory} from 'vue-router';
import MyBoardsPage from '@/views/MyBoardsPage.vue';
import MyTasksPage from '@/views/MyTasksPage.vue';
import BoardPage from '@/views/BoardPage.vue';
import BoardSettingsPage from '@/views/BoardSettingsPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import RegisterPage from '@/views/RegisterPage.vue';
import SettingsPage from '@/views/SettingsPage.vue';

const routes: Array<RouteRecordRaw> = [
    {path: '/', name: 'Home', component: MyBoardsPage},
    {path: '/boards', name: 'Boards', component: MyBoardsPage},
    {path: '/boards/:id', name: 'Board', component: BoardPage},
    {path: '/boards/:id/settings', name: 'BoardSettings', component: BoardSettingsPage},
    {path: '/tasks', name: 'Tasks', component: MyTasksPage},
    {path: '/login', name: 'Login', component: LoginPage},
    {path: '/register', name: 'Register', component: RegisterPage},
    {path: '/settings', name: 'Settings', component: SettingsPage},
];

import { useUserStore } from '@/stores/userStore'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(_to, _from, _savedPosition) {
        return false
    }
});

router.afterEach(() => {
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 0)
})

// Глобальный guard для авторизации
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  if (!userStore.userLoaded) {
    await userStore.fetchCurrentUser();
  }
  const publicPages = ['Login', 'Register'];
  const isPublic = publicPages.includes(to.name as string);
  const safePages = ['Login', 'Register', 'Settings'];
  const isSafe = safePages.includes(to.name as string);
  if (userStore.id === 0 && !isSafe) {
    if (from.name !== 'Register') {
      return next({ name: 'Register' });
    } else {
      return next();
    }
  }
  if (!isPublic && userStore.id && userStore.id !== 0) {
    await userStore.fetchAllUserBoardRoles();
  }
  // Проверяем доступ к настройкам доски (только MANAGER)
  if (to.name === 'BoardSettings') {
    const boardId = Number(to.params.id);
    if (!userStore.userBoardRoles[boardId]) {
      await userStore.fetchUserBoardRoles(boardId);
    }
    if (!userStore.hasBoardRole(boardId, 'MANAGER')) {
      alert('Недостаточно прав для доступа к настройкам доски');
      return next({ name: 'Boards' });
    }
  }
  next();
});

export default router;
