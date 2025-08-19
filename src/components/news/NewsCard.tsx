import Link from 'next/link'
import { Route } from 'next'

export default function NewsCard({ n, lang='zh-TW' }:{
  n: any; lang?: 'zh-TW'|'en'
}) {
  const title = lang==='en' ? (n.title_en || n.title_zh) : (n.title_zh || n.title_en)
  const excerpt = lang==='en' ? (n.excerpt_en || '') : (n.excerpt_zh || '')
  const body = lang==='en' ? (n.body_en || '') : (n.body_zh || '')
  const preview = (excerpt && excerpt.trim()) ? excerpt : String(body || '').slice(0, 100)
  const idOrSlug = n.id || n.slug
  const href = `/news/${idOrSlug}?lang=${lang}` as Route
  return (
    <article className="rounded-2xl border overflow-hidden">
      <div className="aspect-[16/9] bg-gray-100">
        {n.cover_url ? <img src={n.cover_url} alt={title} className="w-full h-full object-cover" /> : null}
      </div>
      <div className="p-4">
        <h3 className="font-semibold line-clamp-2">{title}</h3>
        {preview ? <p className="text-sm text-gray-600 mt-1 line-clamp-2">{preview}</p> : null}
        <Link className="btn btn-outline mt-3" href={href}>{lang==='en'?'Read more':'閱讀全文'}</Link>
      </div>
    </article>
  )
}
