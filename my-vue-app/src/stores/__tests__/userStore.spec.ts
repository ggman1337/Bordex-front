/// <reference types="vitest" />
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../userStore'

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('создаётся без ошибок', () => {
    const store = useUserStore()
    expect(store).toBeTruthy()
    expect(typeof store.id).toBe('number')
    expect(Array.isArray(store.users)).toBe(true)
  })

  // Добавьте здесь тесты на методы, которые не требуют реального API
})
