import { cn } from '@/lib/utils'

export default function Section({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <section className={cn('container my-8', className)} {...props} />
}
