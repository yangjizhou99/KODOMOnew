import ContactForm from '../../components/contact/ContactForm'
import ContactMap from '../../components/home/ContactMap'
import { getLangFromSearchParams, Lang } from '../../lib/lang'

export default function ContactPage({ searchParams }:{ searchParams: any }) {
  const lang: Lang = getLangFromSearchParams(searchParams)
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* 店铺信息 + 地图（任务 1 已提供的组件） */}
        <ContactMap lang={lang} />
        {/* 如需补充：营业时间/发票抬头/交通方式等，可再加 card */}
      </div>
      <div>
        <ContactForm lang={lang} />
      </div>
    </div>
  )
}
