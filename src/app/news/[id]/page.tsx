import { getLangFromSearchParams, Lang } from '../../../lib/lang'
import type { Metadata } from 'next'

async function fetchOne(id: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''
  const res = await fetch(`${base}/api/news/${id}`, { next: { revalidate: 60 } })
  if (!res.ok) return null
  return res.json()
}

export async function generateMetadata({ params, searchParams }:{ params: { id:string }, searchParams:any }): Promise<Metadata> {
  const lang: Lang = (searchParams?.lang === 'en' ? 'en' : 'zh-TW')
  const one = await fetchOne(params.id)
  const title = one ? (lang==='en' ? (one.title_en || one.title_zh) : (one.title_zh || one.title_en)) : 'News'
  const desc = one ? ((lang==='en' ? one.excerpt_en : one.excerpt_zh) || '') : ''
  const images = one?.cover_url ? [one.cover_url] : []
  return {
    title, description: desc,
    openGraph: { title, description: desc, images }
  }
}

export default async function NewsDetail({ params, searchParams }:{ params: { id: string }, searchParams: any }) {
  const lang: Lang = getLangFromSearchParams(searchParams)
  const n = await fetchOne(params.id)
  if (!n) return <div className="card">Not found.</div>
  const title = lang==='en' ? (n.title_en || n.title_zh) : (n.title_zh || n.title_en)
  const body = lang==='en' ? (n.body_en || n.body_zh) : (n.body_zh || n.body_en)

  return (
    <article className="space-y-6">
      <div className="card p-0 overflow-hidden">
        {n.cover_url ? <img src={n.cover_url} alt={title} className="w-full aspect-[16/9] object-cover" /> : null}
        <div className="p-6">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {n.published_at ? new Date(n.published_at).toLocaleString() : ''}
          </p>
        </div>
      </div>
      <div className="card">
        {String(body || '')
          .split(/\n{2,}/)
          .map((p: string, i: number) => (
            <p key={i} className="leading-relaxed text-gray-800 whitespace-pre-wrap mb-4">{p}</p>
          ))}
      </div>
      <div className="text-center">
        <a className="link" href={`/news?lang=${lang}`}>{lang==='en'?'Back to list':'返回列表'}</a>
      </div>
    </article>
  )
}
