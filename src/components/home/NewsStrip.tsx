import { t, Lang } from '../../lib/lang'

type News = { id: string; title_zh: string; title_en: string; published_at?: string }

async function getNews(): Promise<News[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  const res = await fetch(`${base}/api/news`, { next: { revalidate: 60 } })
  if (!res.ok) return []
  return res.json()
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
