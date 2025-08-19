import { t, Lang } from '../../lib/lang'
import gallery from '../../data/mock/gallery.json'

export default function Environment({ lang }: { lang: Lang }) {
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
