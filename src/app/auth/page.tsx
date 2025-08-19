'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const signInOtp = async () => {
    if (!supabase) return alert('Supabase not configured')
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOtp({
        email, options: { emailRedirectTo: (process.env.NEXT_PUBLIC_SITE_URL || '') + '/auth' }
      })
      if (error) throw error
      setSent(true)
    } catch (e:any) {
      alert(e.message || 'Failed to send magic link')
    } finally { setLoading(false) }
  }

  const signInGoogle = async () => {
    if (!supabase) return alert('Supabase not configured')
    const redirectTo = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/member'
      : (process.env.NEXT_PUBLIC_SITE_URL || '') + '/member'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account' // 强制用户重新选择账户
        }
      }
    })
  }

  const signOut = async () => { 
    if (!supabase) return alert('Supabase not configured')
    await supabase.auth.signOut(); 
    location.href='/auth' 
  }

  const [session, setSession] = useState<any>(null)
  useEffect(() => { 
    if (supabase) {
      supabase.auth.getSession().then(({data}) => setSession(data.session)) 
    }
  }, [])
  useEffect(() => {
    if (supabase) {
      return supabase.auth.onAuthStateChange((_e, s)=>setSession(s)).data.subscription.unsubscribe
    }
  }, [])

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-bold">登入 / 註冊</h1>
      {session ? (
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-3">目前已登入：{session.user.email}</div>
          <a className="btn btn-primary w-full mb-2" href="/member">前往會員中心</a>
          <button className="btn btn-outline w-full" onClick={signOut}>登出</button>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          <input className="border rounded-xl px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn btn-primary" onClick={signInOtp} disabled={!email || loading}>
            寄送魔法登入連結
          </button>
          {sent && <div className="text-sm text-green-600">已寄出，請到信箱點擊登入。</div>}
          <div className="h-px bg-gray-200 my-2" />
          <button className="btn btn-outline" onClick={signInGoogle}>使用 Google 登入</button>
        </div>
      )}
    </div>
  )
}
