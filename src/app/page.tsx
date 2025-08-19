import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="card">
        <h1 className="text-2xl font-bold">Kodomo 2.0</h1>
        <p className="text-gray-600">Brand banner / Promotions</p>
        <div className="mt-4 flex gap-3">
          <Link href="/menu" className="btn btn-primary">線上購物 / Shop</Link>
          <Link href="/qr/demo-table" className="btn">掃碼點餐 / QR Order</Link>
          <Link href="/member" className="btn">會員儲值 / Wallet</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-2">最新消息 News</h2>
          <ul className="list-disc ml-5 text-sm">
            <li>新品上市：唐揚雞套餐</li>
            <li>中秋優惠 9/1–9/15</li>
          </ul>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-2">快速入口 Quick Actions</h2>
          <ul className="list-disc ml-5 text-sm">
            <li><Link className="link" href="/menu">查看菜單</Link></li>
            <li><Link className="link" href="/checkout">前往結帳</Link></li>
          </ul>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-2">Map & Social</h2>
          <p className="text-sm text-gray-600">Google Map 佔位</p>
        </div>
      </section>
    </div>
  )
}
