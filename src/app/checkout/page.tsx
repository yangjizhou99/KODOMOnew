'use client'
import { useCart } from '@/lib/cart'
import { formatMoney } from '@/lib/format'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Checkout() {
  const { items, subtotal_cents, currency, clear } = useCart()
  const [pay, setPay] = useState<'transfer'|'card'|'store'>('store')
  const [note, setNote] = useState('')
  const [code, setCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [fulfillment, setFulfillment] = useState<'dine_in'|'takeout'>('dine_in')

  const validateCode = async () => {
    if (!code) { setDiscount(0); return }
    const res = await fetch('/api/coupons/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code, subtotal_cents }) })
    const json = await res.json()
    if (!json.valid) { setDiscount(0); alert('優惠券無效或未達門檻'); return }
    setDiscount(json.discount_cents || 0)
  }

  const total = Math.max(0, subtotal_cents - discount)

  const placeOrder = async () => {
    if (items.length === 0) return alert('購物車是空的')
    
    if (!supabase) {
      alert('系統配置錯誤，請聯繫管理員')
      return
    }
    
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
      },
      body: JSON.stringify({
        items: items.map(i => ({ id: i.id, qty: i.qty })),
        payment: pay, 
        notes: note, 
        channel: 'web', // Default to web channel
        fulfillment: fulfillment,
        couponCode: code || undefined
      })
    })
    const json = await res.json()
    if (!res.ok) return alert(json.error || '下單失敗')
    clear()
    alert(`下單成功，訂單編號：${json.orderId}`)
  }

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">結帳 / Checkout</h1>
        
        {/* 商品列表 */}
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <div className="font-medium">{item.name_zh}</div>
                <div className="text-sm text-gray-600">x{item.qty}</div>
              </div>
              <div className="font-mono">{formatMoney(item.qty * item.price_cents, currency)}</div>
            </div>
          ))}
        </div>

        {/* 取餐方式 */}
        <div className="mt-4">
          <label className="text-sm font-medium">取餐方式</label>
          <select 
            className="border rounded-xl w-full px-3 py-2 mt-1"
            value={fulfillment}
            onChange={e => setFulfillment(e.target.value as 'dine_in'|'takeout')}
          >
            <option value="dine_in">內用</option>
            <option value="takeout">外帶</option>
          </select>
        </div>

        {/* 支付方式 */}
        <div className="mt-4">
          <label className="text-sm font-medium">支付方式</label>
          <select 
            className="border rounded-xl w-full px-3 py-2 mt-1"
            value={pay}
            onChange={e => setPay(e.target.value as 'transfer'|'card'|'store')}
          >
            <option value="store">到店付款</option>
            <option value="card">信用卡（占位）</option>
            <option value="transfer">線上轉帳（占位）</option>
          </select>
        </div>

        {/* 优惠券 */}
        <div className="mt-4">
          <label className="text-sm font-medium">優惠券代碼</label>
          <div className="flex gap-2 mt-1">
            <input className="border rounded-xl px-3 py-2 flex-1" value={code} onChange={e=>setCode(e.target.value.trim())} placeholder="輸入代碼..." />
            <button className="btn btn-outline" onClick={validateCode}>套用</button>
          </div>
        </div>

        {/* 备注 */}
        <div className="mt-4">
          <label className="text-sm font-medium">備註 / Notes</label>
          <textarea className="border rounded-xl w-full px-3 py-2 mt-1" rows={3} value={note} onChange={e=>setNote(e.target.value)} />
        </div>
      </div>

      <aside className="card h-max">
        <div className="font-semibold mb-2">訂單摘要</div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-600">小計</span>
          <span className="font-semibold">{formatMoney(subtotal_cents, currency)}</span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-600">折扣</span>
          <span className="font-semibold">- {formatMoney(discount, currency)}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-800">合計</span>
          <span className="text-lg font-bold">{formatMoney(total, currency)}</span>
        </div>

        <button className="btn btn-primary w-full mt-4" onClick={placeOrder} disabled={items.length===0}>
          提交訂單
        </button>
      </aside>
    </div>
  )
}
