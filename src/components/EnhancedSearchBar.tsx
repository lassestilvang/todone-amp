import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Save } from 'lucide-react'
import { useFilterStore } from '@/store/filterStore'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/cn'

interface EnhancedSearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  className?: string
  placeholder?: string
  debounceDelay?: number
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  className,
  placeholder = 'Filter tasks (e.g., priority:p1 due:today)',
  debounceDelay = 300,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveLabel, setSaveLabel] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filterStore = useFilterStore()
  const debouncedValue = useDebounce(value, debounceDelay)

  // Get suggestions from debounced value
  useEffect(() => {
    if (debouncedValue.length > 0) {
      const newSuggestions = filterStore.getSuggestions(debouncedValue)
      setSuggestions(newSuggestions.slice(0, 8))
      setSelectedIndex(-1)
      setIsOpen(true)
    } else {
      setSuggestions(filterStore.getRecentQueries().slice(0, 5))
      setIsOpen(true)
    }
  }, [debouncedValue, filterStore])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((i) => (i < suggestions.length - 1 ? i + 1 : i))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((i) => (i > 0 ? i - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          const selected = suggestions[selectedIndex]
          onChange(selected)
          onSearch(selected)
          filterStore.addRecentQuery(selected)
          setIsOpen(false)
        } else {
          onSearch(value)
          filterStore.addRecentQuery(value)
          setIsOpen(false)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    onSearch(suggestion)
    filterStore.addRecentQuery(suggestion)
    setIsOpen(false)
  }

  const handleSave = () => {
    if (value.trim() && saveLabel.trim()) {
      filterStore.saveQuery(value, saveLabel)
      setShowSaveDialog(false)
      setSaveLabel('')
    }
  }

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-content-tertiary" />
        <input
           id="search-bar"
           ref={inputRef}
           type="text"
           value={value}
           onChange={(e) => onChange(e.target.value)}
           onKeyDown={handleKeyDown}
           onFocus={() => setIsOpen(true)}
           placeholder={placeholder}
           className="w-full rounded-lg border border-border bg-surface-primary py-2 pl-10 pr-20 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
         />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
          {value && (
            <button
              onClick={() => onChange('')}
              className="p-1 text-content-tertiary hover:text-content-secondary"
              title="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {value && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="p-1 text-content-tertiary hover:text-content-secondary"
              title="Save query"
            >
              <Save className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full z-10 mt-1 w-full rounded-lg border border-border bg-surface-primary shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'w-full border-b border-border px-4 py-2 text-left text-sm last:border-b-0 transition',
                index === selectedIndex
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-content-secondary hover:bg-surface-tertiary'
              )}
            >
              <code className="text-xs font-mono">{suggestion}</code>
            </button>
          ))}
        </div>
      )}

      {/* Save query dialog */}
      {showSaveDialog && (
        <div className="absolute top-full z-20 mt-1 w-full rounded-lg border border-border bg-surface-primary p-3 shadow-lg">
          <input
            type="text"
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
            placeholder="Label for this query"
            className="mb-2 w-full rounded border border-border px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 rounded bg-blue-600 px-2 py-1 text-sm text-white hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false)
                setSaveLabel('')
              }}
              className="flex-1 rounded border border-border px-2 py-1 text-sm hover:bg-surface-tertiary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
