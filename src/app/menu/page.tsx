import { APP_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabaseClient'
import productsMock from '@/data/mock/products.json'
import categoriesMock from '@/data/mock/categories.json'
import FilterableGrid from '@/components/menu/FilterableGrid'

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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching products:', error)
      return productsMock
    }
  }
  return productsMock
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
