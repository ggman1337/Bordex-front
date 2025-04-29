import { describe, it, expect } from 'vitest'
import { capitalize } from '../capitalize'

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })
  it('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })
})
