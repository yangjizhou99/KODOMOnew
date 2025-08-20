import Hero from '../components/home/Hero'
import NewsStrip from '../components/home/NewsStrip'
import QuickActions from '../components/home/QuickActions'
import ContactMap from '../components/home/ContactMap'
import SocialLinks from '../components/home/SocialLinks'
import QrCapture from '../components/qr/QrCapture'
import { getLangFromSearchParams, Lang } from '../lib/lang'

export default function Home({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const lang: Lang = getLangFromSearchParams(searchParams)
  const qrToken = typeof searchParams?.qr === 'string' ? searchParams.qr : undefined

  return (
    <div className="space-y-8">
      {/* 扫码落首页时，自动绑定桌位 Session */}
      <QrCapture />
      <Hero lang={lang} qrToken={qrToken} />
      <NewsStrip lang={lang} />
      <QuickActions lang={lang} qrToken={qrToken} />
      <ContactMap lang={lang} />
      <SocialLinks lang={lang} />
    </div>
  )
}
