'use client'
import { useState } from 'react'

export default function ContactForm({ lang = 'zh-TW' }: { lang?: 'zh-TW'|'en' }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '', website: '' // website = 蜜罐
  })
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState<null | { id?: string }>(null)
  const [err, setErr] = useState<string | null>(null)

  const t = (zh: string, en: string) => (lang === 'en' ? en : zh)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setErr(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'submit failed')
      setOk({ id: json.id })
      setForm({ name: '', email: '', phone: '', subject: '', message: '', website: '' })
    } catch (e: any) {
      setErr(e.message || 'failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold">{t('聯絡表單', 'Contact Form')}</h2>

      {/* 蜜罐字段：对用户隐藏，对机器人可见（不要使用 hidden 属性，避免被忽略） */}
      <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden>
        <label>Website
          <input value={form.website} onChange={e=>setForm({ ...form, website: e.target.value })} />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div>
          <label className="text-sm text-gray-600">{t('姓名*', 'Name*')}</label>
          <input className="border rounded-xl px-3 py-2 w-full"
            required
            value={form.name}
            onChange={e=>setForm({ ...form, name: e.target.value })}
            placeholder={t('請輸入姓名', 'Your name')}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">{t('Email', 'Email')}</label>
          <input className="border rounded-xl px-3 py-2 w-full" type="email"
            value={form.email}
            onChange={e=>setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">{t('電話', 'Phone')}</label>
          <input className="border rounded-xl px-3 py-2 w-full"
            value={form.phone}
            onChange={e=>setForm({ ...form, phone: e.target.value })}
            placeholder="+81 ..."
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">{t('主題', 'Subject')}</label>
          <input className="border rounded-xl px-3 py-2 w-full"
            value={form.subject}
            onChange={e=>setForm({ ...form, subject: e.target.value })}
            placeholder={t('想諮詢的主題', 'What is it about?')}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">{t('留言*', 'Message*')}</label>
          <textarea className="border rounded-xl px-3 py-2 w-full" rows={5} required
            minLength={5}
            value={form.message}
            onChange={e=>setForm({ ...form, message: e.target.value })}
            placeholder={t('請輸入留言內容', 'Write your message')}
          />
        </div>
      </div>

      {err && <div className="mt-3 text-red-600 text-sm">{err}</div>}
      {ok && (
        <div className="mt-3 text-green-600 text-sm">
          {t('已收到您的留言，我們會盡快回覆。', 'Thanks! We\'ll get back to you soon.')}
        </div>
      )}

      <div className="mt-4">
        <button className="btn btn-primary" disabled={loading}>
          {loading ? t('送出中…', 'Sending…') : t('送出', 'Send')}
        </button>
      </div>
    </form>
  )
}
