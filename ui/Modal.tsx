'use client'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export default function Modal({ open, onClose, title, children, className }: Props) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-content-center p-4">
        <div className={cn('w-full max-w-md rounded-2xl bg-white shadow-soft', className)}>
          <div className="p-4 border-b font-semibold">{title}</div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
