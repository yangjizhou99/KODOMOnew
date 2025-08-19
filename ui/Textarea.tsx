'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none',
          'focus-visible:ring-2 focus-visible:ring-gray-300',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
export default Textarea
