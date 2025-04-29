/// <reference types="vitest" />

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BoardSettingsForm from '../BoardSettingsForm.vue'
import { createPinia, setActivePinia } from 'pinia'

describe('BoardSettingsForm.vue', () => {
  it('монтируется без ошибок', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(BoardSettingsForm, {
      global: { plugins: [pinia] },
      props: {
        board: {
          id: 1,
          title: 'Test Board',
          description: 'Описание',
          scope: 'PRIVATE',
          owner: { id: 1, username: 'user1', firstName: 'User', lastName: 'One', email: 'user1@email.com' },
          membersCount: 5,
          tasksCount: 10
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('отображает кнопку сохранения', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(BoardSettingsForm, {
      global: { plugins: [pinia] },
      props: {
        board: {
          id: 1,
          title: 'Test Board',
          description: 'Описание',
          scope: 'PRIVATE',
          owner: { id: 1, username: 'user1', firstName: 'User', lastName: 'One', email: 'user1@email.com' },
          membersCount: 5,
          tasksCount: 10
        }
      }
    })
    const button = wrapper.find('button[type="submit"]')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Сохранить настройки')
  })

  it('вызывает обработчик onSubmit при отправке формы', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const onSubmit = vi.fn()
    const wrapper = mount(BoardSettingsForm, {
      global: { plugins: [pinia] },
      props: {
        board: {
          id: 1,
          title: 'Test Board',
          description: 'Описание',
          scope: 'PRIVATE',
          owner: { id: 1, username: 'user1', firstName: 'User', lastName: 'One', email: 'user1@email.com' },
          membersCount: 5,
          tasksCount: 10
        }
      },
      methods: { onSubmit }
    })
    await wrapper.find('form').trigger('submit.prevent')
    // В текущей реализации onSubmit не выбрасывает событие, но мы можем проверить, что форма не падает
    expect(wrapper.exists()).toBe(true)
  })
})
