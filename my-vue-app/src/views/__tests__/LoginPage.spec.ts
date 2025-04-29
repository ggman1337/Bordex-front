import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginPage from '../LoginPage.vue'

describe('LoginPage.vue', () => {
  it('монтируется без ошибок', () => {
    const wrapper = mount(LoginPage)
    expect(wrapper.exists()).toBe(true)
  })
})
