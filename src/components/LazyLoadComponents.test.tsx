import { describe, it, expect } from 'vitest'
import { lazyWithSuspense, LoadingFallback } from './LazyLoadComponents'

describe('LazyLoadComponents', () => {
  it('should export lazyWithSuspense function', () => {
    expect(typeof lazyWithSuspense).toBe('function')
  })

  it('should export LoadingFallback component', () => {
    expect(typeof LoadingFallback).toBe('function')
  })

  it('lazyWithSuspense should return a component function', () => {
    const mockImport = () => Promise.resolve({ default: () => null })
    const result = lazyWithSuspense(mockImport)
    expect(typeof result).toBe('function')
  })

  it('lazyWithSuspense should accept custom fallback', () => {
    const mockImport = () => Promise.resolve({ default: () => null })
    const customFallback = <div>Custom Loading...</div>
    const result = lazyWithSuspense(mockImport, customFallback)
    expect(typeof result).toBe('function')
  })
})
