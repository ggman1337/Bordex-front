import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskList from '../TaskList.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

describe('TaskList.vue', () => {
  it('монтируется без ошибок', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const routes = [
      { path: '/boards/:id', component: { template: '<div />' } }
    ]
    const router = createRouter({
      history: createWebHistory(),
      routes
    })
    router.push('/boards/1')
    await router.isReady()
    const wrapper = mount(TaskList, {
      global: { plugins: [pinia, router] },
      props: {
        tasks: [
          {
            id: 1,
            boardId: 1,
            name: 'Test Task',
            description: 'Описание задачи',
            status: 'TODO',
            priority: 'HIGH',
            tag: { label: 'Bug', value: 'BUGS', color: 'red' },
            value: 'BUGS',
            label: 'Bug',
            color: 'red',
            assignees: [],
            deadline: null
          }
        ]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
