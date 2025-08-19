import { NextResponse } from 'next/server'
import { APP_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabaseClient'
import newsMock from '@/data/mock/news.json'

export async function GET() {
  try {
    if (APP_MODE === 'SUPABASE' && supabase) {
      const { data, error } = await supabase
        .from('news_posts')
        .select('id,title_zh,title_en,body_zh,body_en,published_at,status,cover_url')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6)
      if (error) throw error
      return NextResponse.json(data ?? [])
    }
    // 如果APP_MODE不是SUPABASE或者supabase客户端不可用，返回mock数据
    return NextResponse.json(newsMock)
  } catch (e: any) {
    console.error('News API error:', e)
    // 发生错误时也返回mock数据，而不是500错误
    return NextResponse.json(newsMock)
  }
}
