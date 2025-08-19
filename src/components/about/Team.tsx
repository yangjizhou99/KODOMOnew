import { t, Lang } from '../../lib/lang'
import team from '../../data/mock/team.json'

type Member = {
  id: string
  name_zh: string
  name_en: string
  role_zh: string
  role_en: string
  bio_zh: string
  bio_en: string
  photo?: string
}

function Avatar({ name, photo }: { name: string; photo?: string }) {
  if (photo) {
    return <img src={photo} alt={name} className="w-14 h-14 rounded-full object-cover" />
  }
  const initials = name.slice(0, 2)
  return (
    <div className="w-14 h-14 rounded-full bg-gray-200 grid place-content-center text-gray-700 font-semibold">
      {initials}
    </div>
  )
}

export default function Team({ lang }: { lang: Lang }) {
  const list = team as Member[]
  return (
    <section className="card">
      <h2 className="font-semibold text-xl">{t(lang, '團隊介紹', 'Meet the Team')}</h2>
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        {list.map((m) => {
          const name = t(lang, m.name_zh, m.name_en)
          const role = t(lang, m.role_zh, m.role_en)
          const bio = t(lang, m.bio_zh, m.bio_en)
          return (
            <div key={m.id} className="rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <Avatar name={name} photo={m.photo} />
                <div>
                  <div className="font-semibold">{name}</div>
                  <div className="text-sm text-gray-600">{role}</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-3">{bio}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
