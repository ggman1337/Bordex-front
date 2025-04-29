import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyBoardsPage from '../MyBoardsPage.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

describe('MyBoardsPage.vue', () => {
  it('монтируется без ошибок', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const routes = [
      { path: '/boards', component: MyBoardsPage }
    ]
    const router = createRouter({
      history: createWebHistory(),
      routes
    })
    router.push('/boards')
    await router.isReady()
    const wrapper = mount(MyBoardsPage, {
      global: { plugins: [pinia, router] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
