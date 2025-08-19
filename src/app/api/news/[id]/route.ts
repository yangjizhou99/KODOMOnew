import { NextResponse } from 'next/server'
import { APP_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabaseClient'
// 本地数据仅在 MOCK 模式时动态导入

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    if (APP_MODE === 'SUPABASE' && supabase) {
      const isUUID = /^[0-9a-f-]{36}$/i.test(id)
      const { data, error } = await supabase
        .from('news_posts')
        .select('id,title_zh,title_en,body_zh,body_en,published_at,cover_url,status')
        [isUUID ? 'eq' : 'eq'](isUUID ? 'id' : 'id', id)
        .maybeSingle()
      if (error) throw error
      if (!data || data.status !== 'published') return NextResponse.json({ error: 'not found' }, { status: 404 })
      return NextResponse.json(data)
    }

    // MOCK 支持 id 或 slug
    const newsMock = (await import('@/data/mock/news.json')).default as any[]
    const one = newsMock.find(n => n.id === id || n.slug === id)
    if (!one) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json(one)
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'news detail error' }, { status: 500 })
  }
}
