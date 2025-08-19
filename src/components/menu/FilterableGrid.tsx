'use client'
import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
import CategoryBar from '@/components/menu/CategoryBar'

interface FilterableGridProps {
  categories: any[]
  products: any[]
}

export default function FilterableGrid({ categories, products }: FilterableGridProps) {
  const [cat, setCat] = useState<'all'|string>('all')
  const list = cat === 'all' ? products : products.filter(p => p.category_id === cat)
  
  // 调试信息
  console.log('FilterableGrid调试:', {
    selectedCategory: cat,
    totalProducts: products?.length,
    filteredProducts: list?.length,
    categories: categories,
    products: products,
    filteredList: list
  })
  
  return (
    <div>
      <CategoryBar categories={categories} onChange={setCat} />
      <div className="mb-4 text-sm text-gray-500">
        {cat === 'all' 
          ? `显示所有产品 (${list?.length || 0})`
          : `分类筛选: ${categories?.find(c => c.id === cat)?.name_zh || cat} (${list?.length || 0})`
        }
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((p: any) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  )
}
