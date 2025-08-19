import { APP_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabaseClient'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import FilterableGrid from '@/components/menu/FilterableGrid'

async function getCategories() {
  if (APP_MODE === 'SUPABASE') {
    // 服务端直接使用 Admin 客户端读取，避免 RLS/匿名策略影响，也避免相对 URL fetch 在 SSR 报错
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id,name_zh,name_en,sort_order,is_active')
      .order('sort_order', { ascending: true })
    if (error) throw error
    const onlyActive = process.env.NEXT_PUBLIC_SHOW_ONLY_ACTIVE_CATEGORIES === 'true'
    return (data || []).filter(c => !onlyActive || c.is_active)
  }
  // MOCK 模式
  const categoriesMock = (await import('@/data/mock/categories.json')).default
  return categoriesMock as any
}

async function getProducts() {
  if (APP_MODE === 'SUPABASE') {
    // 使用 Admin 客户端读取，避免 RLS/匿名策略影响
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id,category_id,name_zh,name_en,desc_zh,desc_en,price_cents,image_url,is_active,is_sold_out,sku')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }
  // MOCK 模式
  const productsMock = (await import('@/data/mock/products.json')).default
  return productsMock as any
}

export default async function MenuPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">菜單 / Menu</h1>
      <FilterableGrid categories={categories} products={products} />
    </div>
  )
}
