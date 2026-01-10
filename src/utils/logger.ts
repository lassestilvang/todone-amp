/**
 * Logger utility for development-only logging.
 *
 * In production builds, all logging is disabled via tree-shaking.
 * In development, logs are forwarded to the console.
 *
 * Usage:
 *   import { logger } from '@/utils/logger'
 *   logger.error('Failed to save:', error)
 *   logger.warn('Deprecated feature used')
 *   logger.info('Operation complete')
 *   logger.debug('Detailed info:', data)
 */

const isDev = import.meta.env?.DEV ?? false

const noop = (): void => {}

export const logger = {
  error: isDev ? console.error.bind(console) : noop,
  warn: isDev ? console.warn.bind(console) : noop,
  info: isDev ? console.log.bind(console) : noop,
  debug: isDev ? console.log.bind(console) : noop,
}
