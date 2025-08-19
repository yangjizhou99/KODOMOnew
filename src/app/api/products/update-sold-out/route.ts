import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, isSoldOut = true } = body

    // 如果没有提供 productId，则随机选择一个产品
    let targetProductId = productId

    if (!targetProductId) {
      // 获取第一个可用的产品
      const { data: products, error: fetchError } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('is_active', true)
        .limit(1)

      if (fetchError) {
        return NextResponse.json({
          success: false,
          error: '获取产品失败',
          details: fetchError.message
        }, { status: 500 })
      }

      if (!products || products.length === 0) {
        return NextResponse.json({
          success: false,
          error: '没有找到可用的产品'
        }, { status: 404 })
      }

      targetProductId = products[0].id
    }

    // 更新产品的 is_sold_out 状态
    const { data: updatedProduct, error: updateError } = await supabaseAdmin
      .from('products')
      .update({ is_sold_out: isSoldOut })
      .eq('id', targetProductId)
      .select('id, name_zh, name_en, is_sold_out')
      .single()

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: '更新产品状态失败',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `产品售罄状态已更新为 ${isSoldOut ? '售罄' : '有库存'}`,
      product: updatedProduct,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Update product sold-out status error:', error)
    
    return NextResponse.json({
      success: false,
      error: '更新产品售罄状态时发生错误',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET 方法：查看当前产品状态
export async function GET(request: NextRequest) {
  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name_zh, name_en, is_sold_out, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({
        success: false,
        error: '获取产品列表失败',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      products: products || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get products error:', error)
    
    return NextResponse.json({
      success: false,
      error: '获取产品列表时发生错误',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
