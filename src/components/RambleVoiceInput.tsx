import React, { useState, useRef } from 'react'
import { Mic, MicOff, RefreshCw, Check, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { logger } from '@/utils/logger'

interface ExtractedTask {
  title: string
  description?: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export const RambleVoiceInput: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        // audioBlob would be used in production: new Blob(chunksRef.current, { type: 'audio/wav' })
        void processAudio()
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError('')
    } catch (err) {
      setError('Microphone access denied. Please check your browser permissions.')
      logger.error('Error accessing microphone:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (): Promise<void> => {
    setIsProcessing(true)
    try {
      // Simulate speech-to-text conversion (in production, use Web Speech API or API call)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockTranscript =
        'I need to finish the project proposal by Friday afternoon, also need to review the budget spreadsheet and send it to John, mark it as urgent'

      setTranscript(mockTranscript)

      // Simulate task extraction from transcript
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockTasks: ExtractedTask[] = [
        {
          title: 'Finish the project proposal',
          dueDate: 'Friday',
          priority: 'high',
        },
        {
          title: 'Review the budget spreadsheet',
          description: 'Review and send to John',
          dueDate: 'Friday',
          priority: 'urgent',
        },
      ]

      setExtractedTasks(mockTasks)
    } catch (err) {
      setError('Failed to process audio. Please try again.')
      logger.error('Error processing audio:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetry = () => {
    setTranscript('')
    setExtractedTasks([])
    setError('')
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Mic className="h-6 w-6 text-brand-500" />
        <h2 className="text-xl font-semibold text-content-primary">Ramble</h2>
        <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-medium text-brand-700">
          Pro
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-content-secondary">
        Talk naturally about your tasks. AI understands context, extracts due dates, priorities,
        and creates organized tasks automatically.
      </p>

      {/* Recording Section */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-primary p-6">
        {!transcript ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-50">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-brand-500 hover:bg-brand-600'
                } text-white shadow-lg`}
              >
                {isRecording ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="font-medium text-content-primary">
                {isRecording ? 'Recording...' : 'Click to start talking'}
              </p>
              {isRecording && (
                <p className="text-xs text-content-tertiary">
                  Speak naturally, mention dates, priorities, and details
                </p>
              )}
            </div>

            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-content-secondary">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing audio...
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Transcript */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-content-primary">Transcript</label>
              <div className="rounded border border-border bg-surface-secondary p-3">
                <p className="text-sm text-content-secondary">{transcript}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleRetry} className="flex-1">
                <RefreshCw className="h-4 w-4" />
                Record Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Extracted Tasks */}
      {extractedTasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-content-primary">Extracted Tasks</h3>

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
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex gap-2 border-t border-border pt-2">
                  <Button variant="primary" size="sm" className="flex-1">
                    <Check className="h-4 w-4" />
                    Create Task
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900">Tips for Best Results</h4>
        <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
          <li>Speak naturally - mention specific dates and priorities</li>
          <li>Use phrases like "due Friday" or "urgent" for better extraction</li>
          <li>Mention who should be assigned (for team members)</li>
          <li>Include sub-tasks in one ramble for related work</li>
        </ul>
      </div>
    </div>
  )
}
