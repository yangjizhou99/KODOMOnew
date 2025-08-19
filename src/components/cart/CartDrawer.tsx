'use client'
import { useCart } from '../../lib/cart'
import { formatMoney } from '../../lib/format'
import { X, Plus, Minus, Trash } from 'lucide-react'
import Link from 'next/link'

export default function CartDrawer() {
  const { open, setOpen, items, currency, subtotal_cents, updateQty, remove, isLoaded } = useCart()

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">購物車</div>
          <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-160px)]">
          {!isLoaded ? (
            <div className="text-center text-gray-600 py-12">載入中...</div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-600 py-12">購物車是空的</div>
          ) : items.map(it => (
            <div key={it.id} className="grid grid-cols-[64px_1fr_auto] gap-3 items-center">
              <div className="w-16 h-16 rounded-xl bg-gray-100 grid place-content-center overflow-hidden">
                {it.image_url ? <img src={it.image_url} className="object-cover w-full h-full" /> : <span className="text-xs text-gray-500">No Image</span>}
              </div>
              <div>
                <div className="font-medium">{it.name_zh}</div>
                <div className="text-sm text-gray-600">{formatMoney(it.price_cents, currency)}</div>
                <div className="mt-2 inline-flex items-center border rounded-xl">
                  <button className="px-2 py-1" onClick={() => updateQty(it.id, it.qty - 1)}><Minus className="w-4 h-4" /></button>
                  <span className="px-3 select-none">{it.qty}</span>
                  <button className="px-2 py-1" onClick={() => updateQty(it.id, it.qty + 1)}><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono">{formatMoney(it.qty * it.price_cents, currency)}</div>
                <button className="text-xs text-red-600 mt-2 inline-flex items-center" onClick={() => remove(it.id)}><Trash className="w-3 h-3 mr-1" /> 移除</button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">小計</span>
            <span className="font-semibold">{formatMoney(subtotal_cents, currency)}</span>
          </div>
          <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-primary w-full">前往結帳</Link>
        </div>
      </aside>
    </div>
  )
}
