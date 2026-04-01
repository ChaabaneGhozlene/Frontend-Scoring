import { useState, useCallback } from 'react'

export interface Toast { msg: string; type: 'success' | 'error' }

/**
 * Hook partagé entre toutes les pages Settings.
 * Gère le toast local + helper notify().
 */
export function useSettingsPage() {
  const [toast, setToast] = useState<Toast | null>(null)

  const notify = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), type === 'error' ? 3500 : 3000)
  }, [])

  return { toast, setToast, notify }
}