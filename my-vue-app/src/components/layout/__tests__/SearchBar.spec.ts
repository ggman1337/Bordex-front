/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '../SearchBar.vue'
import { createPinia, setActivePinia } from 'pinia'

describe('SearchBar.vue', () => {
  it('монтируется без ошибок', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(SearchBar, {
      global: { plugins: [pinia] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
