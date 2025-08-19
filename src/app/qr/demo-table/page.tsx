import Link from 'next/link'

export default function QRDemoTablePage() {
  return (
    <div className="space-y-6">
      <div className="card text-center">
        <h1 className="text-2xl font-bold mb-4">掃碼點餐 / QR Order</h1>
        <p className="text-gray-600 mb-4">桌號：Demo Table</p>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            🚧 此功能正在開發中... / Feature under development...
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="card">
          <h2 className="font-semibold mb-3">快速點餐 / Quick Order</h2>
          <p className="text-gray-600 mb-4">
            掃描桌上QR碼即可開始點餐，無需下載APP
          </p>
          <Link href="/menu" className="btn btn-primary inline-block">
            前往菜單 / View Menu
          </Link>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">功能說明 / Features</h2>
          <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600">
            <li>掃碼即可點餐，無需註冊</li>
            <li>即時查看菜單和價格</li>
            <li>支援多種付款方式</li>
            <li>訂單狀態即時更新</li>
          </ul>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">其他選項 / Other Options</h2>
          <div className="flex gap-3">
            <Link href="/member" className="btn">
              會員儲值 / Wallet
            </Link>
            <Link href="/contact" className="btn">
              聯絡我們 / Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
