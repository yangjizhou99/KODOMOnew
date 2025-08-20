'use client'
import { useState } from 'react'
import { t, Lang } from '../../lib/lang'

export default function QuickActions({ lang, qrToken }: { lang: Lang; qrToken?: string }) {
  const [showQRPrompt, setShowQRPrompt] = useState(false)

  const handleQRClick = (e: React.MouseEvent) => {
    if (!qrToken) {
      e.preventDefault()
      setShowQRPrompt(true)
      // 3秒后自动隐藏提示
      setTimeout(() => setShowQRPrompt(false), 3000)
    }
  }

  const items = [
    { href: `/menu?lang=${lang}`, title: t(lang,'線上購物','Shop Online'), note: t(lang,'快速下單','Fast ordering') },
    { 
      href: `${qrToken ? `/qr/${encodeURIComponent(qrToken)}` : '#'}?lang=${lang}`, 
      title: t(lang,'掃碼點餐','QR Order'), 
      note: t(lang,'內用/外帶','Dine-in/Takeout'),
      onClick: handleQRClick
    },
    { href: `/member?lang=${lang}`, title: t(lang,'會員卡儲值','Top Up Wallet'), note: t(lang,'餘額/紀錄','Balance/History') }
  ]

  return (
    <section className="grid md:grid-cols-3 gap-6">
      {items.map((i) => (
        <a 
          key={i.href} 
          href={i.href} 
          className="card hover:shadow-xl transition-shadow relative"
          onClick={i.onClick}
        >
          <div className="font-semibold">{i.title}</div>
          <div className="text-gray-600 text-sm mt-1">{i.note}</div>
          
          {/* QR提示弹窗 */}
          {showQRPrompt && !qrToken && i.title === t(lang,'掃碼點餐','QR Order') && (
            <div className="absolute inset-0 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center z-10">
              <div className="text-center p-4">
                <div className="text-blue-600 font-semibold mb-2">
                  📱 {t(lang,'請掃描桌上的二維碼','Please scan the QR code on your table')}
                </div>
                <div className="text-blue-500 text-sm">
                  {t(lang,'掃描QR碼即可開始點餐','Scan the QR code to start ordering')}
                </div>
              </div>
            </div>
          )}
        </a>
      ))}
    </section>
  )
}
