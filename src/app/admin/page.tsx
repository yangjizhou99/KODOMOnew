'use client'

import { useState } from 'react'
import PageHeading from '../../../ui/PageHeading'
import Button from '../../../ui/Button'

export default function AdminPage() {
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error'
    message: string
    details?: any
  }>({
    status: 'idle',
    message: ''
  })

  const testDatabaseConnection = async () => {
    setTestResult({ status: 'loading', message: '正在测试数据库连接...' })
    
    try {
      const response = await fetch('/api/test-db', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setTestResult({
          status: 'success',
          message: '数据库连接成功！',
          details: data
        })
      } else {
        setTestResult({
          status: 'error',
          message: data.error || '数据库连接失败',
          details: data
        })
      }
    } catch (error) {
      setTestResult({
        status: 'error',
        message: '连接测试失败: ' + (error instanceof Error ? error.message : '未知错误')
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeading 
        title="后台管理" 
        subtitle="系统管理和维护工具"
      />
      
      <div className="grid gap-6 mt-8">
        {/* 数据库连接测试 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">数据库连接测试</h2>
          <p className="text-gray-600 mb-4">
            点击下方按钮测试与Supabase数据库的连接状态
          </p>
          
          <Button 
            onClick={testDatabaseConnection}
            disabled={testResult.status === 'loading'}
            className="mb-4"
          >
            {testResult.status === 'loading' ? '测试中...' : '测试数据库连接'}
          </Button>
          
          {testResult.message && (
            <div className={`p-4 rounded-md ${
              testResult.status === 'success' ? 'bg-green-50 border border-green-200' :
              testResult.status === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <h3 className={`font-medium ${
                testResult.status === 'success' ? 'text-green-800' :
                testResult.status === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                测试结果
              </h3>
              <p className={`mt-1 ${
                testResult.status === 'success' ? 'text-green-700' :
                testResult.status === 'error' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {testResult.message}
              </p>
              
              {testResult.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    查看详细信息
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
        
        {/* 其他管理功能占位 */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">系统信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">应用版本:</span> 0.1.0
            </div>
            <div>
              <span className="font-medium">数据库:</span> Supabase
            </div>
            <div>
              <span className="font-medium">框架:</span> Next.js 14.2.5
            </div>
            <div>
              <span className="font-medium">部署环境:</span> {process.env.NODE_ENV || 'development'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
