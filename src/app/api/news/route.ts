import { NextResponse } from 'next/server'
import { APP_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabaseClient'
// 本地数据仅在 MOCK 模式时动态导入

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q')?.trim() || ''
    const page = Math.max(1, Number(url.searchParams.get('page') || 1))
    const pageSize = Math.min(24, Math.max(1, Number(url.searchParams.get('pageSize') || 8)))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    if (APP_MODE === 'SUPABASE' && supabase) {
      let query = supabase
        .from('news_posts')
        .select('id,title_zh,title_en,body_zh,body_en,published_at,cover_url,status', { count: 'exact' })
        .eq('status','published')
        .order('published_at', { ascending: false })
        .range(from, to)

      if (q) {
        query = query.or(`title_zh.ilike.%${q}%,title_en.ilike.%${q}%`)
      }

      const { data, error, count } = await query
      if (error) throw error
      return NextResponse.json({ items: data ?? [], total: count ?? 0, page, pageSize })
    }

    // MOCK
    const newsMock = (await import('@/data/mock/news.json')).default as any[]
    const all = newsMock
      .filter(n => n.status === 'published')
      .filter(n => q ? (n.title_zh?.includes(q) || n.title_en?.toLowerCase().includes(q.toLowerCase())) : true)
      .sort((a,b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    const items = all.slice(from, from + pageSize)
    return NextResponse.json({ items, total: all.length, page, pageSize })
  } catch (e:any) {
    return NextResponse.json({ error: e.message ?? 'news fetch error' }, { status: 500 })
  }
}
