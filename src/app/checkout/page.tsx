'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { formatMoney } from '@/lib/format'
import { CreditCard, Store, Smartphone } from 'lucide-react'

export default function Checkout() {
  const { items, currency, subtotal_cents, clear, isLoaded } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash' | 'alipay'>('stripe')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const paymentMethods = [
    { 
      id: 'stripe' as const, 
      name: '信用卡支付', 
      name_en: 'Credit Card',
      icon: CreditCard,
      description: '使用 Stripe 安全支付'
    },
    { 
      id: 'cash' as const, 
      name: '到店付款', 
      name_en: 'Pay in Store',
      icon: Store,
      description: '到店现金或刷卡支付'
    },
    { 
      id: 'alipay' as const, 
      name: '支付宝', 
      name_en: 'Alipay',
      icon: Smartphone,
      description: '使用支付宝扫码支付'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // 模拟提交订单
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 清空购物车
      clear()
      
      // 显示成功消息或跳转到成功页面
      alert('订单提交成功！我们会尽快联系您确认详情。')
      
    } catch (error) {
      alert('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold mb-4">載入中...</h1>
          <p className="text-gray-600">正在載入購物車數據</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold mb-4">購物車是空的</h1>
          <p className="text-gray-600 mb-6">請先添加商品到購物車</p>
          <a href="/menu" className="btn btn-primary">瀏覽菜單</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">結帳 / Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 订单详情 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">訂單詳情</h2>
          <div className="card">
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{item.name_zh}</div>
                    <div className="text-sm text-gray-600">x{item.qty}</div>
                  </div>
                  <div className="font-mono">{formatMoney(item.qty * item.price_cents, currency)}</div>
                </div>
              ))}
              <div className="pt-4 flex justify-between items-center text-lg font-semibold">
                <span>總計</span>
                <span>{formatMoney(subtotal_cents, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 付款和客户信息 */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 付款方式选择 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">付款方式</h2>
              <div className="space-y-3">
                {paymentMethods.map(method => {
                  const Icon = method.icon
                  return (
                    <label key={method.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="sr-only"
                      />
                      <div className={`card border-2 transition-colors ${
                        paymentMethod === method.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-gray-600" />
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-gray-600">{method.description}</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* 客户信息 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">聯絡信息</h2>
              <div className="card space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">姓名 *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="input w-full"
                    placeholder="請輸入您的姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">電子郵件 *</label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="input w-full"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">電話號碼 *</label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="input w-full"
                    placeholder="請輸入電話號碼"
                  />
                </div>
                {paymentMethod === 'cash' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">地址 (可選)</label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="input w-full min-h-[80px]"
                      placeholder="如需外送請提供詳細地址"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full h-12 text-lg"
            >
              {isSubmitting ? '處理中...' : `確認訂單 - ${formatMoney(subtotal_cents, currency)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
