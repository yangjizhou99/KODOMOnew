export default function Member() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="font-semibold mb-2">儲值餘額 / Wallet Balance</h2>
        <div className="text-3xl font-bold">$0.00</div>
      </div>
      <div className="card">
        <h2 className="font-semibold mb-2">我的優惠券 / My Coupons</h2>
        <p className="text-gray-600 text-sm">尚無資料</p>
      </div>
    </div>
  )
}
