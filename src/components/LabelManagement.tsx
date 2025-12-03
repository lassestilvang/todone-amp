import { useState } from 'react'
import { X, Trash2, Edit2 } from 'lucide-react'
import { useLabelStore } from '@/store/labelStore'
import { LabelBadge } from '@/components/LabelBadge'
import { LabelColorPicker } from '@/components/LabelColorPicker'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import type { Label } from '@/types'
import type { LabelColor } from '@/store/labelStore'

interface LabelManagementProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function LabelManagement({ isOpen, onClose, userId }: LabelManagementProps) {
  const { labels, createLabel, updateLabel, deleteLabel } = useLabelStore()
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState<LabelColor>('blue')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState<LabelColor>('blue')

  const handleCreate = async () => {
    if (!newLabelName.trim()) return

    try {
      await createLabel({
        name: newLabelName,
        color: newLabelColor,
        ownerId: userId,
        isShared: false,
      })
      setNewLabelName('')
      setNewLabelColor('blue')
    } catch (error) {
      console.error('Failed to create label:', error)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return

    try {
      await updateLabel(id, {
        name: editName,
        color: editColor,
      })
      setEditingId(null)
    } catch (error) {
      console.error('Failed to update label:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this label? Tasks will keep their other labels.')) {
      try {
        await deleteLabel(id)
      } catch (error) {
        console.error('Failed to delete label:', error)
      }
    }
  }

  const startEdit = (label: Label) => {
    setEditingId(label.id)
    setEditName(label.name)
    setEditColor(label.color as LabelColor)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Manage Labels</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Create New Label */}
            <div className="border-b pb-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Create New Label</h3>

              <Input
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                }}
              />

              <LabelColorPicker value={newLabelColor} onChange={setNewLabelColor} />

              <Button onClick={handleCreate} disabled={!newLabelName.trim()}>
                Create Label
              </Button>
            </div>

            {/* Existing Labels */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Your Labels ({labels.length})
              </h3>

              {labels.length === 0 ? (
                <p className="text-sm text-gray-500">No labels created yet</p>
              ) : (
                <div className="space-y-2">
                  {labels.map((label) =>
                    editingId === label.id ? (
                      <div
                        key={label.id}
                        className="flex items-end gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1 space-y-2">
                          <label className="block text-xs font-medium text-gray-700">Name</label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Label name..."
                          />
                        </div>

                        <div className="flex-1">
                          <LabelColorPicker value={editColor} onChange={setEditColor} />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(label.id)}
                            disabled={!editName.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={label.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <LabelBadge label={label} size="md" />

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(label)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-white transition-colors"
                            title="Edit label"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(label.id)}
                            className="p-1 text-red-400 hover:text-red-600 rounded-md hover:bg-white transition-colors"
                            title="Delete label"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
