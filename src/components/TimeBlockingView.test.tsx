import { describe, it, expect } from 'vitest'
import { TimeBlockingView } from '@/components/TimeBlockingView'

describe('TimeBlockingView', () => {
  it('is a valid component', () => {
    expect(TimeBlockingView).toBeTruthy()
    expect(typeof TimeBlockingView).toBe('function')
  })
})
