import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { requireStaffFromAuthHeader } from '../../../../lib/adminAuth'

const TABLES = {
  categories: { table: 'categories', fields: ['name_zh','name_en','sort_order','is_active'] },
  products: { table: 'products', fields: ['category_id','name_zh','name_en','desc_zh','desc_en','price_cents','image_url','is_active','is_sold_out','sku'] },
  news: { table: 'news_posts', fields: ['title_zh','title_en','excerpt_zh','excerpt_en','body_zh','body_en','cover_url','status','published_at'] },
  coupons: { table: 'coupons', fields: ['code','title_zh','title_en','desc_zh','desc_en','type','value','min_spend_cents','starts_at','ends_at','is_active'] },
} as const

export async function GET(req: Request, { params }: { params: { entity: string } }) {
  try {
    await requireStaffFromAuthHeader(req, 'staff')
    const meta = (TABLES as any)[params.entity]
    if (!meta) return NextResponse.json({ error: 'Unknown entity' }, { status: 400 })

    const url = new URL(req.url)
    const q = url.searchParams.get('q')?.trim() || ''
    const page = Math.max(1, Number(url.searchParams.get('page') || 1))
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || 20)))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let sel = supabaseAdmin.from(meta.table).select('*', { count: 'exact' })
    // 简易搜索：按常见字段匹配
    if (q) {
      const like = `%${q}%`
      if (meta.table === 'products') sel = sel.or(`name_zh.ilike.${like},name_en.ilike.${like},sku.ilike.${like}`)
      else if (meta.table === 'categories') sel = sel.or(`name_zh.ilike.${like},name_en.ilike.${like}`)
      else if (meta.table === 'news_posts') sel = sel.or(`title_zh.ilike.${like},title_en.ilike.${like}`)
      else if (meta.table === 'coupons') sel = sel.or(`code.ilike.${like},title_zh.ilike.${like},title_en.ilike.${like}`)
    }
    // 默认排序
    if (meta.table === 'categories') sel = sel.order('sort_order', { ascending: true })
    else if (meta.table === 'news_posts') sel = sel.order('published_at', { ascending: false })
    else if (meta.table === 'coupons') sel = sel.order('starts_at', { ascending: false })
    else sel = sel.order('created_at', { ascending: false })
    
    const { data, error, count } = await sel.range(from, to)
    if (error) throw error
    return NextResponse.json({ items: data || [], total: count || 0, page, pageSize })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'list error' }, { status: e.status || 500 })
  }
}

export async function POST(req: Request, { params }: { params: { entity: string } }) {
  try {
    await requireStaffFromAuthHeader(req, 'staff')
    const meta = (TABLES as any)[params.entity]
    if (!meta) return NextResponse.json({ error: 'Unknown entity' }, { status: 400 })
    const body = await req.json()
    const row: any = {}
    meta.fields.forEach((k: string) => { if (body[k] !== undefined) row[k] = body[k] })
    const { data, error } = await supabaseAdmin.from(meta.table).insert(row).select('*').single()
    if (error) throw error
    return NextResponse.json({ ok: true, item: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'create error' }, { status: e.status || 500 })
  }
}
