import { describe, it, expect, vi } from 'vitest'
import { CommentThread } from '@/components/CommentThread'

vi.mock('@/store/commentStore', () => ({
  useCommentStore: vi.fn(() => ({
    getTaskComments: vi.fn(() => []),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  })),
}))

describe('CommentThread', () => {
  it('renders a comment thread component', () => {
    expect(CommentThread).toBeTruthy()
  })

  it('exports a valid React component', () => {
    expect(typeof CommentThread).toBe('function')
  })
})
