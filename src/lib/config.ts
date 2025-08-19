export const APP_MODE = (process.env.NEXT_PUBLIC_APP_MODE || process.env.APP_MODE || 'SUPABASE') as 'MOCK' | 'SUPABASE'
export const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE || 'zh-TW'
