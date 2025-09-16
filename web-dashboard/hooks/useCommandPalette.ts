'use client'

import { useState, useEffect, useCallback } from 'react'

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  const openCommandPalette = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeCommandPalette = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    openCommandPalette,
    closeCommandPalette
  }
}
