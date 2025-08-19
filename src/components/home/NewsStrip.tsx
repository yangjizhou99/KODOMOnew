import { t, Lang } from '../../lib/lang'
import { APP_MODE } from '../../lib/config'
import { supabase } from '../../lib/supabaseClient'
// 注意：仅在 MOCK 模式下动态导入本地数据，避免 SUPABASE 模式静态打包

type News = { id: string; title_zh: string; title_en: string; published_at?: string }

async function getNews(): Promise<News[]> {
  try {
    if (APP_MODE === 'SUPABASE' && supabase) {
      const { data, error } = await supabase
        .from('news_posts')
        .select('id,title_zh,title_en,published_at,status')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6)
      if (!error && data) {
        return data
      }
    }
    
    // 降级到mock数据
    const newsMock = (await import('../../data/mock/news.json')).default
    return newsMock as any
  } catch (error) {
    console.error('Error fetching news in NewsStrip:', error)
    const newsMock = (await import('../../data/mock/news.json')).default
    return newsMock as any
  }
}

export default async function NewsStrip({ lang }: { lang: Lang }) {
  const list = await getNews()
  if (!list.length) return null
  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          {t(lang, '最新消息 / 活動公告', 'News & Promotions')}
        </h2>
        <a className="link text-sm" href={`/news?lang=${lang}`}>
          {t(lang, '全部', 'View all')}
        </a>
      </div>
      <ul className="mt-3 grid md:grid-cols-2 gap-2">
        {list.slice(0, 4).map((n) => (
          <li key={n.id} className="text-sm">
            <span className="mr-2">•</span>
            {t(lang, n.title_zh, n.title_en)}
          </li>
        ))}
      </ul>
    </section>
  )
}
