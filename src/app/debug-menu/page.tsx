import { APP_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabaseClient'
import productsMock from '@/data/mock/products.json'
import categoriesMock from '@/data/mock/categories.json'

async function getDebugInfo() {
  const debugInfo = {
    appMode: APP_MODE,
    supabaseConfigured: !!supabase,
    environment: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置'
    },
    mockData: {
      categories: categoriesMock.length,
      products: productsMock.length
    },
    databaseData: {
      categories: 0,
      products: 0,
      categoriesData: [],
      productsData: [],
      error: null as string | null
    }
  }

  // 如果配置了Supabase，尝试获取数据库数据
  if (supabase) {
    try {
      // 获取所有分类（包括未激活的）
      const { data: allCategories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      // 获取所有产品（包括未激活的）
      const { data: allProducts, error: prodError } = await supabase
        .from('products')
        .select('*')

      if (catError) {
        debugInfo.databaseData.error = catError.message
      } else {
        debugInfo.databaseData.categories = allCategories?.length || 0
        debugInfo.databaseData.categoriesData = allCategories || []
      }

      if (prodError) {
        debugInfo.databaseData.error = prodError.message
      } else {
        debugInfo.databaseData.products = allProducts?.length || 0
        debugInfo.databaseData.productsData = allProducts || []
      }

    } catch (error) {
      debugInfo.databaseData.error = error instanceof Error ? error.message : '未知错误'
    }
  }

  return debugInfo
}

export default async function DebugMenuPage() {
  const debugInfo = await getDebugInfo()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">菜单调试信息</h1>
      
      <div className="space-y-6">
        {/* 基本配置信息 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">配置信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">APP_MODE:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                debugInfo.appMode === 'SUPABASE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {debugInfo.appMode}
              </span>
            </div>
            <div>
              <span className="font-medium">Supabase配置:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                debugInfo.supabaseConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {debugInfo.supabaseConfigured ? '已配置' : '未配置'}
              </span>
            </div>
          </div>
          
          <div className="mt-3">
            <h3 className="font-medium mb-2">环境变量:</h3>
            <ul className="text-sm space-y-1">
              <li>SUPABASE_URL: {debugInfo.environment.supabaseUrl}</li>
              <li>SUPABASE_KEY: {debugInfo.environment.supabaseKey}</li>
            </ul>
          </div>
        </div>

        {/* Mock数据信息 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Mock数据</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>分类数量: {debugInfo.mockData.categories}</div>
            <div>产品数量: {debugInfo.mockData.products}</div>
          </div>
        </div>

        {/* 数据库数据信息 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">数据库数据</h2>
          
          {debugInfo.databaseData.error ? (
            <div className="text-red-600 mb-3">
              错误: {debugInfo.databaseData.error}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>分类数量: {debugInfo.databaseData.categories}</div>
              <div>产品数量: {debugInfo.databaseData.products}</div>
            </div>
          )}

          {/* 分类详情 */}
          {debugInfo.databaseData.categoriesData.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">分类详情:</h3>
              <div className="bg-white p-3 rounded border max-h-40 overflow-y-auto">
                {debugInfo.databaseData.categoriesData.map((cat: any) => (
                  <div key={cat.id} className="text-sm border-b pb-1 mb-1">
                    <span className="font-medium">{cat.name_zh}</span>
                    <span className="text-gray-500 ml-2">({cat.name_en})</span>
                    <span className={`ml-2 px-1 rounded text-xs ${
                      cat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {cat.is_active ? '激活' : '未激活'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 产品详情 */}
          {debugInfo.databaseData.productsData.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">产品详情:</h3>
              <div className="bg-white p-3 rounded border max-h-60 overflow-y-auto">
                {debugInfo.databaseData.productsData.map((prod: any) => (
                  <div key={prod.id} className="text-sm border-b pb-1 mb-1">
                    <span className="font-medium">{prod.name_zh}</span>
                    <span className="text-gray-500 ml-2">({prod.name_en})</span>
                    <span className="text-gray-400 ml-2">¥{(prod.price_cents / 100).toFixed(2)}</span>
                    <div className="flex gap-2 mt-1">
                      <span className={`px-1 rounded text-xs ${
                        prod.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {prod.is_active ? '激活' : '未激活'}
                      </span>
                      <span className={`px-1 rounded text-xs ${
                        prod.is_sold_out ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {prod.is_sold_out ? '售罄' : '有库存'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
