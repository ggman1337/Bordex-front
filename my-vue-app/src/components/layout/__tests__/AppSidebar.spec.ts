import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSidebar from '../AppSidebar.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import SidebarProvider from '@/components/ui/sidebar/SidebarProvider.vue'

describe('AppSidebar.vue', () => {
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
    const wrapper = mount(SidebarProvider, {
      global: { plugins: [pinia, router] },
      slots: {
        default: AppSidebar
      }
    })
    expect(wrapper.findComponent(AppSidebar).exists()).toBe(true)
  })
})
