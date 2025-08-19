import { t, Lang } from '../../lib/lang'

const ADDRESS_ZH = '東京都渋谷区サンプル 1-2-3'
const ADDRESS_EN = '1-2-3 Sample, Shibuya, Tokyo'
const PHONE = '080-0000-0000'
const EMAIL = 'hello@kodomo.example'

export default function ContactMap({ lang }: { lang: Lang }) {
  const addr = t(lang, ADDRESS_ZH, ADDRESS_EN)
  const mapQuery = encodeURIComponent(addr)
  return (
    <section className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="font-semibold">{t(lang, '聯絡資訊', 'Contact')}</h3>
        <div className="text-sm text-gray-700 mt-2 space-y-1">
          <p>{t(lang,'地址','Address')}: {addr}</p>
          <p>{t(lang,'電話','Phone')}: {PHONE}</p>
          <p>Email: <a className="link" href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
          <p className="mt-3">
            <a className="link" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank">
              {t(lang, '在 Google 地圖中開啟', 'Open in Google Maps')}
            </a>
          </p>
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <iframe
          title="Google Map"
          className="w-full h-64 md:h-[280px]"
          src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          loading="lazy"
        />
      </div>
    </section>
  )
}
