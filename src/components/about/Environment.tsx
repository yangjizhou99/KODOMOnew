import { t, Lang } from '../../lib/lang'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Gallery = { id: string; src: string; title_zh: string; title_en: string; sort_order?: number; is_active?: boolean }

export default async function Environment({ lang }: { lang: Lang }) {
  const table = process.env.NEXT_PUBLIC_GALLERY_TABLE || process.env.GALLERY_TABLE || 'gallery_items'
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('id,src,title_zh,title_en,sort_order,is_active')
    .order('sort_order', { ascending: true })
  if (error) {
    console.error('[Environment] fetch error:', error)
  }
  const gallery = (data || []) as any as Gallery[]
  if (!gallery.length) return null
  return (
    <section className="card">
      <h2 className="font-semibold text-xl">{t(lang, '環境與設計', 'Environment & Design')}</h2>
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        {gallery.map((g) => (
          <figure key={g.id} className="rounded-2xl overflow-hidden border">
            <img src={g.src} alt={t(lang, g.title_zh, g.title_en)} className="w-full h-44 md:h-48 object-cover" />
            <figcaption className="p-3 text-sm text-gray-700">
              {t(lang, g.title_zh, g.title_en)}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
