import React, { useState } from 'react'
import { Mail, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAIStore } from '@/store/aiStore'
import { useTaskStore } from '@/store/taskStore'
import { useProjectStore } from '@/store/projectStore'
import { useLabelStore } from '@/store/labelStore'
import { useAuthStore } from '@/store/authStore'
import { suggestProjectFromContent, suggestLabelsFromContent } from '@/utils/projectSuggestion'
import clsx from 'clsx'

interface EmailTaskParserProps {
  className?: string
}

interface ParsedEmail {
  subject: string
  body: string
  from?: string
}

export const EmailTaskParser: React.FC<EmailTaskParserProps> = ({ className = '' }) => {
  const [email, setEmail] = useState<ParsedEmail>({ subject: '', body: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const { parseEmailContent } = useAIStore()
  const { createTask } = useTaskStore()
  const projects = useProjectStore((state) => state.projects)
  const labels = useLabelStore((state) => state.labels)
  const user = useAuthStore((state) => state.user)

  const handleParseAndCreate = async () => {
    if (!email.subject.trim()) {
      setParseError('Email subject is required')
      return
    }

    if (!user) {
      setParseError('User not authenticated')
      return
    }

    setLoading(true)
    setParseError(null)

    try {
      // Parse email content
      const parsed = await parseEmailContent(email.subject, email.body)

      // Get project and label suggestions
      const projectSuggestion = suggestProjectFromContent(email.subject + ' ' + email.body, projects)
      const labelSuggestions = suggestLabelsFromContent(
        email.subject + ' ' + email.body,
        labels.map((l) => ({ id: l.id, name: l.name }))
      )

      // Create the task with AI metadata
      const newTask = {
        id: `task-${Date.now()}`,
        projectId: projectSuggestion.confidence > 0.5 ? projectSuggestion.projectId : undefined,
        content: parsed.content,
        description: email.body.substring(0, 500), // Use email body as description
        priority: parsed.priority || null,
        dueDate: parsed.dueDate,
        dueTime: parsed.dueTime,
        completed: false,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0,
        reminders: [],
        labels: labelSuggestions.filter((l) => l.confidence > 0.4).map((l) => l.labelId),
        attachments: [],
        aiMetadata: {
          parsedFromText: email.subject + ' ' + email.body,
          extractedAt: new Date(),
          confidence: 0.85,
          sourceType: 'email' as const,
          suggestedProjectId: projectSuggestion.projectId,
          suggestedLabels: labelSuggestions.map((l) => l.labelId),
        },
      }

      await createTask(newTask)

      // Reset form
      setEmail({ subject: '', body: '' })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse email and create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={clsx('rounded-lg border border-border bg-surface-primary p-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-semantic-info" />
        <h3 className="text-lg font-semibold text-content-primary">Parse Email to Task</h3>
      </div>

      <div className="space-y-3">
        {/* Email Subject */}
        <div>
          <label className="block text-sm font-medium text-content-secondary mb-1">
            Email Subject
          </label>
          <input
            type="text"
            value={email.subject}
            onChange={(e) => setEmail({ ...email, subject: e.target.value })}
            placeholder="e.g., Fix critical bug - P1"
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface-primary text-content-primary placeholder-content-tertiary focus:outline-none focus:ring-2 focus:ring-focus"
            disabled={loading}
          />
        </div>

        {/* Email Body */}
        <div>
          <label className="block text-sm font-medium text-content-secondary mb-1">
            Email Body (Description)
          </label>
          <textarea
            value={email.body}
            onChange={(e) => setEmail({ ...email, body: e.target.value })}
            placeholder="Paste email content here. AI will extract due dates, priorities, and labels..."
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface-primary text-content-primary placeholder-content-tertiary focus:outline-none focus:ring-2 focus:ring-focus resize-none"
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {parseError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-semantic-error-light border border-semantic-error">
            <AlertCircle className="w-4 h-4 text-semantic-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-semantic-error">{parseError}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-semantic-success-light border border-semantic-success">
            <CheckCircle2 className="w-4 h-4 text-semantic-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-semantic-success">Task created successfully!</p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleParseAndCreate}
          disabled={loading || !email.subject.trim()}
          className={clsx(
            'w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
            loading || !email.subject.trim()
              ? 'bg-surface-tertiary text-content-tertiary cursor-not-allowed'
              : 'bg-interactive-primary hover:bg-interactive-primary-hover text-white'
          )}
        >
          <Send className="w-4 h-4" />
          {loading ? 'Processing...' : 'Parse & Create Task'}
        </button>

        {/* Info Box */}
        <div className="p-3 rounded-lg bg-semantic-info-light border border-semantic-info">
          <p className="text-xs text-semantic-info font-medium mb-1">AI will automatically:</p>
          <ul className="text-xs text-semantic-info space-y-0.5">
            <li>• Extract priority (urgent, high, low, etc.)</li>
            <li>• Parse due dates (tomorrow, next week, etc.)</li>
            <li>• Suggest matching project</li>
            <li>• Suggest relevant labels</li>
            <li>• Use email body as task description</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
