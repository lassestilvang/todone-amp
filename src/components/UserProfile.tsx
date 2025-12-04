import { useState, useRef } from 'react'
import { Upload, Loader } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { Button } from './Button'
import { Input } from './Input'

export interface UserProfileProps {
  className?: string
  onSave?: () => void
}

export function UserProfile({ className, onSave }: UserProfileProps) {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) {
    return <div>Loading user profile...</div>
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await updateUser({
        name: formData.name,
        avatar: avatarPreview || undefined,
      })
      setIsEditing(false)
      onSave?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: user.name,
      email: user.email,
    })
    setAvatarPreview(user.avatar || '')
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div
                className={cn(
                  'w-24 h-24 rounded-full bg-gradient-to-br',
                  'from-brand-400 to-brand-600 flex items-center justify-center',
                  'text-white text-xl font-bold overflow-hidden'
                )}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>

              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'absolute bottom-0 right-0 p-2 bg-brand-500 text-white rounded-full',
                    'hover:bg-brand-600 transition-colors shadow-lg'
                  )}
                >
                  <Upload size={16} />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            {isEditing ? (
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
              />
            ) : (
              <p className="text-gray-900">{formData.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="text-gray-600">{formData.email}</p>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
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
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
