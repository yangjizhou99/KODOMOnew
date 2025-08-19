import { t, Lang } from '../../lib/lang'

export default function SocialLinks({ lang }: { lang: 'zh-TW' | 'en' }) {
  return (
    <section className="card">
      <h3 className="font-semibold">{t(lang, '追蹤我們', 'Follow us')}</h3>
      <div className="mt-2 flex gap-4">
        <a className="link" href="#" target="_blank" rel="noreferrer">Instagram</a>
        <a className="link" href="#" target="_blank" rel="noreferrer">Facebook</a>
      </div>
    </section>
  )
}
