import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Logger utility', () => {
  let originalEnv: ImportMetaEnv | undefined

  beforeEach(() => {
    originalEnv = import.meta.env
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should export logger object with all methods', async () => {
    const { logger } = await import('./logger')
    expect(logger).toHaveProperty('error')
    expect(logger).toHaveProperty('warn')
    expect(logger).toHaveProperty('info')
    expect(logger).toHaveProperty('debug')
  })

  it('should have functions for all log methods', async () => {
    const { logger } = await import('./logger')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.debug).toBe('function')
  })

  it('logger methods should be callable without throwing', async () => {
    const { logger } = await import('./logger')
    expect(() => logger.error('test error')).not.toThrow()
    expect(() => logger.warn('test warning')).not.toThrow()
    expect(() => logger.info('test info')).not.toThrow()
    expect(() => logger.debug('test debug')).not.toThrow()
  })

  it('logger methods should accept multiple arguments', async () => {
    const { logger } = await import('./logger')
    expect(() => logger.error('message', { data: 'value' }, 123)).not.toThrow()
    expect(() => logger.warn('message', new Error('test'))).not.toThrow()
    expect(() => logger.info('message', 'arg1', 'arg2')).not.toThrow()
    expect(() => logger.debug('message', null, undefined)).not.toThrow()
  })
})
