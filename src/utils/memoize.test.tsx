import { describe, it, expect } from 'bun:test'
import { deepEqual, shallowEqualIgnoreFunctions, listItemPropsEqual } from './memoize'

describe('memoize utilities', () => {
  describe('deepEqual', () => {
    it('should return true for identical primitives', () => {
      expect(deepEqual(1, 1)).toBe(true)
      expect(deepEqual('test', 'test')).toBe(true)
      expect(deepEqual(true, true)).toBe(true)
    })

    it('should return false for different primitives', () => {
      expect(deepEqual(1, 2)).toBe(false)
      expect(deepEqual('test', 'other')).toBe(false)
    })

    it('should return true for identical objects', () => {
      const obj = { a: 1, b: 'test' }
      expect(deepEqual(obj, obj)).toBe(true)
    })

    it('should return true for equivalent objects', () => {
      expect(deepEqual({ a: 1, b: 'test' }, { a: 1, b: 'test' })).toBe(true)
    })

    it('should return false for different objects', () => {
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
    })

    it('should handle nested objects', () => {
      const obj1 = { a: { b: { c: 1 } } }
      const obj2 = { a: { b: { c: 1 } } }
      expect(deepEqual(obj1, obj2)).toBe(true)
    })

    it('should handle null and undefined', () => {
      expect(deepEqual(null, null)).toBe(true)
      expect(deepEqual(undefined, undefined)).toBe(true)
      expect(deepEqual(null, undefined)).toBe(false)
    })
  })

  describe('shallowEqualIgnoreFunctions', () => {
    it('should return true for identical props ignoring functions', () => {
      const props1 = { a: 1, onClick: () => {} }
      const props2 = { a: 1, onClick: () => {} }
      expect(shallowEqualIgnoreFunctions(props1, props2)).toBe(true)
    })

    it('should return false if data props differ', () => {
      const props1 = { a: 1, onClick: () => {} }
      const props2 = { a: 2, onClick: () => {} }
      expect(shallowEqualIgnoreFunctions(props1, props2)).toBe(false)
    })

    it('should ignore different function references', () => {
      const fn1 = () => {}
      const fn2 = () => {}
      expect(shallowEqualIgnoreFunctions({ fn: fn1 }, { fn: fn2 })).toBe(true)
    })

    it('should compare different key counts', () => {
      const props1 = { a: 1 }
      const props2 = { a: 1, b: 2 }
      expect(shallowEqualIgnoreFunctions(props1, props2)).toBe(false)
    })
  })

  describe('listItemPropsEqual', () => {
    it('should return true for identical list items', () => {
      const props1 = { id: '1', title: 'Test', onClick: () => {} }
      const props2 = { id: '1', title: 'Test', onClick: () => {} }
      expect(listItemPropsEqual(props1, props2)).toBe(true)
    })

    it('should ignore onClick differences', () => {
      const props1 = { id: '1', title: 'Test', onClick: () => {} }
      const props2 = { id: '1', title: 'Test', onClick: () => 'different' }
      expect(listItemPropsEqual(props1, props2)).toBe(true)
    })

    it('should return false when data changes', () => {
      const props1 = { id: '1', title: 'Test', onClick: () => {} }
      const props2 = { id: '1', title: 'Different', onClick: () => {} }
      expect(listItemPropsEqual(props1, props2)).toBe(false)
    })
  })
})
