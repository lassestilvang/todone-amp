import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'
import { useProjectStore } from '@/store/projectStore'
import { useSectionStore } from '@/store/sectionStore'
import { useLabelStore } from '@/store/labelStore'
import { useFilterStore } from '@/store/filterStore'
import { useGamificationStore } from '@/store/gamificationStore'
import { useThemeStore, type ThemeMode, type ThemeName } from '@/store/themeStore'
import {
  Settings,
  User,
  Lock,
  Bell,
  Palette,
  Languages,
  Eye,
  Download,
  Trash2,
  ChevronDown,
  Check,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/Button'
import { cn } from '@/utils/cn'
import { exportDataAsJSON, exportTasksAsCSV, downloadFile } from '@/utils/exportImport'
import { useDyslexiaFont } from '@/hooks/useDyslexiaFont'

type SettingsTab = 'account' | 'app' | 'privacy' | 'notifications' | 'theme'

interface LanguageOption {
  code: string
  name: string
  nativeName: string
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
]

const THEME_MODES: { id: ThemeMode; name: string; icon: string }[] = [
  { id: 'light', name: 'Light', icon: '☀️' },
  { id: 'dark', name: 'Dark', icon: '🌙' },
  { id: 'system', name: 'System', icon: '⚙️' },
]

interface ColorThemeConfig {
  id: ThemeName
  name: string
  description: string
  preview: {
    bg: string
    surface: string
    text: string
    accent: string
    border: string
  }
}

const COLOR_THEMES: ColorThemeConfig[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Standard Todone colors',
    preview: { bg: '#ffffff', surface: '#f9fafb', text: '#111827', accent: '#22c55e', border: '#e5e7eb' },
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Arctic, north-bluish colors',
    preview: { bg: '#2e3440', surface: '#3b4252', text: '#eceff4', accent: '#88c0d0', border: '#4c566a' },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: 'Dark theme with vibrant accents',
    preview: { bg: '#282a36', surface: '#44475a', text: '#f8f8f2', accent: '#bd93f9', border: '#6272a4' },
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    description: 'Warm, light background',
    preview: { bg: '#fdf6e3', surface: '#eee8d5', text: '#657b83', accent: '#268bd2', border: '#93a1a1' },
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    description: 'Warm, dark background',
    preview: { bg: '#002b36', surface: '#073642', text: '#839496', accent: '#268bd2', border: '#586e75' },
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    description: 'Atom editor inspired',
    preview: { bg: '#282c34', surface: '#21252b', text: '#abb2bf', accent: '#61afef', border: '#3e4451' },
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    description: 'Clean and minimal',
    preview: { bg: '#ffffff', surface: '#f6f8fa', text: '#1f2328', accent: '#1f883d', border: '#d0d7de' },
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    description: 'Modern dark mode',
    preview: { bg: '#0d1117', surface: '#161b22', text: '#e6edf3', accent: '#3fb950', border: '#30363d' },
  },
]

const ThemePreviewThumbnail: React.FC<{ theme: ColorThemeConfig }> = ({ theme }) => (
  <div
    className="w-16 h-12 rounded-md overflow-hidden border flex-shrink-0"
    style={{ backgroundColor: theme.preview.bg, borderColor: theme.preview.border }}
  >
    <div className="h-3 flex items-center px-1 gap-0.5" style={{ backgroundColor: theme.preview.surface }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.preview.accent }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.preview.text, opacity: 0.3 }} />
    </div>
    <div className="p-1 space-y-0.5">
      <div className="h-1 w-8 rounded-sm" style={{ backgroundColor: theme.preview.text }} />
      <div className="h-1 w-6 rounded-sm" style={{ backgroundColor: theme.preview.text, opacity: 0.5 }} />
      <div className="h-2 w-full rounded-sm" style={{ backgroundColor: theme.preview.accent, opacity: 0.2 }} />
    </div>
  </div>
)

