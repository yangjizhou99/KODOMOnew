'use client'
import { supabase } from '@/lib/supabaseClient'

export default function LogoutButton() {
  const onClick = async () => {
    if (!supabase) { alert('Supabase 未配置'); return }
    try {
      await supabase.auth.signOut()
      location.href = '/auth'
    } catch (e: any) {
      alert(e?.message || '登出失败')
    }
  }
  return (
    <button className="px-3 py-2 rounded border hover:bg-gray-50" onClick={onClick}>登出</button>
  )
}


