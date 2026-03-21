import { describe, it, expect } from 'vitest'

describe('smoke test', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  it('DATA_VERSION is defined', async () => {
    const { DATA_VERSION } = await import('../App')
    expect(DATA_VERSION).toBeGreaterThanOrEqual(1)
  })
})
