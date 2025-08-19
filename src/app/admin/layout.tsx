import AdminGate from '../../components/admin/AdminGate'
import Link from 'next/link'
import { Route } from 'next'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const nav = [
    { href: '/admin/products' as const, label: '商品' },
    { href: '/admin/categories' as const, label: '分類' },
    { href: '/admin/news' as const, label: '新聞' },
    { href: '/admin/coupons' as const, label: '優惠券' },
    { href: '/admin/tables' as const, label: '桌位' },
  ]
  return (
    <AdminGate>
      <div className="container py-6 space-y-6">
        <div className="card">
          <div className="flex gap-3 flex-wrap">
            {nav.map(n => <Link key={n.href} className="px-3 py-2 rounded border hover:bg-gray-50" href={n.href as Route}>{n.label}</Link>)}
          </div>
        </div>
        {children}
      </div>
    </AdminGate>
  )
}
