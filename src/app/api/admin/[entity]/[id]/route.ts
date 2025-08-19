import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin'
import { requireStaffFromAuthHeader } from '../../../../../lib/adminAuth'

const TABLES = {
  categories: { table: 'categories', fields: ['name_zh','name_en','sort_order','is_active'] },
  products: { table: 'products', fields: ['category_id','name_zh','name_en','desc_zh','desc_en','price_cents','image_url','is_active','is_sold_out','sku'] },
  news: { table: 'news_posts', fields: ['title_zh','title_en','excerpt_zh','excerpt_en','body_zh','body_en','cover_url','status','published_at'] },
  coupons: { table: 'coupons', fields: ['code','title_zh','title_en','desc_zh','desc_en','type','value','min_spend_cents','starts_at','ends_at','is_active'] },
} as const

export async function PUT(req: Request, { params }: { params: { entity: string; id: string } }) {
  try {
    await requireStaffFromAuthHeader(req, 'staff')
    const meta = (TABLES as any)[params.entity]
    if (!meta) return NextResponse.json({ error: 'Unknown entity' }, { status: 400 })
    const body = await req.json()
    const row: any = {}
    meta.fields.forEach((k: string) => { if (body[k] !== undefined) row[k] = body[k] })
    const { data, error } = await supabaseAdmin.from(meta.table).update(row).eq('id', params.id).select('*').maybeSingle()
    if (error) throw error
    return NextResponse.json({ ok: true, item: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'update error' }, { status: e.status || 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { entity: string; id: string } }) {
  try {
    await requireStaffFromAuthHeader(req, 'staff')
    const meta = (TABLES as any)[params.entity]
    if (!meta) return NextResponse.json({ error: 'Unknown entity' }, { status: 400 })
    const { error } = await supabaseAdmin.from(meta.table).delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'delete error' }, { status: e.status || 500 })
  }
}
