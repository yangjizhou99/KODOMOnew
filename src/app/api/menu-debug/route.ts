import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { APP_MODE } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      appMode: APP_MODE,
      supabaseConfigured: !!supabase,
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置'
      }
    }

    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase未配置',
        ...debugInfo
      })
    }

    // 测试1: 获取所有产品（无筛选）
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    // 测试2: 获取激活的产品
    const { data: activeProducts, error: activeError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // 测试3: 获取激活且未售罄的产品
    const { data: availableProducts, error: availableError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_sold_out', false)
      .order('created_at', { ascending: false })

    // 测试4: 获取所有分类
    const { data: allCategories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    return NextResponse.json({
      success: true,
      ...debugInfo,
      queries: {
        allProducts: {
          count: allProducts?.length || 0,
          data: allProducts,
          error: allError?.message
        },
        activeProducts: {
          count: activeProducts?.length || 0,
          data: activeProducts,
          error: activeError?.message
        },
        availableProducts: {
          count: availableProducts?.length || 0,
          data: availableProducts,
          error: availableError?.message
        },
        categories: {
          count: allCategories?.length || 0,
          data: allCategories,
          error: catError?.message
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '服务器错误',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 添加POST方法来强制刷新
export async function POST(request: NextRequest) {
  return GET(request)
}
