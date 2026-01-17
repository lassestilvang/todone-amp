import React, { useEffect, useState } from 'react'
import { FileText, Download, Loader2, AlertCircle, CheckCircle, Calendar } from 'lucide-react'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface ReportGeneratorProps {
  className?: string
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ className }) => {
  const user = useAuthStore((state) => state.user)
  const { reports, generateReport, getReports, isLoading, error } = useAnalyticsStore()
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (user?.id) {
      getReports(user.id)
    }
  }, [user?.id, getReports])

  const handleGenerateReport = async () => {
    if (user?.id) {
      await generateReport(user.id, format, {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
      })
    }
  }

  const handleDownload = (report: (typeof reports)[number]) => {
    if (report.fileUrl) {
      const link = document.createElement('a')
      link.href = report.fileUrl
      link.download = `${report.title}.${report.format}`
      link.click()
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Report Generator */}
      <div className="rounded-lg border border-border p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-content-primary">Generate Report</h3>
        </div>

        {error && (
          <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-content-secondary">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-content-secondary">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-content-secondary">Report Format</label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value as 'csv' | 'pdf')}
                  className="h-4 w-4"
                />
                <span className="text-sm text-content-secondary">CSV</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value as 'csv' | 'pdf')}
                  className="h-4 w-4"
                />
                <span className="text-sm text-content-secondary">PDF</span>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Generate {format.toUpperCase()} Report
          </button>
        </div>
      </div>

      {/* Previous Reports */}
      {reports && reports.length > 0 && (
        <div className="rounded-lg border border-border p-6">
          <h3 className="mb-4 text-lg font-semibold text-content-primary">Previous Reports</h3>

          <div className="space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-surface-tertiary"
              >
                <div className="flex items-center gap-3">
                  {report.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : report.status === 'failed' ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-content-tertiary" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-content-primary">{report.title}</p>
                    <p className="text-xs text-content-secondary">
                      <Calendar className="mr-1 inline h-3 w-3" />
                      {new Date(report.generatedAt).toLocaleDateString()} at{' '}
                      {new Date(report.generatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {report.status === 'completed' && report.fileUrl && (
                  <button
                    onClick={() => handleDownload(report)}
                    className="rounded-lg border border-border bg-surface-primary px-3 py-1 text-sm font-medium text-content-secondary hover:bg-surface-tertiary"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
