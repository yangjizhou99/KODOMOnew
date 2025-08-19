declare module 'src/lib/lang' {
  export type Lang = 'zh-TW' | 'en'
  
  export function getLangFromSearchParams(
    searchParams: { [key: string]: string | string[] | undefined }
  ): Lang

  export const t: (lang: Lang, zh: string, en: string) => string
}
