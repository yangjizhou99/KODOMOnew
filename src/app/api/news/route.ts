import { NextResponse } from 'next/server'
import { APP_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabaseClient'
import newsMock from '@/data/mock/news.json'

export async function GET() {
  try {
    if (APP_MODE === 'SUPABASE') {
      const { data, error } = await supabase
        .from('news_posts')
        .select('id,title_zh,title_en,body_zh,body_en,published_at,status,cover_url')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6)
      if (error) throw error
      return NextResponse.json(data ?? [])
    }
    return NextResponse.json(newsMock)
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'news fetch error' }, { status: 500 })
  }
}
