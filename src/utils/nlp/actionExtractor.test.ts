import { describe, it, expect } from 'bun:test'
import { extractAction, getDurationForAction, getActionTypeHints } from './actionExtractor'

describe('actionExtractor', () => {
  describe('extractAction', () => {
    it('handles empty input', () => {
      const result = extractAction('')
      expect(result.hasAction).toBe(false)
      expect(result.actionType).toBe('other')
    })

    describe('call actions', () => {
      it('detects "call"', () => {
        const result = extractAction('Call mom')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('call')
        expect(result.estimatedDuration).toBe(15)
      })

      it('detects "phone"', () => {
        const result = extractAction('Phone the dentist')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('call')
      })
    })

    describe('email actions', () => {
      it('detects "email"', () => {
        const result = extractAction('Email John about the proposal')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('email')
        expect(result.estimatedDuration).toBe(15)
      })

      it('detects email action type', () => {
        const result = extractAction('Email client about contract')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('email')
      })
    })

    describe('message actions', () => {
      it('detects "message"', () => {
        const result = extractAction('Message the team')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('message')
        expect(result.estimatedDuration).toBe(5)
      })

      it('detects "text"', () => {
        const result = extractAction('Text Sarah about dinner')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('message')
      })

      it('detects "slack"', () => {
        const result = extractAction('Slack the channel')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('message')
      })
    })

    describe('meeting actions', () => {
      it('detects "meeting"', () => {
        const result = extractAction('Meeting with client at 3pm')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('meeting')
        expect(result.estimatedDuration).toBe(30)
      })

      it('detects "meet"', () => {
        const result = extractAction('Meet John for lunch')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('meeting')
      })

      it('detects "sync"', () => {
        const result = extractAction('Sync with team')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('meeting')
      })

      it('detects "standup"', () => {
        const result = extractAction('Standup at 9am')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('meeting')
      })

      it('detects "1:1"', () => {
        const result = extractAction('1:1 with manager')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('meeting')
      })
    })

    describe('review actions', () => {
      it('detects "review"', () => {
        const result = extractAction('Review the PR')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('review')
        expect(result.estimatedDuration).toBe(30)
      })

      it('detects "check"', () => {
        const result = extractAction('Check the report')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('review')
      })

      it('detects "look at"', () => {
        const result = extractAction('Look at the proposal')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('review')
      })
    })

    describe('write actions', () => {
      it('detects "write"', () => {
        const result = extractAction('Write documentation')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('write')
        expect(result.estimatedDuration).toBe(60)
      })

      it('detects "draft"', () => {
        const result = extractAction('Draft the report')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('write')
      })
    })

    describe('research actions', () => {
      it('detects "research"', () => {
        const result = extractAction('Research competitors')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('research')
        expect(result.estimatedDuration).toBe(45)
      })

      it('detects "investigate"', () => {
        const result = extractAction('Investigate the issue')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('research')
      })

      it('detects "look into"', () => {
        const result = extractAction('Look into new tools')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('research')
      })
    })

    describe('follow up actions', () => {
      it('detects "follow up"', () => {
        const result = extractAction('Follow up with client')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('follow_up')
        expect(result.estimatedDuration).toBe(15)
      })

      it('detects "check-in"', () => {
        const result = extractAction('Check-in with team')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('follow_up')
      })
    })

    describe('other actions', () => {
      it('detects "buy"', () => {
        const result = extractAction('Buy office supplies')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('buy')
      })

      it('detects "pay"', () => {
        const result = extractAction('Pay electricity bill')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('pay')
        expect(result.estimatedDuration).toBe(10)
      })

      it('detects "reserve"', () => {
        const result = extractAction('Reserve table at restaurant')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('book')
      })

      it('detects "create"', () => {
        const result = extractAction('Create new project')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('create')
      })

      it('detects "update"', () => {
        const result = extractAction('Update the docs')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('update')
      })

      it('detects "fix"', () => {
        const result = extractAction('Fix the bug')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('fix')
      })

      it('detects "send"', () => {
        const result = extractAction('Send invoice')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('send')
      })

      it('detects "read"', () => {
        const result = extractAction('Read the article')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('read')
      })

      it('detects "prepare"', () => {
        const result = extractAction('Prepare presentation')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('prepare')
      })

      it('detects "complete"', () => {
        const result = extractAction('Complete the project')
        expect(result.hasAction).toBe(true)
        expect(result.actionType).toBe('complete')
      })
    })

    it('returns correct span information', () => {
      const result = extractAction('Call mom tomorrow')
      expect(result.matchedSpan.start).toBe(0)
      expect(result.matchedSpan.end).toBeGreaterThan(0)
    })

    it('handles text without recognizable action', () => {
      const result = extractAction('Groceries for dinner')
      expect(result.hasAction).toBe(false)
      expect(result.actionType).toBe('other')
    })
  })

  describe('getDurationForAction', () => {
    it('returns duration for known action type', () => {
      const result = getDurationForAction('call')
      expect(result.minutes).toBe(15)
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('returns default duration for other action type', () => {
      const result = getDurationForAction('other')
      expect(result.minutes).toBe(30)
      expect(result.confidence).toBe(0.2)
    })
  })

  describe('getActionTypeHints', () => {
    it('returns array of action hints', () => {
      const hints = getActionTypeHints()
      expect(hints).toBeInstanceOf(Array)
      expect(hints.length).toBeGreaterThan(0)
    })

    it('each hint has type, examples, and duration', () => {
      const hints = getActionTypeHints()
      for (const hint of hints) {
        expect(hint).toHaveProperty('type')
        expect(hint).toHaveProperty('examples')
        expect(hint).toHaveProperty('duration')
      }
    })
  })
})
