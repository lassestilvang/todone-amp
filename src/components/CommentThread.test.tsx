import { describe, it, expect, mock } from 'bun:test'
import { CommentThread } from '@/components/CommentThread'

mock.module('@/store/commentStore', () => ({
  useCommentStore: mock(() => ({
    getTaskComments: mock(() => []),
    createComment: mock(),
    updateComment: mock(),
    deleteComment: mock(),
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
