'use client'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../lib/cart'

export default function CartButton() {
  const { count, setOpen, isLoaded } = useCart()
  return (
    <button onClick={() => setOpen(true)} className="relative ml-2 border rounded-xl px-3 h-9 flex items-center">
      <ShoppingCart className="w-4 h-4 mr-1" />
      <span>Cart</span>
      {isLoaded && count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs rounded-full bg-black text-white grid place-content-center px-1">
          {count}
        </span>
      )}
    </button>
  )
}
