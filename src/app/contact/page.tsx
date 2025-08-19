export default function Contact() {
  return (
    <div className="card">
      <h1 className="text-2xl font-bold mb-2">聯絡我們 / Contact</h1>
      <p className="text-gray-600">地址 / 電話 / Email / Google Map</p>
      <form className="mt-4 grid gap-3 max-w-md">
        <input className="border rounded px-3 py-2" placeholder="姓名 / Name" />
        <input className="border rounded px-3 py-2" placeholder="Email" />
        <textarea className="border rounded px-3 py-2" placeholder="留言 / Message" rows={4} />
        <button className="btn btn-primary w-full">送出 / Send</button>
      </form>
    </div>
  )
}
