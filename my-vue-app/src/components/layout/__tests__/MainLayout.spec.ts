import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MainLayout from '../MainLayout.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

describe('MainLayout.vue', () => {
  it('монтируется без ошибок', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const routes = [
      { path: '/boards', component: { template: '<div />' } },
      { path: '/boards/:id', component: { template: '<div />' } },
      { path: '/tasks', component: { template: '<div />' } },
      { path: '/settings', component: { template: '<div />' } }
    ]
    const router = createRouter({
      history: createWebHistory(),
      routes
    })
    router.push('/boards')
    await router.isReady()
    const wrapper = mount(MainLayout, {
      global: { plugins: [pinia, router] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
