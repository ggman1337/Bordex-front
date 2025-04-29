import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BoardSettingsPage from '../BoardSettingsPage.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import BoardSettingsForm from '@/components/settings/BoardSettingsForm.vue'

describe('BoardSettingsPage.vue', () => {
  it('монтируется без ошибок', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const routes = [
      { path: '/boards/:id/settings', component: BoardSettingsPage }
    ]
    const router = createRouter({
      history: createWebHistory(),
      routes
    })
    router.push('/boards/1/settings')
    await router.isReady()
    const wrapper = mount(BoardSettingsPage, {
      global: { plugins: [pinia, router] }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('содержит BoardSettingsForm', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const routes = [
      { path: '/boards/:id/settings', component: BoardSettingsPage }
    ]
    const router = createRouter({
      history: createWebHistory(),
      routes
    })
    router.push('/boards/1/settings')
    await router.isReady()
    const wrapper = mount(BoardSettingsPage, {
      global: { plugins: [pinia, router] }
    })
    expect(wrapper.findComponent(BoardSettingsForm).exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Сохранить настройки')
  })
})
