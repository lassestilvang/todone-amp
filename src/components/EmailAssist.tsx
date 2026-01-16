import React, { useState } from 'react'
import { Mail, Zap, Copy, Check } from 'lucide-react'
import { Button } from './Button'

interface ExtractedTask {
  title: string
  description?: string
  dueDate?: string
  priority?: string
  links: string[]
}

export const EmailAssist: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([])
  const [copied, setCopied] = useState(false)

  const handleExtract = async () => {
    if (!email.trim()) return

    setIsProcessing(true)
    try {
      // Simulate AI extraction (in production, call backend API)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockTasks: ExtractedTask[] = [
        {
          title: 'Review project proposal',
          description: 'Check the attached proposal and provide feedback',
          dueDate: 'Tomorrow',
          priority: 'High',
          links: ['https://example.com/proposal.pdf'],
        },
        {
          title: 'Schedule follow-up meeting',
          description: 'Follow up with team about the project status',
          dueDate: 'Next week',
          priority: 'Medium',
          links: [],
        },
      ]

      setExtractedTasks(mockTasks)
      setEmail('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopyAll = () => {
    const text = extractedTasks
      .map(
        (t) =>
          `${t.title}\n${t.description || ''}\n${t.dueDate ? `Due: ${t.dueDate}` : ''}\n${t.priority ? `Priority: ${t.priority}` : ''}`
      )
      .join('\n\n')

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6 text-brand-500" />
        <h2 className="text-xl font-semibold text-content-primary">Email Assist</h2>
        <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-medium text-brand-700">
          Pro
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-content-secondary">
        Forward emails or paste email content. AI will extract tasks, due dates, links, and action
        items automatically.
      </p>

      {/* Input Section */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-primary p-4">
        <label className="text-sm font-medium text-content-primary">Email Content</label>
        <textarea
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Paste email content here... or forward to add@todone.app"
          className="min-h-40 rounded border border-border px-3 py-2 text-sm text-content-primary placeholder-content-tertiary"
        />

        <Button
          variant="primary"
          onClick={handleExtract}
          disabled={isProcessing || !email.trim()}
        >
          {isProcessing ? 'Extracting...' : 'Extract Tasks'}
        </Button>
      </div>

      {/* Results */}
      {extractedTasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-content-primary">Extracted Tasks</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAll}
              title="Copy all tasks"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {extractedTasks.map((task, idx) => (
              <div key={idx} className="flex flex-col gap-2 rounded-lg border border-border bg-surface-primary p-4">
                {/* Title */}
                <h4 className="font-medium text-content-primary">{task.title}</h4>

                {/* Description */}
                {task.description && (
                  <p className="text-sm text-content-secondary">{task.description}</p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 border-t border-border pt-2">
                  {task.dueDate && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      📅 {task.dueDate}
                    </span>
                  )}
                  {task.priority && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        task.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>

                {/* Links */}
                {task.links.length > 0 && (
                  <div className="flex flex-col gap-1 border-t border-border pt-2">
                    <p className="text-xs font-medium text-content-secondary">Attached Links</p>
                    {task.links.map((link, linkIdx) => (
                      <a
                        key={linkIdx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-500 hover:underline"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <div className="flex gap-2 border-t border-border pt-2">
                  <Button variant="primary" size="sm" className="flex-1">
                    <Zap className="h-4 w-4" />
                    Use This
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup Info */}
      <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900">How to Use</h4>
        <ol className="list-inside list-decimal space-y-2 text-sm text-blue-800">
          <li>Forward relevant emails to: <code className="bg-white px-2 py-1 font-mono">add@todone.app</code></li>
          <li>AI automatically extracts tasks, dates, and action items</li>
          <li>Review and adjust extracted information</li>
          <li>Create tasks directly to your project</li>
        </ol>
      </div>
    </div>
  )
}
