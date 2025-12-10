import React, { useState } from 'react'
import { Printer, Download } from 'lucide-react'
import { Task } from '@/types'
import { printTasks, exportTasksAsHTML } from '@/utils/printUtils'
import { Button } from './Button'

interface PrintTasksButtonProps {
  tasks: Task[]
  title?: string
  variant?: 'default' | 'icon'
  className?: string
}

/**
 * Button component for printing and exporting tasks
 */
export const PrintTasksButton: React.FC<PrintTasksButtonProps> = ({
  tasks,
  title = 'Task List',
  variant = 'default',
  className = '',
}) => {
  const [showOptions, setShowOptions] = useState(false)

  const handlePrint = () => {
    printTasks(tasks, {
      title,
      includeCompleted: true,
      includeDescriptions: true,
    })
    setShowOptions(false)
  }

  const handleExport = () => {
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`
    exportTasksAsHTML(tasks, filename, {
      title,
      includeCompleted: true,
      includeDescriptions: true,
    })
    setShowOptions(false)
  }

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`p-2 hover:bg-gray-100 rounded-md transition-colors ${className}`}
          title="Print tasks"
          aria-label="Print options"
        >
          <Printer size={20} />
        </button>

        {showOptions && (
          <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <button
              onClick={handlePrint}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleExport}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-200"
            >
              <Download size={16} />
              Export as HTML
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="secondary"
        icon={Printer}
        onClick={handlePrint}
        className={className}
      >
        Print
      </Button>
      <Button
        variant="secondary"
        icon={Download}
        onClick={handleExport}
        className={className}
      >
        Export
      </Button>
    </div>
  )
}

export default PrintTasksButton
