import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { APP_MODE } from '@/lib/config'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Item = { id: string; qty: number }

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const items: Item[] = (body.items || []).map((x: any) => ({ id: x.id, qty: Number(x.qty) || 1 }))
    if (!items.length) return NextResponse.json({ error: 'empty items' }, { status: 400 })

    const payment: 'transfer' | 'card' | 'store' = body.payment || 'store'
    const notes: string = body.notes || ''

    // 读取 QR 会话
    const qr = cookies().get('qr_session')?.value
    let channel: 'web' | 'qr' = body.channel === 'qr' || qr ? 'qr' : 'web'
    let table_id: string | null = null
    if (qr) {
      try { table_id = JSON.parse(qr).table_id || null } catch {}
    }

    if (APP_MODE !== 'SUPABASE') {
      // MOCK：直接返回 demo 编号
      return NextResponse.json({ ok: true, orderId: 'MOCK-' + Math.random().toString(36).slice(2, 8) })
    }

    // 1) 服务器端核价（防止前端乱改价）
    const ids = items.map(i => i.id)
    const { data: prods, error: e1 } = await supabaseAdmin
      .from('products')
      .select('id, price_cents, is_sold_out')
      .in('id', ids)
    if (e1) throw e1
    if (!prods || prods.length !== ids.length) return NextResponse.json({ error: 'some items missing' }, { status: 400 })
    if (prods.some(p => p.is_sold_out)) return NextResponse.json({ error: 'contains sold-out items' }, { status: 400 })

    const priceMap = Object.fromEntries(prods.map(p => [p.id, p.price_cents]))
    const subtotal = items.reduce((a, b) => a + (priceMap[b.id] * b.qty), 0)
    const { data: order, error: e2 } = await supabaseAdmin
      .from('orders')
      .insert({
        channel, table_id, status: 'pending', fulfillment: body.fulfillment || 'dine_in',
        subtotal_cents: subtotal, discount_cents: 0, total_cents: subtotal, currency: 'JPY',
        notes
      })
      .select('id')
      .single()
    if (e2) throw e2

    const lines = items.map(i => ({
      order_id: order.id, product_id: i.id,
      qty: i.qty, unit_price_cents: priceMap[i.id],
      options_json: {}, line_total_cents: i.qty * priceMap[i.id]
    }))
    const { error: e3 } = await supabaseAdmin.from('order_items').insert(lines)
    if (e3) throw e3

    return NextResponse.json({ ok: true, orderId: order.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'create order error' }, { status: 500 })
  }
}
