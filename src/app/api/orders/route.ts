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
    const fulfillment: 'dine_in'|'takeout' = body.fulfillment || 'dine_in'
    const couponCode: string | undefined = body.couponCode

    // 读取 QR 会话
    const qr = cookies().get('qr_session')?.value
    let channel: 'web' | 'qr' = body.channel === 'qr' || qr ? 'qr' : 'web'
    let table_id: string | null = null
    if (qr) { try { table_id = JSON.parse(qr).table_id || null } catch {} }

    // 获取登录用户（用于 member_id/积分/核销）
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i,'') || ''
    const { data: { user } } = token ? await supabaseAdmin.auth.getUser(token) : { data: { user: null } as any }
    const member_id = user?.id || null

    if (APP_MODE !== 'SUPABASE') {
      return NextResponse.json({ ok: true, orderId: 'MOCK-' + Math.random().toString(36).slice(2, 8) })
    }

    // 核价 + 售罄检查
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

    // 优惠券折扣
    let discount = 0
    let coupon_id: string | null = null
    if (couponCode) {
      const { data: c } = await supabaseAdmin
        .from('coupons')
        .select('id,code,type,value,min_spend_cents,starts_at,ends_at,is_active')
        .eq('code', couponCode)
        .maybeSingle()
      const ok =
        c && c.is_active &&
        (!c.starts_at || Date.now() >= new Date(c.starts_at).getTime()) &&
        (!c.ends_at || Date.now() <= new Date(c.ends_at).getTime()) &&
        ((c.min_spend_cents || 0) <= subtotal)
      if (ok) {
        coupon_id = c!.id
        if (c!.type === 'percent') discount = Math.floor(subtotal * (c!.value/100))
        else discount = Math.min(subtotal, c!.value)
      }
    }

    const total = Math.max(0, subtotal - discount)

    // 建订单
    const { data: order, error: e2 } = await supabaseAdmin
      .from('orders')
      .insert({
        channel, table_id, member_id, status: 'pending', fulfillment,
        subtotal_cents: subtotal, discount_cents: discount, total_cents: total, currency: 'JPY',
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

    // 核销记录（若有会员且有 coupon）
    if (member_id && coupon_id) {
      await supabaseAdmin.from('coupon_redemptions').insert({
        coupon_id, order_id: order.id, member_id
      })
    }

    // 下单积分：1 點 / 每 ¥100（四舍五入向下）
    if (member_id) {
      const pts = Math.floor(total / 10000) // 因为使用「分」做货币，¥100 = 10000
      if (pts > 0) {
        // 更新积分账户
        const { data: pa } = await supabaseAdmin.from('points_accounts').select('points').eq('member_id', member_id).maybeSingle()
        const next = (pa?.points || 0) + pts
        await supabaseAdmin.from('points_accounts').upsert({ member_id, points: next })
        await supabaseAdmin.from('points_ledger').insert({
          member_id, delta_points: pts, reason: 'order_reward', order_id: order.id
        })
      }
    }

    return NextResponse.json({ ok: true, orderId: order.id })
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? 'create order error' }, { status: 500 })
  }
}
