import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const { code, subtotal_cents } = await req.json()
    if (!code) return NextResponse.json({ error: 'missing code' }, { status: 400 })
    const subtotal = Number(subtotal_cents) || 0

    const { data: c } = await supabaseAdmin
      .from('coupons')
      .select('id,code,type,value,min_spend_cents,starts_at,ends_at,is_active')
      .eq('code', code)
      .maybeSingle()

    if (!c || !c.is_active) return NextResponse.json({ valid:false, reason: 'not found' })
    const now = Date.now()
    if (c.starts_at && now < new Date(c.starts_at).getTime()) return NextResponse.json({ valid:false, reason: 'not started' })
    if (c.ends_at && now > new Date(c.ends_at).getTime()) return NextResponse.json({ valid:false, reason: 'expired' })
    if ((c.min_spend_cents||0) > subtotal) return NextResponse.json({ valid:false, reason: 'min spend' })

    let discount = 0
    if (c.type === 'percent') discount = Math.floor(subtotal * (c.value/100))
    else if (c.type === 'fixed' || c.type === 'gift') discount = Math.min(subtotal, c.value)

    return NextResponse.json({ valid:true, couponId: c.id, discount_cents: discount })
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'validate error' }, { status: 500 })
  }
}
