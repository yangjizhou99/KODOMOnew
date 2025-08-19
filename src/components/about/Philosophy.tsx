import { t, Lang } from '../../lib/lang'
import { Leaf, Timer, Smile } from 'lucide-react'

const items = (lang: Lang) => [
  {
    icon: Leaf,
    title: t(lang, '好食材', 'Good Ingredients'),
    desc: t(lang, '選擇可靠供應鏈，尊重季節。', 'Trusted sourcing, seasonal respect.')
  },
  {
    icon: Timer,
    title: t(lang, '好火候', 'Right Timing'),
    desc: t(lang, '該滷就滷、該炸就炸；每口都剛剛好。', 'Braise when needed, fry when right; every bite just right.')
  },
  {
    icon: Smile,
    title: t(lang, '好服務', 'Warm Service'),
    desc: t(lang, '像招呼熟客一樣對待每位客人。', 'Treat everyone like a regular.')
  }
]

export default function Philosophy({ lang }: { lang: Lang }) {
  return (
    <section className="card">
      <h2 className="font-semibold text-xl">{t(lang, '餐廳理念', 'Philosophy')}</h2>
      <div className="mt-4 grid sm:grid-cols-3 gap-4">
        {items(lang).map((it) => (
          <div key={it.title} className="rounded-2xl border p-4">
            <it.icon className="w-6 h-6" />
            <div className="font-semibold mt-2">{it.title}</div>
            <div className="text-sm text-gray-600 mt-1">{it.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
