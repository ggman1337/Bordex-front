/// <reference types="vitest" />

import { setActivePinia, createPinia } from 'pinia'
import { useBoardStore } from '../boardStore'

describe('boardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('создаётся без ошибок', () => {
    const store = useBoardStore()
    expect(store).toBeTruthy()
    expect(Array.isArray(store.boards)).toBe(true)
  })

  it('устанавливает текущую доску', () => {
    const store = useBoardStore()
    store.setCurrentBoard(42)
    expect(store.currentBoardId).toBe(42)
  })

  // Добавьте здесь тесты на методы, которые не требуют реального API
})
