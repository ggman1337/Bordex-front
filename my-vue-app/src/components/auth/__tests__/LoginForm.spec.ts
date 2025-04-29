import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '../LoginForm.vue'
import { createPinia, setActivePinia } from 'pinia'

describe('LoginForm.vue', () => {
  it('монтируется без ошибок', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(LoginForm, {
      global: { plugins: [pinia] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
