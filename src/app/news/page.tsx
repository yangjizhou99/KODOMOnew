import { getLangFromSearchParams, Lang, t } from '../../lib/lang'

type News = { 
  id: string; 
  title_zh: string; 
  title_en: string; 
  body_zh?: string;
  body_en?: string;
  published_at?: string;
  cover_url?: string;
}

async function getNews(): Promise<News[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  const res = await fetch(`${base}/api/news`, { 
    next: { revalidate: 60 },
    cache: 'no-store' // 确保获取最新数据
  })
  if (!res.ok) return []
  return res.json()
}

export default async function News({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const lang: Lang = getLangFromSearchParams(searchParams)
  const newsList = await getNews()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {t(lang, '最新消息', 'Latest News')}
      </h1>
      
      {newsList.length === 0 ? (
        <div className="card text-center py-8 text-gray-500">
          {t(lang, '暂无消息', 'No news available')}
        </div>
      ) : (
        <div className="grid gap-4">
          {newsList.map((news) => (
            <article key={news.id} className="card">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">
                  {t(lang, news.title_zh, news.title_en)}
                </h2>
                
                {news.published_at && (
                  <div className="text-sm text-gray-500">
                    {new Date(news.published_at).toLocaleDateString(
                      lang === 'zh-TW' ? 'zh-TW' : 'en-US'
                    )}
                  </div>
                )}
                
                {(news.body_zh || news.body_en) && (
                  <div className="text-gray-700">
                    {t(lang, news.body_zh || '', news.body_en || '')}
                  </div>
                )}
                
                {news.cover_url && (
                  <img 
                    src={news.cover_url} 
                    alt={t(lang, news.title_zh, news.title_en)}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
