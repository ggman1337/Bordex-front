import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationBell from '../NotificationBell.vue'
import { createPinia, setActivePinia } from 'pinia'

describe('NotificationBell.vue', () => {
  it('монтируется без ошибок', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(NotificationBell, {
      global: { plugins: [pinia] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
