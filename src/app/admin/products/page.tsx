'use client'
import CrudTable, { type Field } from '../../../components/admin/CrudTable'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminProductsPage() {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  useEffect(() => {
    (async () => {
      if (!supabase) return
      const { data } = await supabase.from('categories').select('id,name_zh,name_en').eq('is_active', true).order('sort_order')
      setOptions((data||[]).map(c => ({ value: c.id, label: c.name_zh || c.name_en })))
    })()
  }, [])
  const columns: Field[] = [
    { key: 'name_zh', label: '名稱(中)', type: 'text', required: true },
    { key: 'name_en', label: '名稱(英)', type: 'text', required: true },
    { key: 'category_id', label: '分類', type: 'select', options, required: true },
    { key: 'price_cents', label: '價格(分)', type: 'number', required: true },
    { key: 'sku', label: 'SKU', type: 'text' },
    { key: 'image_url', label: '圖片URL', type: 'text' },
    { key: 'is_active', label: '上架', type: 'boolean' },
    { key: 'is_sold_out', label: '售罄', type: 'boolean' },
  ]
  return (
    <CrudTable
      entity="products"
      columns={columns}
      createDefaults={{ is_active: true, is_sold_out: false, price_cents: 0 }}
      extraHint={<span className="text-xs">價格單位為「分」；圖片請填可公開訪問的 URL。</span>}
    />
  )
}
