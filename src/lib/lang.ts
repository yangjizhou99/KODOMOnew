export type Lang = 'zh-TW' | 'en'

export function getLangFromSearchParams(
  searchParams: { [key: string]: string | string[] | undefined }
): Lang {
  const v = searchParams?.lang
  const lang = Array.isArray(v) ? v[0] : v
  return lang === 'en' ? 'en' : 'zh-TW'
}

export const t = (lang: Lang, zh: string, en: string) => (lang === 'en' ? en : zh)
