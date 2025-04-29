import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RegistrationForm from '../RegistrationForm.vue'
import { createPinia, setActivePinia } from 'pinia'

describe('RegistrationForm.vue', () => {
  it('монтируется без ошибок', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(RegistrationForm, {
      global: { plugins: [pinia] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
