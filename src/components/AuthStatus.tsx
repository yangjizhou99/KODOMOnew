'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AuthStatus() {
  const [user, setUser] = useState<any>(null)
  useEffect(() => { 
    if (supabase) {
      supabase.auth.getUser().then(({data}) => setUser(data.user)) 
    }
  }, [])
  if (!user) return <Link className="ml-2 text-sm border rounded px-2 py-1" href="/auth">登入</Link>
  return <Link className="ml-2 text-sm border rounded px-2 py-1" href="/member">我的</Link>
}
