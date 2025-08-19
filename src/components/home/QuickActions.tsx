import { t, Lang } from '../../lib/lang'

const items = (lang: Lang) => [
  { href: `/menu?lang=${lang}`, title: t(lang, '線上購物', 'Shop Online'), note: t(lang,'快速下單','Fast ordering') },
  { href: `/qr/demo-table?lang=${lang}`, title: t(lang, '掃碼點餐', 'QR Order'), note: t(lang,'內用/外帶','Dine-in/Takeout') },
  { href: `/member?lang=${lang}`, title: t(lang, '會員卡儲值', 'Top Up Wallet'), note: t(lang,'餘額/紀錄','Balance/History') }
]

export default function QuickActions({ lang }: { lang: Lang }) {
  return (
    <section className="grid md:grid-cols-3 gap-6">
      {items(lang).map((i) => (
        <a key={i.href} href={i.href} className="card hover:shadow-xl transition-shadow">
          <div className="font-semibold">{i.title}</div>
          <div className="text-gray-600 text-sm mt-1">{i.note}</div>
        </a>
      ))}
    </section>
  )
}
