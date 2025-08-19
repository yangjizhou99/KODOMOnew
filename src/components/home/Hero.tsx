import { t, Lang } from '../../lib/lang'

export default function Hero({ lang }: { lang: Lang }) {
  return (
    <section className="card overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-white to-white" />
      <div className="relative grid md:grid-cols-2 gap-6">
        <div className="p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            {t(lang, 'Kodomo 小時候台灣美食', 'Kodomo Taiwanese Cuisine')}
          </h1>
          <p className="text-gray-600 mt-3">
            {t(lang, '主打招牌與季節限定，線上點餐更快速。', 'Signature dishes & seasonal picks. Order online fast.')}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={`/menu?lang=${lang}`} className="btn btn-primary">
              {t(lang, '立刻選餐', 'Shop Now')}
            </a>
            <a href={`/qr/demo-table?lang=${lang}`} className="btn btn-outline">
              {t(lang, '掃碼點餐', 'QR Order')}
            </a>
          </div>
        </div>
        <div className="p-6 md:p-10">
          <div className="h-48 md:h-full rounded-2xl bg-gray-100 grid place-content-center text-gray-500">
            {t(lang, 'Banner 圖片位', 'Banner Image')}
          </div>
        </div>
      </div>
    </section>
  )
}
