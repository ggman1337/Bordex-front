import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskDeleteModal from '../TaskDeleteModal.vue'
import { createPinia, setActivePinia } from 'pinia'

describe('TaskDeleteModal.vue', () => {
  it('монтируется без ошибок', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(TaskDeleteModal, {
      global: { plugins: [pinia] },
      props: {
        modelValue: true,
        task: {
          id: 1,
          boardId: 1,
          name: 'Test Task',
          description: 'Описание задачи',
          status: 'NEW',
          tag: { label: 'Bug', value: 'BUGS', color: 'red' },
          value: 'BUGS',
          label: 'Bug',
          color: 'red',
          assignees: [],
          priority: 'HIGH',
          deadline: null
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
