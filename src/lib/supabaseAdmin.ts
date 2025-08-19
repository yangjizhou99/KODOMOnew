import 'server-only'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // 只在服务端使用

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false }
})
