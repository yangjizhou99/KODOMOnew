'use client'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import CategoryBar from '@/components/menu/CategoryBar'
import ProductCard from '@/components/ProductCard'
import { APP_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabaseClient'
import CrudTable, { type Field } from '../../../components/admin/CrudTable'

type Category = { id: string; name_zh: string; name_en: string; sort_order: number; is_active: boolean }
type Product = { id: string; category_id: string; name_zh: string; name_en: string; desc_zh: string; desc_en: string; price_cents: number; image_url?: string|null; is_sold_out?: boolean }

export default function AdminTablesPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const lang = (sp.get('lang') === 'en' ? 'en' : 'zh-TW') as 'zh-TW'|'en'
  const demoMode = sp.get('demo') === 'true'

  const { isLoaded } = useCart()
  const [tableName, setTableName] = useState<string>('Demo Table')
  const [fulfillment, setFulfillment] = useState<'dine_in'|'takeout'>('dine_in')
  const [orderContext, setOrderContext] = useState<{channel: string, tableId: string | null}>({
    channel: 'qr',
    tableId: 'demo'
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [cat, setCat] = useState<'all'|string>('all')
  const [soldOutMap, setSoldOutMap] = useState<Record<string, boolean>>({})
  const [showOrdering, setShowOrdering] = useState(false)

  // 管理表格的列定义
  const columns: Field[] = [
    { key: 'name', label: '桌位名稱', type: 'text', required: true },
    { key: 'qrcode_token', label: 'QR Token', type: 'text', required: true },
    { key: 'location', label: '位置', type: 'text' },
  ]

  // 加载商品数据
  useEffect(() => {
    console.log('[AdminTablesPage] 商品加载useEffect执行:', { APP_MODE, supabase: !!supabase })
    async function load() {
      if (APP_MODE === 'SUPABASE') {
        if (!supabase) return
        // 通过后端接口由服务端使用 Admin 权限读取全量分类，避免 RLS/匿名策略影响
        const catsRes = await fetch('/api/public/categories', { cache: 'no-store' })
        const catsJson = catsRes.ok ? await catsRes.json() : { items: [] }
        const cats = catsJson.items as Category[]
        const onlyActive = process.env.NEXT_PUBLIC_SHOW_ONLY_ACTIVE_CATEGORIES === 'true'
        const catsFiltered = (cats || []).filter(c => !onlyActive || c.is_active)
        const { data: prods } = await supabase.from('products').select('*').eq('is_active', true)
        setCategories(catsFiltered as any)
        setProducts(prods || [])
        const soldOutMap = Object.fromEntries((prods||[]).map(p => [p.id, !!p.is_sold_out]))
        setSoldOutMap(soldOutMap)
      } else {
        // MOCK 模式按需动态导入，避免在 SUPABASE 模式下静态引用本地数据
        const [cats, prods] = await Promise.all([
          import('@/data/mock/categories.json').then(m => m.default),
          import('@/data/mock/products.json').then(m => m.default)
        ])
        console.log('[AdminTablesPage] 使用MOCK数据:', { catsLen: cats.length, prodsLen: prods.length })
        setCategories(cats as any)
        setProducts(prods as any)
        setSoldOutMap({})
      }
    }
    load()
  }, [])

  // Realtime 订阅 products 的售罄状态
  useEffect(() => {
    if (APP_MODE !== 'SUPABASE' || !supabase) return
    const channel = supabase
      // @ts-ignore supabase-js v2 realtime
      .channel('products-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, payload => {
        const p = payload.new as Product
        setSoldOutMap(prev => ({ ...prev, [p.id]: !!p.is_sold_out }))
      })
      .subscribe()
    return () => { supabase?.removeChannel(channel) }
  }, [])

  useEffect(() => {
    // 保存fulfillment到localStorage
    if (typeof window !== 'undefined') {
      const existingCtx = localStorage.getItem('kodomo_order_ctx_v1')
      const ctx = existingCtx ? JSON.parse(existingCtx) : {}
      localStorage.setItem('kodomo_order_ctx_v1', JSON.stringify({
        ...ctx,
        fulfillment
      }))
    }
  }, [fulfillment])

  const list = useMemo(() => cat === 'all' ? products : products.filter(p => p.category_id === cat), [cat, products])

  // 如果显示点餐界面
  if (showOrdering) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="card flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-gray-600">{lang==='en'?'Table':'桌位'}</div>
            <div className="text-xl font-bold">{tableName}</div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm">{lang==='en'?'Fulfillment':'取餐方式'}</label>
            <select
              className="border rounded-xl h-10 px-3"
              value={fulfillment}
              onChange={e => setFulfillment(e.target.value as any)}
            >
              <option value="dine_in">{lang==='en'?'Dine-in':'內用'}</option>
              <option value="takeout">{lang==='en'?'Takeout':'外帶'}</option>
            </select>
            <Link href={`/checkout?lang=${lang}`} className="btn btn-outline">
              {lang==='en'?'Go to Checkout':'前往結帳'}
            </Link>
            <button 
              onClick={() => setShowOrdering(false)} 
              className="btn btn-secondary"
            >
              {lang==='en'?'Back to Admin':'返回管理'}
            </button>
          </div>
        </div>

        {/* Filter + Grid */}
        <CategoryBar categories={categories as any} onChange={setCat} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => (
            <ProductCard key={p.id} p={p as any} lang={lang} />
          ))}
        </div>
      </div>
    )
  }

  // 管理界面
  return (
    <div className="space-y-6">
      {/* 扫码点餐演示按钮 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">扫码点餐演示 / QR Order Demo</h2>
        <div className="flex gap-3 mb-4">
          <button 
            onClick={() => setShowOrdering(true)} 
            className="btn btn-primary"
          >
            {lang==='en'?'Start Demo Ordering':'開始演示點餐'}
          </button>
          <Link 
            href="/qr/demo-table?lang=zh-TW" 
            className="btn btn-outline"
            target="_blank"
          >
            {lang==='en'?'View Demo Page':'查看演示頁面'}
          </Link>
        </div>
        <p className="text-sm text-gray-600">
          点击上方按钮可以在此页面体验真正的扫码点餐功能，包括商品浏览、购物车和结账流程。
        </p>
      </div>

      {/* 原有的表格管理功能 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">桌位管理 / Table Management</h2>
        <CrudTable
          entity="tables"
          columns={columns}
          createDefaults={{}}
          extraHint={<span className="text-xs">QR Token 將用於生成掃碼網址：/qr/[token]</span>}
          renderRowActions={(row:any)=> (
            <>
              <Link className="text-green-600 mr-3" href={`/qr/${encodeURIComponent(row.qrcode_token)}`} target="_blank">打開點餐頁</Link>
              <Link className="text-blue-600 mr-3" href={`/api/qr/code/${encodeURIComponent(row.qrcode_token)}?mode=home&fmt=png`} target="_blank">QR(Home)</Link>
              <Link className="text-blue-600" href={`/api/qr/code/${encodeURIComponent(row.qrcode_token)}?mode=direct&fmt=png`} target="_blank">QR(Direct)</Link>
            </>
          )}
        />
      </div>
    </div>
  )
}
