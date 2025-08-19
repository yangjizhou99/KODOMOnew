'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      if (!supabase) { setErr('Supabase not configured'); setOk(false); return }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { location.href = '/auth'; return }
      const res = await fetch('/api/admin/me', { headers: { Authorization: `Bearer ${session.access_token}` } })
      if (res.ok) setOk(true)
      else { setErr('Forbidden'); setOk(false) }
    })()
  }, [])

  if (ok === null) return <div className="card">Checking permission…</div>
  if (!ok) return <div className="card text-red-600">403 Forbidden. {err || ''}</div>
  return <>{children}</>
}
