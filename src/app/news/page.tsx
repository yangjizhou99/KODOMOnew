import NewsCard from '../../components/news/NewsCard'
import { getLangFromSearchParams, Lang } from '../../lib/lang'

async function getData(searchParams: any) {
  const q = searchParams?.q || ''
  const page = Number(searchParams?.page || 1)
  const pageSize = Number(searchParams?.pageSize || 8)
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  const url = `${base}/api/news?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) return { items: [], total: 0, page, pageSize }
  return res.json()
}

export default async function NewsPage({ searchParams }: { searchParams: any }) {
  const lang: Lang = getLangFromSearchParams(searchParams)
  const { items, total, page, pageSize } = await getData(searchParams)
  const totalPages = Math.max(1, Math.ceil((total||0) / pageSize))

  return (
    <div className="space-y-6">
      <div className="card">
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={searchParams?.q || ''}
            placeholder={lang==='en'?'Search news...':'搜尋消息...'}
            className="border rounded-xl px-3 py-2 flex-1"
          />
          <input type="hidden" name="lang" value={lang} />
          <button className="btn btn-primary">{lang==='en'?'Search':'搜尋'}</button>
        </form>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map((n:any) => <NewsCard key={n.id || n.slug} n={n} lang={lang} />)}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_,i) => i+1).map(p => {
            const sp = new URLSearchParams(searchParams || {})
            sp.set('page', String(p))
            sp.set('lang', lang)
            return (
              <a key={p} href={`/news?${sp.toString()}`} className={`px-3 py-1 rounded border ${p===page?'bg-black text-white border-black':''}`}>
                {p}
              </a>
            )
          })}
        </nav>
      )}
    </div>
  )
}
