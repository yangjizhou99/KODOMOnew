import { APP_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabaseClient'
import productsMock from '@/data/mock/products.json'
import categoriesMock from '@/data/mock/categories.json'
import FilterableGrid from '@/components/menu/FilterableGrid'
import { cache } from 'react'

async function getCategories() {
  if (APP_MODE === 'SUPABASE' && supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order',{ascending:true})
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching categories:', error)
      return categoriesMock
    }
  }
  return categoriesMock
}

async function getProducts() {
  if (APP_MODE === 'SUPABASE' && supabase) {
    try {
      // 获取所有激活的产品（包括售罄的），按创建时间排序
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      console.log('从数据库获取的产品:', data)
      return data
    } catch (error) {
      console.error('Error fetching products:', error)
      // 如果数据库查询失败，回退到获取所有产品
      try {
        const { data: allData, error: fallbackError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (fallbackError) throw fallbackError
        console.log('回退查询获取的所有产品:', allData)
        return allData
      } catch (fallbackError) {
        console.error('回退查询也失败:', fallbackError)
        return productsMock
      }
    }
  }
  return productsMock
}

// 添加动态渲染，禁用缓存
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MenuPage() {
  const startTime = Date.now()
  
  try {
    const [categories, products] = await Promise.all([getCategories(), getProducts()])
    const loadTime = Date.now() - startTime

    // 详细调试信息
    const debugInfo = {
      timestamp: new Date().toISOString(),
      loadTime: `${loadTime}ms`,
      appMode: APP_MODE,
      supabaseConfigured: !!supabase,
      categoriesCount: categories?.length || 0,
      productsCount: products?.length || 0,
      categories: categories,
      products: products,
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置'
      }
    }
    
    console.log('🔍 菜单页面调试信息:', debugInfo)

    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">菜單 / Menu</h1>
        
        {/* 详细状态信息 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="flex flex-wrap gap-4">
            <span>模式: <strong>{APP_MODE}</strong></span>
            <span>产品: <strong>{products?.length || 0}</strong></span>
            <span>分类: <strong>{categories?.length || 0}</strong></span>
            <span>加载时间: <strong>{loadTime}ms</strong></span>
            <span>时间: <strong>{new Date().toLocaleTimeString()}</strong></span>
          </div>
          
          {(!products || products.length === 0) && (
            <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded">
              ⚠️ 没有找到产品数据。请检查：
              <br />• 数据库连接是否正常
              <br />• 产品是否设置为 is_active = true
              <br />• 产品是否设置为 is_sold_out = false
            </div>
          )}
        </div>

        <FilterableGrid categories={categories} products={products} />
        
        {/* 调试链接 */}
        <div className="mt-8 p-4 border-t">
          <h3 className="font-medium mb-2">调试工具:</h3>
          <div className="flex gap-4 text-sm">
            <a href="/debug-menu" className="text-blue-600 hover:underline">
              📊 完整调试页面
            </a>
            <a href="/api/menu-debug" className="text-blue-600 hover:underline" target="_blank">
              🔍 API调试数据
            </a>
            <a href="/menu" className="text-blue-600 hover:underline">
              🔄 强制刷新
            </a>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('❌ 菜单页面加载错误:', error)
    
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">菜單 / Menu</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">加载错误</h2>
          <p className="text-red-600 mt-2">
            {error instanceof Error ? error.message : '未知错误'}
          </p>
          <div className="mt-4">
            <a href="/debug-menu" className="text-blue-600 hover:underline">
              前往调试页面查看详细信息
            </a>
          </div>
        </div>
      </div>
    )
  }
}
