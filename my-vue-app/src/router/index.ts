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

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
