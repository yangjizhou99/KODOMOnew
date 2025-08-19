'use client'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import CategoryBar from '@/components/menu/CategoryBar'
import ProductCard from '@/components/ProductCard'
import productsMock from '@/data/mock/products.json'
import categoriesMock from '@/data/mock/categories.json'
import { APP_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabaseClient'

type Category = { id: string; name_zh: string; name_en: string; sort_order: number; is_active: boolean }
type Product = { id: string; category_id: string; name_zh: string; name_en: string; desc_zh: string; desc_en: string; price_cents: number; image_url?: string|null; is_sold_out?: boolean }

export default function QRPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const sp = useSearchParams()
  const lang = (sp.get('lang') === 'en' ? 'en' : 'zh-TW') as 'zh-TW'|'en'

  const { setCtx, ctx, isLoaded } = useCart()
  const [tableName, setTableName] = useState<string>('—')
  const [fulfillment, setFulfillment] = useState<'dine_in'|'takeout'>('dine_in')

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [cat, setCat] = useState<'all'|string>('all')
  const [soldOutMap, setSoldOutMap] = useState<Record<string, boolean>>({})

  // 1) 绑定桌位会话
  useEffect(() => {
    // 调试：追踪useEffect触发
    console.log('[QRPage] useEffect triggered:', { 
      token, 
      isLoaded, 
      ctxChannel: ctx.channel,
      ctxTableId: ctx.tableId
    })
    
    // 如果已经是QR模式且tableId正确，只需要获取桌位名称，不需要重新设置上下文
    if (ctx.channel === 'qr' && ctx.tableId) {
      console.log('[QRPage] Already in QR mode with tableId, only fetching table name')
      async function fetchTableName() {
        try {
          const res = await fetch('/api/qr/session', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ token }) })
          const json = await res.json()
          if (res.ok && json.table?.name) {
            setTableName(json.table.name)
          }
        } catch (e) {
          console.error('[QRPage] Error fetching table name:', e)
        }
      }
      fetchTableName()
      return
    }
    
    // 等待购物车加载完成后再设置上下文
    if (!isLoaded) {
      console.log('[QRPage] Cart not loaded yet, waiting...')
      return
    }
    
    async function bind() {
      console.log('[QRPage] Starting bind process...')
      const res = await fetch('/api/qr/session', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ token }) })
      const json = await res.json()
      if (!res.ok) { alert(json.error || '無效的桌位'); router.replace('/'); return }
      setTableName(json.table?.name || 'Table')
      
      console.log('[QRPage] About to setCtx:', { 
        currentCtx: JSON.stringify(ctx),
        newValues: JSON.stringify({ channel: 'qr', tableId: json.table?.id || null })
      })
      
      // 更新下单上下文 - 只更新QR相关字段，保持其他字段
      setCtx({ 
        channel: 'qr', 
        tableId: json.table?.id || null 
        // 不设置 fulfillment，让它保持现有值或使用默认值
      })
    }
    bind()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isLoaded])

  // 2) 拉取分类与商品
  useEffect(() => {
    console.log('[QRPage] 商品加载useEffect执行:', { APP_MODE, supabase: !!supabase })
    async function load() {
      if (APP_MODE === 'SUPABASE') {
        if (!supabase) return
        const { data: cats } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true })
        const { data: prods } = await supabase.from('products').select('*').eq('is_active', true)
        setCategories(cats || [])
        setProducts(prods || [])
        const soldOutMap = Object.fromEntries((prods||[]).map(p => [p.id, !!p.is_sold_out]))
        setSoldOutMap(soldOutMap)
        
        // 调试：查看售罄商品
        const soldOutProducts = (prods || []).filter(p => p.is_sold_out)
        console.log('[QRPage] 加载商品数据:', {
          totalProducts: prods?.length || 0,
          soldOutProducts: soldOutProducts.map(p => ({ id: p.id, name: p.name_zh, isSoldOut: p.is_sold_out })),
          soldOutMap
        })
      } else {
        console.log('[QRPage] 使用MOCK数据:', { categoriesMock, productsMock })
        setCategories(categoriesMock as any)
        setProducts(productsMock as any)
        setSoldOutMap({})
      }
    }
    load()
  }, [])

  // 3) Realtime 订阅 products 的售罄状态
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
    setCtx({ fulfillment })
  }, [fulfillment])

  const list = useMemo(() => cat === 'all' ? products : products.filter(p => p.category_id === cat), [cat, products])

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
        </div>
      </div>

      {/* Filter + Grid */}
      <CategoryBar categories={categories as any} onChange={setCat} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((p) => (
          <ProductCard key={p.id} p={p as any} lang={lang} soldOut={!!soldOutMap[p.id]} />
        ))}
      </div>
    </div>
  )
}
