/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Topbar from '../Topbar.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

describe('Topbar.vue', () => {
  it('монтируется без ошибок', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const routes = [
      { path: '/boards', component: { template: '<div />' } }
    ]
    const router = createRouter({
      history: createWebHistory(),
      routes
    })
    router.push('/boards')
    await router.isReady()
    const wrapper = mount(Topbar, {
      global: { plugins: [pinia, router] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
