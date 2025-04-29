import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BoardList from '../BoardList.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

describe('BoardList.vue', () => {
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
    const wrapper = mount(BoardList, {
      global: { plugins: [pinia, router] },
      props: {
        boards: [
          {
            id: 1,
            title: 'Test Board',
            description: 'Описание',
            scope: 'PRIVATE',
            owner: { id: 1, username: 'user1', firstName: 'User', lastName: 'One', email: 'user1@email.com' },
            membersCount: 5,
            tasksCount: 10
          }
        ]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
