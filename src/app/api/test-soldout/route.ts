import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { APP_MODE } from '@/lib/config'

export async function GET() {
  try {
    if (APP_MODE !== 'SUPABASE') {
      return NextResponse.json({ 
        mode: 'MOCK', 
        message: '在MOCK模式下，所有商品都不售罄',
        products: []
      })
    }

    // 查询所有商品的售罄状态
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name_zh, name_en, is_sold_out')
      .order('name_zh')

    if (error) {
      console.error('查询商品售罄状态错误:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      mode: 'SUPABASE',
      products: products || [],
      soldOutCount: products?.filter(p => p.is_sold_out).length || 0
    })
  } catch (e: any) {
    console.error('API错误:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (APP_MODE !== 'SUPABASE') {
      return NextResponse.json({ error: '只有在SUPABASE模式下才能修改售罄状态' }, { status: 400 })
    }

    const { productId, isSoldOut } = await req.json()
    
    if (!productId) {
      return NextResponse.json({ error: '缺少productId参数' }, { status: 400 })
    }

    // 更新商品售罄状态
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ is_sold_out: isSoldOut })
      .eq('id', productId)
      .select('id, name_zh, is_sold_out')
      .single()

    if (error) {
      console.error('更新商品售罄状态错误:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      product: data,
      message: `商品 ${data.name_zh} 已${isSoldOut ? '设置为' : '取消'}售罄`
    })
  } catch (e: any) {
    console.error('API错误:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
