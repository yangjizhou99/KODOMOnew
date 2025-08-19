import AboutHero from '../../components/about/AboutHero'
import Story from '../../components/about/Story'
import Philosophy from '../../components/about/Philosophy'
import Environment from '../../components/about/Environment'
import Team from '../../components/about/Team'
import { getLangFromSearchParams, Lang } from '../../lib/lang'

export default function AboutPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const lang: Lang = getLangFromSearchParams(searchParams)

  return (
    <div className="space-y-8">
      <AboutHero lang={lang} />
      <Story lang={lang} />
      <Philosophy lang={lang} />
      <Environment lang={lang} />
      <Team lang={lang} />
    </div>
  )
}
