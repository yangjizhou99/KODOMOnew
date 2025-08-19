import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { APP_MODE } from '@/lib/config'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: 'missing token' }, { status: 400 })



    let table: { id: string; name: string | null } | null = null

    if (APP_MODE === 'SUPABASE') {
      const { data, error } = await supabaseAdmin
        .from('tables')
        .select('id,name')
        .eq('qrcode_token', token)
        .maybeSingle()
      if (error) throw error
      if (!data) return NextResponse.json({ error: 'invalid token' }, { status: 404 })
      table = data
    } else {
      // MOCK：不查库，给个虚拟桌位
      table = { id: 'mock-table', name: 'Mock Table' }
    }

    // 绑定到 HttpOnly Cookie（2 小时）
    const payload = JSON.stringify({ table_id: table!.id, token })
    const res = NextResponse.json({ ok: true, table })
    res.cookies.set('qr_session', payload, {
      httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 2
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'session error' }, { status: 500 })
  }
}
