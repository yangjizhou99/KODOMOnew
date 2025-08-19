import { t, Lang } from '../../lib/lang'

export default function Story({ lang }: { lang: Lang }) {
  return (
    <section className="card">
      <h2 className="font-semibold text-xl">{t(lang, '品牌故事', 'Our Story')}</h2>
      <div className="text-gray-700 mt-3 space-y-3 leading-relaxed">
        <p>
          {t(
            lang,
            'Kodomo 取自「小時候」的諧音，靈感來自在台灣的街角小店：滷味的香、炸物的酥、白飯的甜。',
            'Kodomo echoes the feeling of childhood— inspired by Taiwan\'s corner eateries: the aroma of braises, the crisp of fried bites, the sweetness of steamed rice.'
          )}
        </p>
        <p>
          {t(
            lang,
            '我們將經典家常菜做成更穩定、乾淨、可外帶的版本，保留靈魂，也擁抱現代節奏。',
            'We rework homestyle classics into cleaner, more consistent, and takeout-friendly forms—keeping the soul while embracing modern pace.'
          )}
        </p>
      </div>
    </section>
  )
}
