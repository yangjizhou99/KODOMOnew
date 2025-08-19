import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id,name_zh,name_en,sort_order,is_active')
      .order('sort_order', { ascending: true })
    if (error) throw error
    return NextResponse.json({ items: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'categories fetch error' }, { status: 500 })
  }
}


