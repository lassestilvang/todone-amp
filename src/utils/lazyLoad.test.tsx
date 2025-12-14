import { describe, it, expect } from 'vitest'
import { lazyWithSuspense, lazyWithDelay, preloadComponent, lazyLoadPatterns, LoadingFallback } from './lazyLoad'

describe('lazyLoad (re-exports)', () => {
  it('should export lazyWithSuspense function', () => {
    expect(typeof lazyWithSuspense).toBe('function')
  })

  it('should export lazyWithDelay function', () => {
    expect(typeof lazyWithDelay).toBe('function')
  })

  it('should export preloadComponent function', () => {
    expect(typeof preloadComponent).toBe('function')
  })

  it('should export lazyLoadPatterns', () => {
    expect(lazyLoadPatterns).toHaveProperty('views')
    expect(lazyLoadPatterns).toHaveProperty('components')
  })

  it('should export LoadingFallback component', () => {
    expect(typeof LoadingFallback).toBe('function')
  })
})
