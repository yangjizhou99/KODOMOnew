'use client'
import { cn } from '@/lib/utils'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}
export default function Button({ className, variant='primary', size='md', ...props }: Props) {
  const variantCls = {
    primary: 'btn btn-primary',
    outline: 'btn btn-outline',
    ghost: 'btn border-transparent hover:bg-gray-100'
  }[variant]
  const sizeCls = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10',
    lg: 'h-12 text-lg'
  }[size]
  return <button className={cn(variantCls, sizeCls, className)} {...props} />
}
