import Hero from '../components/home/Hero'
import NewsStrip from '../components/home/NewsStrip'
import QuickActions from '../components/home/QuickActions'
import ContactMap from '../components/home/ContactMap'
import SocialLinks from '../components/home/SocialLinks'
import { getLangFromSearchParams, Lang } from '../lib/lang'

export default function Home({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const lang: Lang = getLangFromSearchParams(searchParams)

  return (
    <div className="space-y-8">
      <Hero lang={lang} />
      <NewsStrip lang={lang} />
      <QuickActions lang={lang} />
      <ContactMap lang={lang} />
      <SocialLinks lang={lang} />
    </div>
  )
}
