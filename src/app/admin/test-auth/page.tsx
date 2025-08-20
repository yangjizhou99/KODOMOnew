'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestAuthPage() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        if (!supabase) {
          console.error('Supabase client is not initialized')
          setLoading(false)
          return
        }
        
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        
        if (session?.user) {
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const testApiCall = async () => {
    try {
      if (!supabase) {
        alert('Supabase client is not initialized')
        return
      }
      
      const { data: { session } } = await supabase.auth.getSession()
      const headers = { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${session?.access_token}` 
      }
      
      const res = await fetch('/api/admin/tables', { headers })
      const text = await res.text()
      
      console.log('Response status:', res.status)
      console.log('Response headers:', Object.fromEntries(res.headers.entries()))
      console.log('Response body:', text)
      
      alert(`Status: ${res.status}\nBody: ${text.substring(0, 200)}...`)
    } catch (error) {
      console.error('API test error:', error)
      alert(`Error: ${error}`)
    }
  }

  if (loading) return <div>检查认证状态中...</div>

  if (!supabase) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">错误</h1>
        <p className="text-red-500">Supabase 客户端未初始化，请检查环境变量配置。</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">认证状态测试</h1>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">会话信息：</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">用户信息：</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <button 
        onClick={testApiCall}
        className="btn btn-primary"
      >
        测试API调用
      </button>
      
      <div className="text-sm text-gray-600">
        <p>如果API调用失败，请检查：</p>
        <ul className="list-disc list-inside mt-2">
          <li>是否已登录</li>
          <li>用户角色是否为staff或admin</li>
          <li>access_token是否有效</li>
        </ul>
      </div>
    </div>
  )
}
