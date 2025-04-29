import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn', () => {
  it('объединяет строки с пробелом', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('игнорирует falsy значения', () => {
    expect(cn('a', false, undefined, '', null, 'b')).toBe('a b')
  })

  it('возвращает пустую строку, если ничего не передано', () => {
    expect(cn()).toBe('')
  })
})
