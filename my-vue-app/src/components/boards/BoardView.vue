<template>
  <div class="px-8 py-6">
    <h1 class="text-3xl font-semibold mb-8">Проект <b>“Bordex”</b></h1>
    <div class="flex gap-6 overflow-x-auto">
      <BoardColumn v-for="col in columns" :key="col.id" :column="col" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BoardColumn from './BoardColumn.vue'
import type { BoardColumn as BoardColumnType } from './types.ts'

const columns: BoardColumnType[] = [
  {
    id: 1,
    title: 'Нужно сделать',
    tasks: [
      {
        id: 1,
        title: 'Написать Wiki проекта',
        description: 'Расписать страницу Wiki нашего проекта на HITS Redmine. Указать всю необходимую преподавателю информацию.',
        tag: { label: 'АНАЛИТИКА', color: 'bg-yellow-100 text-yellow-700' },
        avatars: [ { initials: 'AA' }, { initials: 'SD' } ],
      },
      {
        id: 2,
        title: 'Устранить ошибку по БД',
        description: 'Решить проблему с базой данных для нашего проекта.',
        tag: { label: 'БАГИ', color: 'bg-blue-100 text-blue-700' },
        avatars: [ { img: 'https://randomuser.me/api/portraits/men/32.jpg' } ],
      },
    ],
  },
  {
    id: 2,
    title: 'В процессе',
    tasks: [
      {
        id: 3,
        title: 'Сделать фронтенд',
        description: 'Реализовать frontend нашего проекта на Vue.js. Включающий страницу регистрации, авторизации, создания доски и настроек.',
        tag: { label: 'РАЗРАБОТКА', color: 'bg-pink-100 text-pink-700' },
        avatars: [ { initials: 'КО' }, { img: 'https://randomuser.me/api/portraits/men/32.jpg' } ],
      },
    ],
  },
  {
    id: 3,
    title: 'Готово',
    tasks: [
      {
        id: 4,
        title: 'Реализовать БД',
        description: 'Создать базу данных на PostgreSQL для проекта копии Trello/Jira.',
        tag: { label: 'РАЗРАБОТКА', color: 'bg-pink-100 text-pink-700' },
        avatars: [ { initials: 'КО' }, { img: 'https://randomuser.me/api/portraits/men/32.jpg' } ],
      },
      {
        id: 5,
        title: 'Перераспределить задачи',
        description: 'Перераспределить задачи и трудозатраты команды на HITS Redmine.',
        tag: { label: 'БАГИ', color: 'bg-blue-100 text-blue-700' },
        avatars: [ { initials: 'SD' } ],
      },
      {
        id: 6,
        title: 'Мобильная адаптация',
        description: 'Реализовать мобильную адаптацию нашего проекта, с использованием TailwindCSS.',
        tag: { label: 'ДИЗАЙН', color: 'bg-green-100 text-green-700' },
        avatars: [ { initials: 'AA' }, { initials: 'SD' } ],
      },
    ],
  },
]
</script>

<style scoped>
</style>
