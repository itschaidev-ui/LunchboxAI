'use client'

import { useState, useEffect, useRef } from 'react'
import { CommandAction } from '@/lib/commands/actions'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  actions: CommandAction[]
}

export default function CommandPalette({ isOpen, onClose, actions }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter actions based on query
  const filteredActions = actions.filter(action =>
    action.title.toLowerCase().includes(query.toLowerCase()) ||
    action.description.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  )

  // Group actions by category
  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = []
    }
    acc[action.category].push(action)
    return acc
  }, {} as Record<string, CommandAction[]>)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredActions[selectedIndex]) {
            filteredActions[selectedIndex].action()
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredActions, onClose])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  let currentIndex = 0

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-xl max-w-2xl w-full mx-4 shadow-2xl border border-orange-200/50">
        {/* Search Input */}
        <div className="p-4 border-b border-orange-200/50">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-gray-800 placeholder-gray-500 text-lg outline-none"
            />
            <div className="absolute right-0 top-0 flex items-center h-full">
              <kbd className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-300">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Actions List */}
        <div className="max-h-96 overflow-y-auto">
          {Object.keys(groupedActions).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>No commands found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            Object.entries(groupedActions).map(([category, categoryActions]) => (
              <div key={category}>
                <div className="px-4 py-2 bg-orange-50/50 text-xs font-semibold text-orange-700 uppercase tracking-wide border-b border-orange-200/30">
                  {category}
                </div>
                {categoryActions.map((action) => {
                  const isSelected = currentIndex === selectedIndex
                  currentIndex++
                  
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.action()
                        onClose()
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-orange-50/50 transition-colors flex items-center space-x-3 ${
                        isSelected ? 'bg-orange-100/50' : ''
                      }`}
                    >
                      <div className="text-xl">{action.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">
                          {action.title}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {action.description}
                        </div>
                      </div>
                      {action.shortcut && (
                        <div className="flex space-x-1">
                          {action.shortcut.split('+').map((key, index) => (
                            <kbd
                              key={index}
                              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-300"
                            >
                              {key.trim()}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-orange-200/50 bg-gray-50/50 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex space-x-4">
              <span className="flex items-center space-x-1">
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">↑↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">↵</kbd>
                <span>Select</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd>
                <span>Close</span>
              </span>
            </div>
            <div className="text-gray-400">
              {filteredActions.length} command{filteredActions.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
