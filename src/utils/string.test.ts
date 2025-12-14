import { describe, it, expect } from 'vitest'

// Test common string utilities
describe('string utilities', () => {
  it('should capitalize string', () => {
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('HELLO')).toBe('HELLO')
  })

  it('should truncate string', () => {
    const truncate = (str: string, length: number) =>
      str.length > length ? str.substring(0, length) + '...' : str
    expect(truncate('hello world', 5)).toBe('hello...')
    expect(truncate('hi', 10)).toBe('hi')
  })

  it('should slugify string', () => {
    const slugify = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
    expect(slugify('Hello World!')).toBe('hello-world')
    expect(slugify('Test String')).toBe('test-string')
  })

  it('should camelCase string', () => {
    const camelCase = (str: string) =>
      str.replace(/[-_\s](.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toLowerCase())
    expect(camelCase('hello-world')).toBe('helloWorld')
    expect(camelCase('hello_world')).toBe('helloWorld')
  })
})
