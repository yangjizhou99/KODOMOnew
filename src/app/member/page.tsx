'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatMoney } from '@/lib/format'

type Ledger = { id:string; amount_cents:number; type:string; created_at:string; ref?:string|null }
type Coupon = { id:string; code:string; title_zh:string|null; title_en:string|null; desc_zh:string|null; desc_en:string|null; ends_at:string|null }
type PointLog = { id:string; delta_points:number; reason:string|null; created_at:string }

export default function MemberPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [balance, setBalance] = useState(0)
  const [ledger, setLedger] = useState<Ledger[]>([])
  const [points, setPoints] = useState(0)
  const [pointsLogs, setPointsLogs] = useState<PointLog[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return }
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) { setLoading(false); return }
      // 钱包
      const { data: w } = await supabase.from('wallet_accounts').select('balance_cents').eq('member_id', user.id).maybeSingle()
      setBalance(w?.balance_cents || 0)
      const { data: wl } = await supabase.from('wallet_ledger').select('id,amount_cents,type,created_at,ref').eq('member_id', user.id).order('created_at', { ascending: false }).limit(10)
      setLedger(wl || [])
      // 积分
      const { data: pa } = await supabase.from('points_accounts').select('points').eq('member_id', user.id).maybeSingle()
      setPoints(pa?.points || 0)
      const { data: pl } = await supabase.from('points_ledger').select('id,delta_points,reason,created_at').eq('member_id', user.id).order('created_at', { ascending:false }).limit(10)
      setPointsLogs(pl || [])
      // 优惠券（仅显示当前有效）
      const { data: cs } = await supabase
        .from('coupons')
        .select('id,code,title_zh,title_en,desc_zh,desc_en,ends_at')
        .eq('is_active', true)
        .order('ends_at', { ascending: true })
        .limit(10)
      setCoupons(cs || [])
      setLoading(false)
    })()
  }, [])

  const [amount, setAmount] = useState('1000') // JPY
  const [method, setMethod] = useState<'store'|'card'|'transfer'>('store')
  const topup = async () => {
    try {
      if (!user) return location.href='/auth'
      if (!supabase) { alert('系統未初始化'); return }
      const cents = Math.max(0, Math.round(Number(amount))) * 100
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ amount_cents: cents, method })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'topup failed')
      setBalance(json.balance_cents)
      // 重新拉取最新流水
      const { data: wl } = await supabase.from('wallet_ledger').select('id,amount_cents,type,created_at,ref').eq('member_id', user.id).order('created_at', { ascending: false }).limit(10)
      setLedger(wl || [])
      alert('儲值成功')
    } catch (e:any) {
      alert(e.message)
    }
  }

  if (loading) return <div className="card">載入中…</div>
  if (!user) return <div className="card">尚未登入。請前往 <a className="link" href="/auth">登入 / 註冊</a></div>

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* 左：钱包 */}
      <div className="card lg:col-span-2">
        <h2 className="text-xl font-semibold">錢包 / Wallet</h2>
        <div className="mt-2 text-3xl font-bold">{formatMoney(balance, 'JPY')}</div>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <input className="border rounded-xl px-3 py-2" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="金額 (JPY)" />
          <select className="border rounded-xl px-3 py-2" value={method} onChange={e=>setMethod(e.target.value as any)}>
            <option value="store">到店付款</option>
            <option value="card">信用卡（占位）</option>
            <option value="transfer">線上轉帳（占位）</option>
          </select>
          <button className="btn btn-primary" onClick={topup}>儲值</button>
        </div>
        <div className="mt-6">
          <div className="font-semibold mb-2">最近儲值 / 消費（10 筆）</div>
          <ul className="space-y-2">
            {ledger.map(l => (
              <li key={l.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{new Date(l.created_at).toLocaleString()}</span>
                <span className="font-mono">{l.type} {l.amount_cents >=0 ? '+' : ''}{formatMoney(l.amount_cents, 'JPY')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 右：积分 + 优惠券 */}
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold">積分 / Points</h2>
          <div className="mt-2 text-3xl font-bold">{points}</div>
          <div className="mt-3">
            <div className="font-semibold mb-2 text-sm">最近積分變動</div>
            <ul className="space-y-1 text-sm">
              {pointsLogs.map(p => (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="text-gray-600">{new Date(p.created_at).toLocaleDateString()}</span>
                  <span className="font-mono">{p.delta_points>0?'+':''}{p.delta_points}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold">我的優惠券 / Coupons</h2>
          <ul className="mt-3 space-y-2">
            {coupons.map(c => (
              <li key={c.id} className="rounded-2xl border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{c.title_zh || c.title_en || c.code}</div>
                    <div className="text-xs text-gray-600">Code: {c.code}</div>
                  </div>
                  {c.ends_at && <div className="text-xs text-gray-500">至 {new Date(c.ends_at).toLocaleDateString()}</div>}
                </div>
              </li>
            ))}
          </ul>
          <div className="text-xs text-gray-500 mt-2">在結帳頁輸入代碼可套用折扣。</div>
        </div>
      </div>
    </div>
  )
}
