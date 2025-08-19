'use client'
import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart'

export default function CartDebugPage() {
  const cart = useCart()
  const [logs, setLogs] = useState<string[]>([])
  const [localStorageSnapshots, setLocalStorageSnapshots] = useState<any[]>([])

  // 监控购物车状态变化
  useEffect(() => {
    const log = `[${new Date().toLocaleTimeString()}] Cart state - isLoaded: ${cart.isLoaded}, items: ${cart.count}, ctx: ${JSON.stringify(cart.ctx)}`
    setLogs(prev => [...prev, log])
  }, [cart.isLoaded, cart.count, cart.ctx])

  // 定期检查localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const cartData = localStorage.getItem('kodomo_cart_v1')
        const ctxData = localStorage.getItem('kodomo_order_ctx_v1')
        
        const snapshot = {
          timestamp: new Date().toLocaleTimeString(),
          cart: cartData ? JSON.parse(cartData) : null,
          ctx: ctxData ? JSON.parse(ctxData) : null,
        }
        
        setLocalStorageSnapshots(prev => {
          const newSnapshots = [...prev, snapshot]
          // 只保留最近10个快照
          return newSnapshots.slice(-10)
        })
      }
    }, 2000) // 每2秒检查一次

    return () => clearInterval(interval)
  }, [])

  const addTestItem = () => {
    cart.add({
      id: 'test-' + Date.now(),
      name_zh: '测试商品',
      name_en: 'Test Item',
      price_cents: 1000,
      image_url: null,
      sku: null
    }, 1)
  }

  const clearCart = () => {
    cart.clear()
  }

  const clearLogs = () => {
    setLogs([])
    setLocalStorageSnapshots([])
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">购物车调试工具</h1>
      
      {/* 控制按钮 */}
      <div className="mb-6 space-x-4">
        <button onClick={addTestItem} className="px-4 py-2 bg-blue-500 text-white rounded">
          添加测试商品
        </button>
        <button onClick={clearCart} className="px-4 py-2 bg-red-500 text-white rounded">
          清空购物车
        </button>
        <button onClick={clearLogs} className="px-4 py-2 bg-gray-500 text-white rounded">
          清空日志
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 当前状态 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">当前购物车状态</h2>
          <div className="space-y-2 text-sm">
            <p><strong>isLoaded:</strong> {String(cart.isLoaded)}</p>
            <p><strong>商品数量:</strong> {cart.count}</p>
            <p><strong>总价:</strong> ¥{(cart.subtotal_cents / 100).toFixed(2)}</p>
            <p><strong>购物车打开:</strong> {String(cart.open)}</p>
            
            <div className="mt-3">
              <strong>上下文:</strong>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
                {JSON.stringify(cart.ctx, null, 2)}
              </pre>
            </div>
            
            <div className="mt-3">
              <strong>商品列表:</strong>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-1 max-h-40 overflow-auto">
                {JSON.stringify(cart.items, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* 状态变化日志 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">状态变化日志</h2>
          <div className="text-xs space-y-1 max-h-96 overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="p-1 bg-gray-50 rounded">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* localStorage快照 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">localStorage 快照</h2>
          <div className="text-xs space-y-2 max-h-96 overflow-auto">
            {localStorageSnapshots.map((snapshot, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <div className="font-semibold">{snapshot.timestamp}</div>
                <div className="mt-1">
                  <div>商品: {snapshot.cart?.length || 0}个</div>
                  <div>上下文: {JSON.stringify(snapshot.ctx)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800">调试步骤：</h3>
        <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
          <li>点击"添加测试商品"</li>
          <li>观察状态变化日志和localStorage快照</li>
          <li>访问 QR 页面: <a href="/qr/table_a01" className="underline">/qr/table_a01</a></li>
          <li>返回这个页面，看数据是否还在</li>
          <li>刷新这个页面，观察数据恢复过程</li>
        </ol>
      </div>
    </div>
  )
}
