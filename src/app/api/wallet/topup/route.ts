import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const { amount_cents, method } = await req.json()
    const amt = Number(amount_cents)
    if (!Number.isFinite(amt) || amt <= 0) return NextResponse.json({ error: 'invalid amount' }, { status: 400 })

    // 取用户（从 Authorization: Bearer <token>）
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i,'') || ''
    const { data: { user }, error: aerr } = await supabaseAdmin.auth.getUser(token)
    if (aerr || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    // 读取旧余额
    const { data: acc } = await supabaseAdmin.from('wallet_accounts').select('balance_cents').eq('member_id', user.id).maybeSingle()
    const old = acc?.balance_cents ?? 0
    const next = old + amt

    // 记账 + 更新余额（简单起见分两步；生产可用 SQL 函数包事务）
    const { error: e1 } = await supabaseAdmin.from('wallet_ledger').insert({
      member_id: user.id, type: 'topup', amount_cents: amt, ref: method || 'topup'
    })
    if (e1) throw e1

    const { error: e2 } = await supabaseAdmin.from('wallet_accounts')
      .upsert({ member_id: user.id, balance_cents: next, currency: 'JPY' }, { onConflict: 'member_id' })
    if (e2) throw e2

    return NextResponse.json({ ok: true, balance_cents: next })
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'topup error' }, { status: 500 })
  }
}
