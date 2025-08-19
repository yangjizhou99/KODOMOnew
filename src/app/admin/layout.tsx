import AdminGate from '../../components/admin/AdminGate'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const nav: { href: string; label: string }[] = [
    { href: '/admin/products', label: '商品' },
    { href: '/admin/categories', label: '分類' },
    { href: '/admin/news', label: '新聞' },
    { href: '/admin/coupons', label: '優惠券' },
  ]
  return (
    <AdminGate>
      <div className="container py-6 space-y-6">
        <div className="card">
          <div className="flex gap-3 flex-wrap">
            {nav.map(n => <Link key={n.href} className="px-3 py-2 rounded border hover:bg-gray-50" href={n.href}>{n.label}</Link>)}
          </div>
        </div>
        {children}
      </div>
    </AdminGate>
  )
}
