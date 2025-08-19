import { t, Lang } from '../../lib/lang'

export default function AboutHero({ lang }: { lang: Lang }) {
  return (
    <section className="card overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-white" />
      <div className="relative p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-extrabold">
          {t(lang, 'Kodomo 小時候台灣美食', 'Kodomo Taiwanese Cuisine')}
        </h1>
        <p className="text-gray-600 mt-3 max-w-2xl">
          {t(
            lang,
            '我們相信「記憶中的味道」最能安慰人心——用不複雜的食材、講究的火候，做出每天都想吃的家常。',
            'We believe comfort comes from flavors you grew up with—simple ingredients, precise heat, dishes you\'d eat every day.'
          )}
        </p>
      </div>
    </section>
  )
}
