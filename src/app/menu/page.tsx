import ProductCard from '@/components/ProductCard'
import { APP_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabaseClient'
import productsMock from '@/data/mock/products.json'

async function getProducts() {
  if (APP_MODE === 'SUPABASE') {
    const { data, error } = await supabase.from('products').select('*').eq('is_active', true)
    if (error) throw error
    return data
  }
  return productsMock
}

export default async function MenuPage() {
  const products = await getProducts()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">菜單 / Menu</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p: any) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  )
}
