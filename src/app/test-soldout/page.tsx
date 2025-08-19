'use client'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name_zh: string
  name_en: string
  is_sold_out: boolean
}

export default function TestSoldOutPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  // 获取商品售罄状态
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/test-soldout')
      const data = await res.json()
      if (data.products) {
        setProducts(data.products)
      }
    } catch (e) {
      console.error('获取商品数据失败:', e)
    } finally {
      setLoading(false)
    }
  }

  // 切换售罄状态
  const toggleSoldOut = async (productId: string, currentStatus: boolean) => {
    setUpdating(productId)
    try {
      const res = await fetch('/api/test-soldout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          isSoldOut: !currentStatus 
        })
      })
      
      const data = await res.json()
      if (data.success) {
        // 更新本地状态
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, is_sold_out: !currentStatus }
            : p
        ))
        alert(data.message)
      } else {
        alert('更新失败: ' + data.error)
      }
    } catch (e) {
      console.error('更新售罄状态失败:', e)
      alert('更新失败')
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">售罄状态测试</h1>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">售罄状态测试工具</h1>
      
      <div className="mb-6">
        <button 
          onClick={fetchProducts}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          刷新数据
        </button>
        <a 
          href="/qr/table_a01" 
          target="_blank"
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 inline-block"
        >
          打开扫码点餐页面测试
        </a>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            商品列表 (售罄: {products.filter(p => p.is_sold_out).length}/{products.length})
          </h2>
        </div>
        
        <div className="divide-y">
          {products.map(product => (
            <div key={product.id} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{product.name_zh}</h3>
                <p className="text-sm text-gray-600">{product.name_en}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded text-sm ${
                  product.is_sold_out 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {product.is_sold_out ? '售罄' : '有货'}
                </span>
                
                <button
                  onClick={() => toggleSoldOut(product.id, product.is_sold_out)}
                  disabled={updating === product.id}
                  className={`px-3 py-1 rounded text-sm ${
                    product.is_sold_out
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  } disabled:opacity-50`}
                >
                  {updating === product.id 
                    ? '更新中...' 
                    : product.is_sold_out 
                      ? '恢复供应' 
                      : '设为售罄'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">测试步骤：</h3>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>点击某个商品的"设为售罄"按钮</li>
          <li>打开扫码点餐页面，查看该商品是否显示为售罄状态</li>
          <li>尝试添加售罄商品到购物车，按钮应该被禁用</li>
          <li>点击"恢复供应"，查看状态是否实时更新</li>
        </ol>
      </div>
    </div>
  )
}
