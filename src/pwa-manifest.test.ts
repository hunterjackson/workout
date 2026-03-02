import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

describe('PWA manifest configuration', () => {
  const configSource = readFileSync(
    resolve(__dirname, '../vite.config.ts'),
    'utf-8'
  )

  it('should include screenshots for Android install prompt', () => {
    expect(configSource).toContain('screenshots')
  })

  it('should include an id field in manifest', () => {
    expect(configSource).toMatch(/\bid\s*:/)
  })

  it('should include narrow screenshot for Firefox Android', () => {
    expect(configSource).toContain('form_factor')
    expect(configSource).toContain('narrow')
  })

  it('should have screenshot image files in public/', () => {
    const publicDir = resolve(__dirname, '../public')
    const files = readdirSync(publicDir)
    expect(
      files.some((f) => f.startsWith('screenshot') && f.endsWith('.png'))
    ).toBe(true)
  })
})
