import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TaskModal from '../TaskModal.vue'
import { createPinia, setActivePinia } from 'pinia'

describe('TaskModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  const mockTask = {
    id: 1,
    name: 'Test Task',
    description: 'desc',
    status: 'NEW',
    priority: 'LOW',
    tag: {
      label: 'Test',
      value: 'test',
      color: '#000'
    }
  }

  it('renders with task name in input', async () => {
    mount(TaskModal, {
      props: { task: mockTask },
      global: { plugins: [createPinia()] },
      attachTo: document.body,
      shallow: false
    })
    await nextTick()
    const input = document.body.querySelector('input')
    expect(input).toBeTruthy()
    expect((input as HTMLInputElement).value).toBe('Test Task')
  })

  it('emits close on cancel button click', async () => {
    const wrapper = mount(TaskModal, {
      props: { task: mockTask },
      global: { plugins: [createPinia()] },
      attachTo: document.body,
      shallow: false
    })
    await nextTick()
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const closeBtn = buttons.find(btn => btn.textContent?.trim() === 'Отмена')
    expect(closeBtn).toBeTruthy()
    closeBtn && closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