const ACCENT_COLORS = [
  { name: 'Blue', value: 'blue-600', hex: '#2563eb' },
  { name: 'Green', value: 'green-600', hex: '#16a34a' },
  { name: 'Purple', value: 'purple-600', hex: '#9333ea' },
  { name: 'Orange', value: 'orange-600', hex: '#ea580c' },
  { name: 'Red', value: 'red-600', hex: '#dc2626' },
  { name: 'Pink', value: 'pink-600', hex: '#db2777' },
  { name: 'Indigo', value: 'indigo-600', hex: '#4f46e5' },
  { name: 'Emerald', value: 'emerald-600', hex: '#059669' },
]

export const SettingsView: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore()
  const { tasks } = useTaskStore()
  const { projects } = useProjectStore()
  const { sections } = useSectionStore()
  const { labels } = useLabelStore()
  const { filters } = useFilterStore()
  useGamificationStore()
  const { mode: themeMode, theme: colorTheme, setMode: setThemeMode, setTheme: setColorTheme } = useThemeStore()
  const { enabled: dyslexiaEnabled, toggle: toggleDyslexiaFont } = useDyslexiaFont()
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null)
  const [originalTheme, setOriginalTheme] = useState<ThemeName | null>(null)
  const originalThemeRef = useRef<ThemeName | null>(null)
  const setColorThemeRef = useRef(setColorTheme)

  useEffect(() => {
    originalThemeRef.current = originalTheme
  }, [originalTheme])

  useEffect(() => {
    setColorThemeRef.current = setColorTheme
  }, [setColorTheme])

  const startPreview = (theme: ThemeName) => {
    if (theme === colorTheme) return
    if (originalTheme === null) {
      setOriginalTheme(colorTheme)
    }
    setPreviewTheme(theme)
    setColorTheme(theme)
  }

  const confirmPreview = () => {
    setPreviewTheme(null)
    setOriginalTheme(null)
  }

  const cancelPreview = () => {
    if (originalTheme !== null) {
      setColorTheme(originalTheme)
    }
    setPreviewTheme(null)
    setOriginalTheme(null)
  }

  useEffect(() => {
    return () => {
      if (originalThemeRef.current !== null) {
        setColorThemeRef.current(originalThemeRef.current)
      }
    }
  }, [])

  if (!user) return null

  const handlePasswordChange = () => {
    if (!password) return
    // In a real app, this would call a backend API
    alert('Password changed successfully! (Demo - not persisted)')
    setPassword('')
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, this would call a backend API
      localStorage.removeItem('userId')
      logout()
    }
  }

  const handleDataExport = () => {
    if (!user) return
    const exportData = exportDataAsJSON(projects, tasks, sections, labels, filters, user.name, user.email)
    downloadFile(JSON.stringify(exportData, null, 2), `todone-export-${Date.now()}.json`, 'application/json')
  }

  const handleCSVExport = () => {
    if (!user) return
    const labelsMap = new Map(labels.map((label) => [label.id, label]))
    const csvContent = exportTasksAsCSV(tasks, labelsMap)
    downloadFile(csvContent, `todone-tasks-${Date.now()}.csv`, 'text/csv')
  }

  const handleLanguageChange = (langCode: string) => {
    // In a real app, this would apply translations
    updateUser({
      ...user,
      settings: {
        ...user.settings,
        language: langCode,
      },
    })
    setShowLanguageDropdown(false)
  }

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
  }

  const handlePrivacyToggle = (key: string, value: boolean) => {
    updateUser({
      ...user,
      settings: {
        ...user.settings,
        [key]: value,
      },
    })
  }

  const SettingsSection = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-6 pb-6 border-b border-border">
      <h3 className="text-lg font-semibold text-content-primary mb-1">{title}</h3>
      <p className="text-sm text-content-secondary">{description}</p>
    </div>
  )

  const TabButton = ({ tab, icon: Icon, label }: { tab: SettingsTab; icon: LucideIcon; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
        activeTab === tab
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
          : 'text-content-secondary hover:bg-surface-tertiary'
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-content-primary flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-content-secondary mt-2">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-4 bg-surface-primary rounded-lg">
          <TabButton tab="account" icon={User} label="Account" />
          <TabButton tab="app" icon={Palette} label="App" />
          <TabButton tab="notifications" icon={Bell} label="Notifications" />
          <TabButton tab="privacy" icon={Eye} label="Privacy" />
          <TabButton tab="theme" icon={Lock} label="Theme" />
        </div>

        {/* Content */}
        <div className="bg-surface-primary rounded-lg p-6 sm:p-8 shadow-sm">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div>
              <SettingsSection
                title="Profile Information"
                description="Update your personal details"
              />

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => updateUser({ ...user, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface-primary text-content-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface-tertiary text-content-primary"
                  />
                  <p className="text-xs text-content-tertiary mt-1">Email cannot be changed</p>
                </div>
              </div>

              <SettingsSection
                title="Password"
                description="Change your password regularly for security"
              />

              <div className="space-y-4 mb-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-content-secondary mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-surface-primary"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-content-tertiary"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <Button onClick={handlePasswordChange} variant="primary" className="w-full sm:w-auto">
                  Update Password
                </Button>
              </div>

              <SettingsSection
                title="Data Management"
                description="Export your tasks and data"
              />

              <div className="space-y-2 mb-6">
                <Button
                  onClick={handleDataExport}
                  variant="secondary"
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export All Data (JSON)
                </Button>
                <Button
                  onClick={handleCSVExport}
                  variant="secondary"
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Tasks (CSV)
                </Button>
              </div>

              <SettingsSection
                title="Danger Zone"
                description="Irreversible actions"
              />

              <Button
                onClick={() => setIsDeleteModalOpen(true)}
                variant="danger"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          )}

          {/* App Settings */}
          {activeTab === 'app' && (
            <div>
              <SettingsSection
                title="Language"
                description="Choose your preferred language"
              />

              <div className="mb-6 relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    {LANGUAGES.find((l) => l.code === user.settings?.language)?.nativeName ||
                      'English'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showLanguageDropdown && (
                  <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg z-10 max-h-64 overflow-y-auto">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                      >
                        {lang.code === user.settings?.language && <span className="text-blue-600">✓</span>}
                        <span>{lang.nativeName}</span>
                        {lang.code !== lang.code.toUpperCase() && (
                          <span className="text-gray-500 text-sm">({lang.name})</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <SettingsSection
                title="App Preferences"
                description="Customize how Todone works for you"
              />

              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={user.settings?.enableKarma ?? true}
                    onChange={(e) => handlePrivacyToggle('enableKarma', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable karma system</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={user.settings?.vacationMode ?? false}
                    onChange={(e) => handlePrivacyToggle('vacationMode', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Vacation mode (disable streaks)</span>
                </label>
              </div>

              <SettingsSection
                title="Experimental Features"
                description="Try new features before they're officially released"
              />

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={user.settings?.experimentalFeatures ?? false}
                    onChange={(e) => handlePrivacyToggle('experimentalFeatures', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable experimental features</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                  These features may be unstable and are subject to change
                </p>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <SettingsSection
                title="Notification Preferences"
                description="Control how you receive notifications"
              />

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-content-secondary">Browser notifications</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-content-secondary">Email notifications</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-content-secondary">Push notifications</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-content-secondary">Sound notifications</span>
                </label>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium text-content-primary mb-3">Quiet Hours</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={false} className="h-4 w-4 rounded" />
                    <span className="text-sm text-content-secondary">Enable quiet hours</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div>
              <SettingsSection
                title="Privacy & Data"
                description="Control your data and privacy settings"
              />

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-surface-secondary rounded-lg">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={user.settings?.showOnLeaderboard ?? false}
                      onChange={(e) => handlePrivacyToggle('showOnLeaderboard', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium text-content-primary">
                        Show profile on leaderboard
                      </span>
                      <p className="text-xs text-content-secondary mt-1">
                        Allow other users to see your name and karma level on the global leaderboard
                      </p>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-surface-secondary rounded-lg">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={user.settings?.allowAnalytics ?? true}
                      onChange={(e) => handlePrivacyToggle('allowAnalytics', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium text-content-primary">
                        Allow analytics collection
                      </span>
                      <p className="text-xs text-content-secondary mt-1">
                        Help us improve by sharing usage statistics (no personal data)
                      </p>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-surface-secondary rounded-lg">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={user.settings?.shareAchievements ?? false}
                      onChange={(e) => handlePrivacyToggle('shareAchievements', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium text-content-primary">Share achievements</span>
                      <p className="text-xs text-content-secondary mt-1">
                        Allow friends to see when you unlock new badges and achievements
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <SettingsSection
                title="Sessions & Security"
                description="Manage your active sessions"
              />

              <div className="p-3 bg-surface-secondary rounded-lg mb-3 text-sm text-content-secondary">
                <p className="font-medium mb-1">Current Session</p>
                <p className="text-xs">Browser • {new Date().toLocaleDateString()}</p>
              </div>

              <Button variant="secondary" className="w-full sm:w-auto">
                Sign Out All Other Sessions
              </Button>
            </div>
          )}

          {/* Theme Settings */}
          {activeTab === 'theme' && (
            <div>
              <SettingsSection
                title="Appearance Mode"
                description="Choose light, dark, or follow system preference"
              />

              <div className="grid grid-cols-3 gap-3 mb-6">
                {THEME_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleThemeModeChange(mode.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-center',
                      themeMode === mode.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                        : 'border-border hover:border-gray-300'
                    )}
                  >
                    <div className="text-2xl mb-2">{mode.icon}</div>
                    <p className="text-sm font-medium text-content-primary">{mode.name}</p>
                  </button>
                ))}
              </div>

              <SettingsSection
                title="Color Theme"
                description="Choose a color scheme for the application. Click to preview, then confirm or cancel."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {COLOR_THEMES.map((theme) => {
                  const isCurrentTheme = originalTheme === null ? colorTheme === theme.id : originalTheme === theme.id
                  const isPreviewing = previewTheme === theme.id
                  return (
                    <button
                      key={theme.id}
                      onClick={() => startPreview(theme.id)}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3',
                        isPreviewing
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 ring-2 ring-brand-500/50'
                          : isCurrentTheme
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                            : 'border-border hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      <ThemePreviewThumbnail theme={theme} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-content-primary">{theme.name}</p>
                          {isCurrentTheme && !isPreviewing && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
                              Current
                            </span>
                          )}
                          {isPreviewing && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                              Previewing
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-content-secondary mt-0.5">{theme.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {previewTheme !== null && (
                <div className="flex items-center gap-3 p-3 mb-6 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Previewing: {COLOR_THEMES.find((t) => t.id === previewTheme)?.name}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Apply this theme or cancel to revert
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={cancelPreview}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={confirmPreview}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Apply
                    </Button>
                  </div>
                </div>
              )}

              <SettingsSection
                title="Accent Color"
                description="Customize the primary accent color"
              />

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-6">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() =>
                      updateUser({
                        ...user,
                        settings: {
                          ...user.settings,
                          accentColor: color.value,
                        },
                      })
                    }
                    className={cn(
                      'h-12 w-12 rounded-lg border-2 transition-all flex items-center justify-center',
                      user.settings?.accentColor === color.value
                        ? 'border-gray-900 dark:border-white'
                        : 'border-transparent hover:border-gray-400 dark:hover:border-gray-500'
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {user.settings?.accentColor === color.value && (
                      <span className="text-white text-lg">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <SettingsSection
                title="Accessibility"
                description="Enhanced readability options for dyslexia support"
              />

              <div className="p-4 bg-surface-secondary rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={dyslexiaEnabled}
                    onChange={() => toggleDyslexiaFont()}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-medium text-content-primary">
                      Dyslexia-friendly font (OpenDyslexic)
                    </span>
                    <p className="text-xs text-content-secondary mt-1">
                      Use OpenDyslexic font designed to improve readability for people with dyslexia
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-surface-primary rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-content-primary mb-2">Delete Account?</h2>
            <p className="text-content-secondary mb-4">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button onClick={() => setIsDeleteModalOpen(false)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleDeleteAccount} variant="danger">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
