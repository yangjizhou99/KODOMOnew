'use client'
import { useState } from 'react'

type Category = { id: string; name_zh: string; name_en: string; sort_order: number; is_active: boolean }

export default function CategoryBar({ categories, onChange }:{
  categories: Category[]
  onChange: (categoryId: string | 'all') => void
}) {
  const [act, setAct] = useState<'all'|string>('all')
  const tabs = [{ id: 'all', name_zh: '全部', name_en: 'All' }, ...categories]
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tabs.map((c:any) => {
        const active = act === c.id
        return (
          <button
            key={c.id}
            onClick={() => { setAct(c.id); onChange(c.id) }}
            className={`px-3 h-9 rounded-xl border ${active ? 'bg-black text-white border-black' : 'bg-white hover:bg-gray-50'}`}
          >
            {c.name_zh || c.name_en}
          </button>
        )
      })}
    </div>
  )
}
