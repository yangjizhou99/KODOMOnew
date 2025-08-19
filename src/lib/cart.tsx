'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  id: string
  name_zh: string
  name_en: string
  price_cents: number
  image_url?: string | null
  qty: number
  sku?: string | null
}

type CartState = {
  items: CartItem[]
  currency: 'JPY'|'USD'
  open: boolean
  isLoaded: boolean
  setOpen: (v: boolean) => void
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  updateQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
  count: number
  subtotal_cents: number
}

const CartCtx = createContext<CartState | null>(null)
const KEY = 'kodomo_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const currency: 'JPY'|'USD' = 'JPY'

  // load from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (error) {
      console.warn('Failed to load cart from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])
  
  // persist to storage (only after initial load to avoid overwriting with empty array)
  useEffect(() => {
    if (!isLoaded) return
    
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch (error) {
      console.warn('Failed to save cart to localStorage:', error)
    }
  }, [items, isLoaded])

  const api: CartState = useMemo(() => {
    const add: CartState['add'] = (item, qty = 1) => {
      setItems(prev => {
        const i = prev.findIndex(x => x.id === item.id)
        if (i >= 0) {
          const next = [...prev]
          next[i] = { ...next[i], qty: next[i].qty + qty }
          return next
        }
        return [...prev, { ...item, qty }]
      })
      setOpen(true)
    }
    const updateQty: CartState['updateQty'] = (id, qty) => {
      setItems(prev => prev.map(x => x.id === id ? { ...x, qty: Math.max(1, qty) } : x))
    }
    const remove: CartState['remove'] = (id) => {
      setItems(prev => prev.filter(x => x.id !== id))
    }
    const clear: CartState['clear'] = () => setItems([])
    const count = items.reduce((a,b) => a + b.qty, 0)
    const subtotal_cents = items.reduce((a,b) => a + b.qty * b.price_cents, 0)
    return { items, currency, open, isLoaded, setOpen, add, updateQty, remove, clear, count, subtotal_cents }
  }, [items, open, isLoaded])

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
