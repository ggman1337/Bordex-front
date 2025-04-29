/// <reference types="vitest" />

import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '../taskStore'

describe('taskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('создаётся без ошибок', () => {
    const store = useTaskStore()
    expect(store).toBeTruthy()
    expect(Array.isArray(store.columns)).toBe(true)
    expect(Array.isArray(store.userTasks)).toBe(true)
  })

  // Добавьте здесь тесты на методы, которые не требуют реального API
})
