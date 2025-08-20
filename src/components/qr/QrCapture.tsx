'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '../../lib/cart'

export default function QrCapture() {
  const sp = useSearchParams()
  const { setCtx } = useCart()

  useEffect(() => {
    const token = sp.get('qr')
    if (!token) return
    ;(async () => {
      try {
        const res = await fetch('/api/qr/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        const json = await res.json()
        if (res.ok) {
          setCtx({ channel: 'qr', tableId: json.table?.id || null })
        } else {
          // 无效 token 也不打扰用户
          console.warn('qr session failed', json)
        }
      } catch (e) {
        console.warn('qr session error', e)
      }
    })()
  }, [sp, setCtx])

  return null
}
