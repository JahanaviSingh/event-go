import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useReducer, useRef, useState } from 'react'

export const useDialogState = (defaultState = false) => {
  const [open, setOpen] = useState(defaultState)
  const pathname = usePathname()
  const initialPathname = useRef(pathname)

  useEffect(() => {
    if (pathname !== initialPathname.current) {
      setOpen(false)
      initialPathname.current = pathname
    }
  }, [pathname, open])

  return [open, setOpen] as const
}
