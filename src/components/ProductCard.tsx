'use client'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { useCart } from '@/lib/cart'
import { formatMoney } from '@/lib/format'

export default function ProductCard({ p, lang = 'zh-TW' }: { p: Product; lang?: 'zh-TW' | 'en' }) {
  const name = lang === 'en' ? p.name_en : p.name_zh
  const desc = lang === 'en' ? p.desc_en : p.desc_zh
  const { add } = useCart()
  return (
    <div className="card">
      <div className="aspect-video relative bg-gray-100 rounded-xl overflow-hidden">
        {p.image_url ? (
          <Image fill alt={name} src={p.image_url} className="object-cover" />
        ) : (
          <div className="w-full h-full grid place-content-center text-gray-400">No Image</div>
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{name}</h3>
          <div className="font-mono">{formatMoney(p.price_cents, 'JPY')}</div>
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{desc}</p>
        <button
          className="btn btn-primary mt-3 w-full"
          onClick={() => add({
            id: p.id, name_zh: p.name_zh, name_en: p.name_en,
            price_cents: p.price_cents, image_url: p.image_url || null, sku: p.sku || null
          }, 1)}
        >
          加入購物車
        </button>
      </div>
    </div>
  )
}
