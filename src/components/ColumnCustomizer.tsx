import { useState } from 'react'
import { Settings, GripVertical, Eye, EyeOff } from 'lucide-react'
import { useViewStore } from '@/store/viewStore'
import { Button } from '@/components/Button'
import { DEFAULT_COLUMNS } from '@/utils/columnConfig'

export function ColumnCustomizer() {
  const [showModal, setShowModal] = useState(false)
  const listColumns = useViewStore((state) => state.listColumns || DEFAULT_COLUMNS)
  const setListColumns = useViewStore((state) => state.setListColumns)

  const handleToggleColumn = (columnId: string) => {
    const updated = listColumns.map((col) =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    )
    setListColumns(updated)
  }

  const handleResetColumns = () => {
    setListColumns(DEFAULT_COLUMNS)
  }

  const visibleCount = listColumns.filter((c) => c.visible).length

  return (
    <>
      <button
        onClick={() => setShowModal(!showModal)}
        className="p-2 text-content-secondary hover:bg-surface-tertiary rounded transition-colors"
        title="Customize columns"
      >
        <Settings size={18} />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />

          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-surface-primary rounded-lg shadow-xl max-w-sm w-full">
              <div className="sticky top-0 bg-surface-primary border-b border-border px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-content-primary">Customize Columns</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-content-tertiary hover:text-content-secondary"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-3">
                {listColumns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical size={16} className="text-content-tertiary cursor-grab" />
                      <span className="text-sm font-medium text-content-secondary">{column.label}</span>
                    </div>

                    <button
                      onClick={() => handleToggleColumn(column.id)}
                      className={`p-2 rounded transition-colors ${
                        column.visible
                          ? 'text-brand-600 bg-brand-50'
                          : 'text-content-tertiary hover:bg-surface-tertiary'
                      }`}
                      title={column.visible ? 'Hide' : 'Show'}
                    >
                      {column.visible ? (
                        <Eye size={16} />
                      ) : (
                        <EyeOff size={16} />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border px-6 py-4 flex gap-2">
                <Button onClick={handleResetColumns} variant="secondary" className="flex-1">
                  Reset
                </Button>
                <Button onClick={() => setShowModal(false)} className="flex-1">
                  Done
                </Button>
              </div>

              <div className="text-xs text-content-tertiary px-6 pb-4">
                {visibleCount} of {listColumns.length} columns visible
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
