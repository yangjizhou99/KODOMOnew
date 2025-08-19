import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    // 检查Supabase客户端是否可用
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase客户端未配置',
        details: '缺少必需的环境变量: NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY',
        environment: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置'
        }
      }, { status: 500 })
    }

    // 测试基本连接
    const startTime = Date.now()
    
    // 1. 测试简单查询
    const { data: healthCheck, error: healthError } = await supabase
      .from('categories')
      .select('count')
      .limit(1)
    
    if (healthError) {
      return NextResponse.json({
        success: false,
        error: '数据库连接失败',
        details: healthError.message,
        errorCode: healthError.code
      }, { status: 500 })
    }

    // 2. 测试数据表访问
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name_zh, name_en')
      .limit(5)

    const { data: products, error: productsError } = await supabase
      .from('products')  
      .select('id, name_zh, name_en')
      .limit(5)

    const endTime = Date.now()
    const responseTime = endTime - startTime

    // 收集测试结果
    const testResults = {
      connection: {
        status: 'success',
        responseTime: `${responseTime}ms`
      },
      tables: {
        categories: {
          accessible: !categoriesError,
          count: categories?.length || 0,
          error: categoriesError?.message
        },
        products: {
          accessible: !productsError,
          count: products?.length || 0,
          error: productsError?.message
        }
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已配置' : '未配置'
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: '数据库连接测试成功',
      ...testResults
    })

  } catch (error) {
    console.error('Database test error:', error)
    
    return NextResponse.json({
      success: false,
      error: '数据库测试过程中发生错误',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
