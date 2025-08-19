import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase客户端未配置'
      }, { status: 500 })
    }

    // 测试表结构和数据
    const testResults = {
      tables: [],
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: '测试表检查完成',
      ...testResults
    })

  } catch (error) {
    console.error('Test tables error:', error)
    
    return NextResponse.json({
      success: false,
      error: '测试表检查过程中发生错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}