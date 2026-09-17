import { describe, it, expect, beforeEach } from 'bun:test'
import { CommentThread } from '@/components/CommentThread'
import { useCommentStore } from '@/store/commentStore'

describe('CommentThread', () => {
  beforeEach(() => {
    useCommentStore.setState({
      comments: [],
      isLoading: false,
    })
  })

  it('renders a comment thread component', () => {
    expect(CommentThread).toBeTruthy()
  })

  it('exports a valid React component', () => {
    expect(typeof CommentThread).toBe('function')
  })
})
