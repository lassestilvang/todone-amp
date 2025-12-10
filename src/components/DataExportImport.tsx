import { useState } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useProjectStore } from '@/store/projectStore'
import { useSectionStore } from '@/store/sectionStore'
import { useLabelStore } from '@/store/labelStore'
import { useFilterStore } from '@/store/filterStore'
import { useAuthStore } from '@/store/authStore'
import {
  exportDataAsJSON,
  exportTasksAsCSV,
  exportCompletionReportAsCSV,
  downloadAllData,
  downloadTasksAsCSV,
  downloadCompletionReport,
  parseImportedData,
  validateImportedData,
} from '@/utils/exportImport'
import { Download, Upload, FileJson, FileText } from 'lucide-react'
import { Button } from '@/components/Button'
import { cn } from '@/utils/cn'

export function DataExportImport() {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'report'>('json')
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  const user = useAuthStore((state) => state.user)
  const tasks = useTaskStore((state) => state.tasks)
  const projects = useProjectStore((state) => state.projects)
  const sections = useSectionStore((state) => state.sections)
  const labels = useLabelStore((state) => state.labels)
  const filters = useFilterStore((state) => state.filters)
  const createTask = useTaskStore((state) => state.createTask)
  const createProject = useProjectStore((state) => state.createProject)
  const createSection = useSectionStore((state) => state.createSection)
  const createLabel = useLabelStore((state) => state.createLabel)

  const labelMap = new Map(labels.map((l) => [l.id, l]))

  const handleExport = () => {
    if (!user) return

    if (exportFormat === 'json') {
      const exportData = exportDataAsJSON(
        projects,
        tasks,
        sections,
        labels,
        filters,
        user.name,
        user.email
      )
      downloadAllData(exportData)
    } else if (exportFormat === 'csv') {
      const csv = exportTasksAsCSV(tasks, labelMap)
      downloadTasksAsCSV(csv)
    } else if (exportFormat === 'report') {
      const csv = exportCompletionReportAsCSV(tasks, labelMap)
      downloadCompletionReport(csv)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const data = parseImportedData(content)

      if (!data) {
        setImportError('Invalid file format. Please select a Todone export file.')
        setImportSuccess(false)
        return
      }

      const validation = validateImportedData(data)
      if (!validation.valid) {
        setImportError(`Import validation failed: ${validation.errors.join(', ')}`)
        setImportSuccess(false)
        return
      }

      // Import data
      if (data.projects.length > 0) {
        for (const project of data.projects) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, createdAt, updatedAt, ...projectData } = project
          await createProject(projectData)
        }
      }
      if (data.sections.length > 0) {
        for (const section of data.sections) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, createdAt, updatedAt, ...sectionData } = section
          await createSection(sectionData)
        }
      }
      if (data.labels.length > 0) {
        for (const label of data.labels) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, createdAt, updatedAt, ...labelData } = label
          await createLabel(labelData)
        }
      }
      if (data.tasks.length > 0) {
        for (const task of data.tasks) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, createdAt, updatedAt, ...taskData } = task
          await createTask(taskData)
        }
      }

      setImportSuccess(true)
      setImportError(null)
      setTimeout(() => setImportSuccess(false), 5000)
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'Failed to import data. Please try again.'
      )
      setImportSuccess(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('export')}
          className={cn(
            'px-4 py-2 font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'export'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Download className="w-4 h-4 mr-2 inline" />
          Export Data
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={cn(
            'px-4 py-2 font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'import'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Upload className="w-4 h-4 mr-2 inline" />
          Import Data
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Download all your tasks, projects, and settings in various formats.
          </p>

          <div className="grid gap-4">
            {/* JSON Export */}
            <div
              onClick={() => setExportFormat('json')}
              className={cn(
                'p-4 border-2 rounded-lg cursor-pointer transition-colors',
                exportFormat === 'json'
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-start gap-3">
                <FileJson className="w-6 h-6 text-brand-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Complete Backup (JSON)</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Export all data including projects, tasks, settings, and filters. Perfect for
                    backup and migration.
                  </p>
                  <div className="text-xs text-gray-400 mt-2">
                    Total: {tasks.length} tasks • {projects.length} projects • {labels.length} labels
                  </div>
                </div>
              </div>
            </div>

            {/* CSV Export */}
            <div
              onClick={() => setExportFormat('csv')}
              className={cn(
                'p-4 border-2 rounded-lg cursor-pointer transition-colors',
                exportFormat === 'csv'
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Tasks List (CSV)</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Export active and completed tasks as a spreadsheet. Includes priority, due date,
                    and labels.
                  </p>
                  <div className="text-xs text-gray-400 mt-2">{tasks.length} tasks</div>
                </div>
              </div>
            </div>

            {/* Completion Report */}
            <div
              onClick={() => setExportFormat('report')}
              className={cn(
                'p-4 border-2 rounded-lg cursor-pointer transition-colors',
                exportFormat === 'report'
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Completion Report (CSV)</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Export completed tasks with completion dates. Useful for productivity analysis.
                  </p>
                  <div className="text-xs text-gray-400 mt-2">
                    {tasks.filter((t) => t.completed).length} completed tasks
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleExport} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download {exportFormat === 'json' ? 'Backup' : 'Report'}
          </Button>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Import data from a previous Todone export or another source.
          </p>

          {importSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Data imported successfully!</p>
              <p className="text-sm text-green-700 mt-1">
                Your data has been added to your Todone workspace.
              </p>
            </div>
          )}

          {importError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">✗ Import failed</p>
              <p className="text-sm text-red-700 mt-1">{importError}</p>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file" className="cursor-pointer block">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Click to import or drag and drop</p>
              <p className="text-sm text-gray-500 mt-1">JSON files from Todone exports</p>
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Import Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Only JSON exports from Todone are supported</li>
              <li>• Imported data will be added to your existing workspace</li>
              <li>• Duplicate tasks may be created if importing the same file twice</li>
              <li>• Labels and projects will be merged with existing ones</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
