import { useState } from 'react'
import { Upload, Trash2, Loader } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTeamStore } from '@/store/teamStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from './Button'
import { Input } from './Input'

export interface TeamSettingsProps {
  teamId: string
  className?: string
  onSave?: () => void
}

export function TeamSettings({ teamId, className, onSave }: TeamSettingsProps) {
  const { getTeamById, updateTeam, deleteTeam } = useTeamStore()
  const { user } = useAuthStore()
  const team = getTeamById(teamId)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    name: team?.name || '',
    description: team?.description || '',
  })
  const [avatarPreview, setAvatarPreview] = useState(team?.avatar || '')

  if (!team) {
    return <div>Team not found</div>
  }

  const isOwner = team.ownerId === user?.id

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setAvatarPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateTeam(teamId, {
        name: formData.name,
        description: formData.description,
        avatar: avatarPreview || undefined,
      })
      setIsEditing(false)
      onSave?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteTeam(teamId)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: team.name,
      description: team.description || '',
    })
    setAvatarPreview(team.avatar || '')
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Team Settings</h2>

        <div className="space-y-6">
          {/* Team Avatar */}
          {isEditing && (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div
                  className={cn(
                    'w-20 h-20 rounded-lg bg-gradient-to-br',
                    'from-brand-400 to-brand-600 flex items-center justify-center',
                    'text-white text-2xl font-bold overflow-hidden'
                  )}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Team" className="w-full h-full object-cover" />
                  ) : (
                    team.name?.charAt(0).toUpperCase() || 'T'
                  )}
                </div>

                <label className="absolute bottom-0 right-0 p-1.5 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors shadow-lg cursor-pointer">
                  <Upload size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
            {isEditing ? (
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Team name"
              />
            ) : (
              <p className="text-gray-900 font-medium">{formData.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Team description"
                rows={3}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                  'resize-none'
                )}
              />
            ) : (
              <p className="text-gray-600">{formData.description || 'No description'}</p>
            )}
          </div>

          {/* Team Info */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Owner</p>
              <p className="text-gray-900 font-medium">
                {team.ownerId === user?.id ? 'You' : 'Team Owner'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Created</p>
              <p className="text-gray-900 font-medium">
                {new Date(team.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Buttons */}
          {isOwner && (
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {isEditing ? (
                <>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading && <Loader size={16} className="animate-spin" />}
                    Save Changes
                  </Button>
                  <Button variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => setIsEditing(true)}>
                    Edit Team
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="ml-auto flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Team
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Team?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All team data will be permanently deleted.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader size={16} className="animate-spin" />}
                Delete
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
