'use client'
import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart'

export default function DebugRefreshPage() {
  const { items, count, currency, isLoaded } = useCart()
  const [localStorageData, setLocalStorageData] = useState<any>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cartData = localStorage.getItem('kodomo_cart_v1')
      const ctxData = localStorage.getItem('kodomo_order_ctx_v1')
      
      setLocalStorageData({
        cart: cartData ? JSON.parse(cartData) : null,
        ctx: ctxData ? JSON.parse(ctxData) : null,
      })
    }
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">刷新调试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* useCart Hook 数据 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">当前购物车状态</h2>
          <div className="space-y-2 text-sm">
            <p><strong>isLoaded:</strong> {String(isLoaded)}</p>
            <p><strong>商品数量:</strong> {count}</p>
            <p><strong>货币类型:</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-xs">
              {currency}
            </pre>
            <p><strong>商品列表:</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-auto">
              {JSON.stringify(items, null, 2)}
            </pre>
          </div>
        </div>

        {/* localStorage 数据 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">localStorage 数据</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>购物车数据:</strong>
              <pre className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-auto">
                {JSON.stringify(localStorageData.cart, null, 2)}
              </pre>
            </div>
            
            <div>
              <strong>订单上下文数据:</strong>
              <pre className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-auto">
                {JSON.stringify(localStorageData.ctx, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800">使用说明：</h3>
        <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
          <li>先访问 QR 页面添加商品</li>
          <li>然后访问这个页面查看状态</li>
          <li>刷新这个页面，看数据是否保持</li>
          <li>再次访问 QR 页面，看是否丢失数据</li>
        </ol>
      </div>
    </div>
  )
}
