import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SidebarItem from '../SidebarItem.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

describe('SidebarItem.vue', () => {
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
    const wrapper = mount(SidebarItem, {
      global: { plugins: [pinia, router] },
      props: {
        icon: 'home',
        label: 'Доски',
        to: '/boards',
        active: true
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
