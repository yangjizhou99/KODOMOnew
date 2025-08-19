'use client'
import { useEffect } from 'react'
import { useCart } from '@/lib/cart'
import Link from 'next/link'

export default function SimpleTestPage() {
  const { items, count, add, clear, currency, isLoaded } = useCart()

  // 监听localStorage变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('[SimpleTest] localStorage changed:', {
        key: e.key,
        oldValue: e.oldValue,
        newValue: e.newValue,
        url: e.url
      })
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const addTestItem = () => {
    const testItem = {
      id: 'test-' + Date.now(),
      name_zh: '测试商品',
      name_en: 'Test Item', 
      price_cents: 1000,
      image_url: null,
      sku: null
    }
    console.log('[SimpleTest] Adding item:', testItem)
    add(testItem, 1)
  }

  // 每次渲染时检查localStorage
  const actualCartData = typeof window !== 'undefined' ? localStorage.getItem('kodomo_cart_v1') : null
  const actualCtxData = typeof window !== 'undefined' ? localStorage.getItem('kodomo_order_ctx_v1') : null
  
  console.log('[SimpleTest] Render:', { 
    isLoaded, 
    count, 
    itemsLength: items.length, 
    currency,
    actualCartData,
    actualCtxData
  })

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">简单购物车测试</h1>
      
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">购物车状态</h2>
        <p>isLoaded: {String(isLoaded)}</p>
        <p>商品数量: {count}</p>
        <p>货币类型: {currency}</p>
        <p>localStorage上下文: {actualCtxData || '无'}</p>
      </div>

      <div className="space-x-4 mb-6">
        <button 
          onClick={addTestItem}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          添加测试商品
        </button>
        <button 
          onClick={clear}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          清空购物车
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">导航测试:</h3>
        <div className="space-x-4">
          <Link href="/qr/table_a01" className="text-blue-600 underline">
            QR页面
          </Link>
          <Link href="/cart-debug" className="text-blue-600 underline">
            调试页面
          </Link>
          <Link href="/menu" className="text-blue-600 underline">
            菜单页面
          </Link>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">商品列表:</h3>
        {items.length === 0 ? (
          <p className="text-gray-600">购物车为空</p>
        ) : (
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item.id} className="text-sm">
                {item.name_zh} x{item.qty} (¥{(item.price_cents / 100).toFixed(2)})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
