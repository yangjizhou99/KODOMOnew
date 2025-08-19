import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

function isValidEmail(s?: string) {
  if (!s) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message, website } = await req.json()

    // 1) 蜜罐：有填就认为是机器人，直接"成功"但丢弃
    if (website && String(website).trim().length > 0) {
      return NextResponse.json({ ok: true, id: null, bot: true })
    }

    // 2) 简易节流：20 秒内只允许提交一次
    const c = cookies()
    const last = c.get('contact_last')?.value
    if (last && Date.now() - Number(last) < 20_000) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    // 3) 校验（Email 可选，但如果填了必须合法；留言要有内容）
    const nameStr = String(name || '').trim()
    const messageStr = String(message || '').trim()
    if (!nameStr) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (email && !isValidEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    if (!messageStr || messageStr.length < 5) {
      return NextResponse.json({ error: 'Message is too short' }, { status: 400 })
    }

    // 4) 可选：记录来源 IP / UA（仅存 ref 字段或扩展表结构时使用）
    const ua = headers().get('user-agent') || ''
    const ip = headers().get('x-forwarded-for') || ''

    // 5) 入库（RLS 已允许匿名插入，但这里用 service role 以便后续扩展）
    const { error, data } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        name: nameStr,
        email: email || null,
        phone: phone || null,
        subject: (subject || '').toString().slice(0, 120),
        message: messageStr
      })
      .select('id')
      .single()

    if (error) throw error

    // 6) 设置节流 Cookie（20 秒）
    const res = NextResponse.json({ ok: true, id: data?.id })
    res.cookies.set('contact_last', String(Date.now()), {
      httpOnly: true, sameSite: 'lax', maxAge: 20, path: '/'
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'contact error' }, { status: 500 })
  }
}
