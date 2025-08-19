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
  
  return (
    <div>
      <CategoryBar categories={categories} onChange={setCat} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((p: any) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  )
}
