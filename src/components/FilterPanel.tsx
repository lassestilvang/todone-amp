import { useState } from 'react'
import { Plus, X, Star, Zap } from 'lucide-react'
import { useFilterStore } from '@/store/filterStore'
import { useLabelStore } from '@/store/labelStore'
import { useProjectStore } from '@/store/projectStore'
import { AdvancedFilterBuilder } from '@/components/AdvancedFilterBuilder'
import { FilterTemplates } from '@/components/FilterTemplates'
import { cn } from '@/utils/cn'
import { logger } from '@/utils/logger'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onAdvancedQueryChange?: (query: string) => void
}

type FilterCondition = 'label' | 'priority' | 'dueDate' | 'project' | 'completed' | 'search'

interface FilterRule {
  id: string
  condition: FilterCondition
  operator: 'is' | 'is_not' | 'contains' | 'before' | 'after'
  value: string
}

export function FilterPanel({ isOpen, onClose, onAdvancedQueryChange }: FilterPanelProps) {
  const filters = useFilterStore((state) => state.filters)
  const activeFilterId = useFilterStore((state) => state.activeFilterId)
  const createFilter = useFilterStore((state) => state.createFilter)
  const deleteFilter = useFilterStore((state) => state.deleteFilter)
  const setActiveFilter = useFilterStore((state) => state.setActiveFilter)
  const toggleFilterFavorite = useFilterStore((state) => state.toggleFilterFavorite)

  const labels = useLabelStore((state) => state.labels)
  const projects = useProjectStore((state) => state.projects)

  const [filterName, setFilterName] = useState('')
  const [filterRules, setFilterRules] = useState<FilterRule[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [showAdvancedBuilder, setShowAdvancedBuilder] = useState(false)
  const [advancedQuery, setAdvancedQuery] = useState('')

  const handleAddRule = () => {
    setFilterRules([
      ...filterRules,
      {
        id: `rule-${Date.now()}`,
        condition: 'label',
        operator: 'is',
        value: '',
      },
    ])
  }

  const handleRemoveRule = (ruleId: string) => {
    setFilterRules(filterRules.filter((r) => r.id !== ruleId))
  }

  const handleCreateFilter = async () => {
    if (!filterName.trim()) return

    try {
      await createFilter({
        name: filterName,
        query: JSON.stringify(filterRules),
        isFavorite: false,
        ownerId: 'current-user',
        viewType: 'list',
      })
      setFilterName('')
      setFilterRules([])
      setIsCreating(false)
    } catch (error) {
      logger.error('Failed to create filter:', error)
    }
  }

  const handleApplyFilter = (filterId: string) => {
    setActiveFilter(filterId)
  }

  const handleFavoriteToggle = (filterId: string) => {
    toggleFilterFavorite(filterId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex">
      {/* Overlay */}
      <div className="flex-1" onClick={onClose} />

      {/* Panel */}
      <div className="w-96 bg-surface-primary shadow-lg overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-surface-primary">
          <h2 className="text-lg font-bold text-content-primary">Filters</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-tertiary rounded transition-colors"
            title="Close"
          >
            <X size={20} className="text-content-tertiary" />
          </button>
        </div>

        {/* Content */}
        <div className="divide-y divide-border">
          {/* Create New Filter */}
          {!isCreating && !showAdvancedBuilder && (
            <div className="space-y-2 px-6 py-4 border-b border-border">
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-4 py-2 flex items-center gap-2 text-content-secondary hover:bg-surface-tertiary rounded transition-colors font-medium text-sm"
              >
                <Plus size={16} className="text-brand-600" />
                Create Simple Filter
              </button>
              <button
                onClick={() => setShowAdvancedBuilder(true)}
                className="w-full px-4 py-2 flex items-center gap-2 text-content-secondary hover:bg-surface-tertiary rounded transition-colors font-medium text-sm"
              >
                <Zap size={16} className="text-amber-500" />
                Advanced Syntax
              </button>
            </div>
          )}

          {/* Filter Creation Form */}
          {isCreating && (
            <div className="px-6 py-4 space-y-4 bg-surface-secondary">
              {/* Filter Name */}
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">
                  Filter Name
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="e.g., Urgent Tasks"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Rules */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-content-secondary">Rules</label>
                {filterRules.length === 0 ? (
                  <p className="text-sm text-content-tertiary">No rules added yet</p>
                ) : (
                  filterRules.map((rule) => (
                    <div key={rule.id} className="bg-surface-primary p-3 rounded border border-border space-y-2">
                      <div className="flex gap-2">
                        <select
                          value={rule.condition}
                          onChange={(e) => {
                            setFilterRules(
                              filterRules.map((r) =>
                                r.id === rule.id
                                  ? { ...r, condition: e.target.value as FilterCondition }
                                  : r
                              )
                            )
                          }}
                          className="flex-1 text-sm px-2 py-1 border border-border rounded"
                        >
                          <option value="label">Label</option>
                          <option value="priority">Priority</option>
                          <option value="dueDate">Due Date</option>
                          <option value="project">Project</option>
                          <option value="completed">Completed</option>
                          <option value="search">Search</option>
                        </select>

                        <button
                          onClick={() => handleRemoveRule(rule.id)}
                          className="p-1 text-content-tertiary hover:text-icon-error hover:bg-semantic-error-light rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Operator and Value */}
                      <div className="flex gap-2">
                        <select
                          value={rule.operator}
                          onChange={(e) => {
                            setFilterRules(
                              filterRules.map((r) =>
                                r.id === rule.id
                                  ? { ...r, operator: e.target.value as FilterRule['operator'] }
                                  : r
                              )
                            )
                          }}
                          className="w-24 text-sm px-2 py-1 border border-border rounded"
                        >
                          <option value="is">is</option>
                          <option value="is_not">is not</option>
                          <option value="contains">contains</option>
                          <option value="before">before</option>
                          <option value="after">after</option>
                        </select>

                        {/* Value Field */}
                        {rule.condition === 'label' && (
                          <select
                            value={rule.value}
                            onChange={(e) => {
                              setFilterRules(
                                filterRules.map((r) =>
                                  r.id === rule.id ? { ...r, value: e.target.value } : r
                                )
                              )
                            }}
                            className="flex-1 text-sm px-2 py-1 border border-border rounded"
                          >
                            <option value="">Select label</option>
                            {labels.map((label) => (
                              <option key={label.id} value={label.id}>
                                {label.name}
                              </option>
                            ))}
                          </select>
                        )}

                        {rule.condition === 'priority' && (
                          <select
                            value={rule.value}
                            onChange={(e) => {
                              setFilterRules(
                                filterRules.map((r) =>
                                  r.id === rule.id ? { ...r, value: e.target.value } : r
                                )
                              )
                            }}
                            className="flex-1 text-sm px-2 py-1 border border-border rounded"
                          >
                            <option value="">Select priority</option>
                            <option value="p1">P1 - Urgent</option>
                            <option value="p2">P2 - High</option>
                            <option value="p3">P3 - Medium</option>
                            <option value="p4">P4 - Low</option>
                          </select>
                        )}

                        {rule.condition === 'project' && (
                          <select
                            value={rule.value}
                            onChange={(e) => {
                              setFilterRules(
                                filterRules.map((r) =>
                                  r.id === rule.id ? { ...r, value: e.target.value } : r
                                )
                              )
                            }}
                            className="flex-1 text-sm px-2 py-1 border border-border rounded"
                          >
                            <option value="">Select project</option>
                            {projects.map((project) => (
                              <option key={project.id} value={project.id}>
                                {project.name}
                              </option>
                            ))}
                          </select>
                        )}

                        {rule.condition === 'search' && (
                          <input
                            type="text"
                            value={rule.value}
                            onChange={(e) => {
                              setFilterRules(
                                filterRules.map((r) =>
                                  r.id === rule.id ? { ...r, value: e.target.value } : r
                                )
                              )
                            }}
                            placeholder="Search text"
                            className="flex-1 text-sm px-2 py-1 border border-border rounded"
                          />
                        )}

                        {rule.condition === 'dueDate' && (
                          <input
                            type="date"
                            value={rule.value}
                            onChange={(e) => {
                              setFilterRules(
                                filterRules.map((r) =>
                                  r.id === rule.id ? { ...r, value: e.target.value } : r
                                )
                              )
                            }}
                            className="flex-1 text-sm px-2 py-1 border border-border rounded"
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}

                <button
                  onClick={handleAddRule}
                  className="w-full py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded border border-brand-200 transition-colors"
                >
                  + Add Rule
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFilter}
                  disabled={!filterName.trim()}
                  className="flex-1 px-3 py-2 bg-brand-600 text-white font-medium rounded hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setFilterName('')
                    setFilterRules([])
                  }}
                  className="flex-1 px-3 py-2 text-content-secondary border border-border font-medium rounded hover:bg-surface-tertiary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Saved Filters */}
          {filters.length > 0 && (
            <div className="divide-y divide-border">
              <div className="px-6 py-3 bg-surface-secondary text-xs font-semibold text-content-secondary uppercase tracking-wider">
                Saved Filters ({filters.length})
              </div>

              {filters.map((filter) => (
                <div
                  key={filter.id}
                  className={cn(
                    'px-6 py-3 flex items-center justify-between hover:bg-surface-tertiary transition-colors cursor-pointer',
                    activeFilterId === filter.id && 'bg-brand-50 border-l-4 border-brand-600'
                  )}
                  onClick={() => handleApplyFilter(filter.id)}
                >
                  <div>
                    <div className="font-medium text-content-primary">{filter.name}</div>
                    <div className="text-xs text-content-tertiary mt-1">
                      {JSON.parse(filter.query).length} rule(s)
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFavoriteToggle(filter.id)
                    }}
                    className={cn(
                      'p-1 rounded transition-colors',
                      filter.isFavorite
                        ? 'text-amber-500 hover:bg-amber-50'
                        : 'text-content-tertiary hover:text-amber-500 hover:bg-surface-tertiary'
                    )}
                  >
                    <Star size={16} fill={filter.isFavorite ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFilter(filter.id)
                    }}
                    className="p-1 text-content-tertiary hover:text-icon-error hover:bg-semantic-error-light rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Advanced Filter Builder */}
          {showAdvancedBuilder && (
            <div className="px-6 py-4 space-y-4 bg-surface-secondary">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-content-primary">Advanced Filter Query</h3>
                <button
                  onClick={() => {
                    setShowAdvancedBuilder(false)
                    setAdvancedQuery('')
                  }}
                  className="p-1 text-content-tertiary hover:text-content-secondary rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <AdvancedFilterBuilder
                initialQuery={advancedQuery}
                onApply={(query) => {
                  setAdvancedQuery(query)
                  setShowAdvancedBuilder(false)
                  onAdvancedQueryChange?.(query)
                }}
                onCancel={() => {
                  setShowAdvancedBuilder(false)
                  setAdvancedQuery('')
                }}
              />

              <FilterTemplates onSelect={setAdvancedQuery} />
            </div>
          )}

          {/* Display Active Advanced Filter */}
          {advancedQuery && !showAdvancedBuilder && (
            <div className="px-6 py-3 bg-brand-50 border-b border-brand-200">
              <div className="text-xs font-semibold text-brand-900 mb-1">ACTIVE QUERY</div>
              <div className="text-sm font-mono text-brand-800 break-words">{advancedQuery}</div>
              <button
                onClick={() => {
                  setAdvancedQuery('')
                  onAdvancedQueryChange?.('')
                }}
                className="mt-2 text-xs text-brand-600 hover:text-brand-900 font-medium"
              >
                Clear Query
              </button>
            </div>
          )}

          {/* Favorites Section */}
          {filters.some((f) => f.isFavorite) && (
            <div className="divide-y divide-border">
              <div className="px-6 py-3 bg-surface-secondary text-xs font-semibold text-content-secondary uppercase tracking-wider">
                Favorite Filters
              </div>

              {filters
                .filter((f) => f.isFavorite)
                .map((filter) => (
                  <div
                    key={`fav-${filter.id}`}
                    onClick={() => handleApplyFilter(filter.id)}
                    className={cn(
                      'px-6 py-3 flex items-center gap-2 hover:bg-surface-tertiary transition-colors cursor-pointer',
                      activeFilterId === filter.id && 'bg-brand-50'
                    )}
                  >
                    <Star size={14} className="text-amber-500" fill="currentColor" />
                    <span className="font-medium text-content-primary">{filter.name}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
