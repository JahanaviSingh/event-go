import { useEffect } from 'react'

export const useKeypress = (keys: string[], callback: () => void) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (keys.includes(event.key.toLowerCase())) {
        callback()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [keys, callback])
}
