'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AuthStatus() {
  const [user, setUser] = useState<any>(null)
  useEffect(() => { 
    if (!supabase) return
    let mounted = true
    supabase.auth.getUser().then(({data}) => { if (mounted) setUser(data.user) })
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
    })
    return () => { mounted = false; sub?.subscription?.unsubscribe?.() }
  }, [])
  
  const logout = async () => {
    if (!supabase) return
    try {
      // 清除 Supabase 会话
      await supabase.auth.signOut()
      
      // 清除本地存储中的认证相关数据
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
        
        // 清除所有相关的 localStorage 项
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth') || key.includes('google')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      location.href = '/auth'
    } catch (e) {
      console.error('Logout error:', e)
      location.href = '/auth'
    }
  }
  
  if (!user) return <Link className="ml-2 text-sm border rounded px-2 py-1" href="/auth">登入</Link>
  
  return (
    <div className="ml-2 flex items-center gap-2">
      <Link className="text-sm border rounded px-2 py-1" href="/member">我的</Link>
      <button className="text-sm border rounded px-2 py-1" onClick={logout}>
        登出
      </button>
    </div>
  )
}
