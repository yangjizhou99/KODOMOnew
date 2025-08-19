'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export type Field =
  | { key: string; label: string; type: 'text'; required?: boolean }
  | { key: string; label: string; type: 'number'; required?: boolean }
  | { key: string; label: string; type: 'boolean' }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; required?: boolean }
  | { key: string; label: string; type: 'datetime' }

export default function CrudTable({
  entity, columns, createDefaults = {}, extraHint
}: {
  entity: 'products'|'categories'|'news'|'coupons',
  columns: Field[],
  createDefaults?: Record<string, any>,
  extraHint?: React.ReactNode
}) {
  const [items, setItems] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, any>>(createDefaults)
  const [loading, setLoading] = useState(false)

  const fetchList = async (p = page) => {
    if (!supabase) { alert('Supabase not configured'); return }
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`/api/admin/${entity}?q=${encodeURIComponent(q)}&page=${p}&pageSize=${pageSize}`, {
      headers: { Authorization: `Bearer ${session?.access_token}` }
    })
    const json = await res.json()
    if (res.ok) { setItems(json.items || []); setTotal(json.total || 0); setPage(json.page || 1) }
    else alert(json.error || 'load error')
  }

  useEffect(() => { fetchList(1) }, []) // init

  const startCreate = () => { setEditing(null); setForm(createDefaults); setOpen(true) }
  const startEdit = (row: any) => { setEditing(row); setForm({ ...row }); setOpen(true) }

  const save = async () => {
    setLoading(true)
    try {
      if (!supabase) { alert('Supabase not configured'); return }
      const { data: { session } } = await supabase.auth.getSession()
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }
      let res: Response
      if (editing) res = await fetch(`/api/admin/${entity}/${editing.id}`, { method: 'PUT', headers, body: JSON.stringify(form) })
      else res = await fetch(`/api/admin/${entity}`, { method: 'POST', headers, body: JSON.stringify(form) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'save error')
      setOpen(false)
      await fetchList()
    } catch (e: any) {
      alert(e.message)
    } finally { setLoading(false) }
  }

  const del = async (row: any) => {
    if (!confirm('確認刪除？')) return
    if (!supabase) { alert('Supabase not configured'); return }
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`/api/admin/${entity}/${row.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.access_token}` }
    })
    const json = await res.json()
    if (!res.ok) alert(json.error || 'delete error')
    else fetchList()
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-wrap gap-2 items-center">
          <input className="border rounded-xl px-3 py-2" placeholder="搜尋…" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn btn-outline" onClick={() => fetchList(1)}>搜尋</button>
          <div className="grow" />
          <button className="btn btn-primary" onClick={startCreate}>新增</button>
        </div>
        {extraHint ? <div className="text-xs text-gray-500 mt-2">{extraHint}</div> : null}
      </div>

      <div className="rounded-2xl border overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(c => <th key={c.key} className="text-left px-3 py-2 whitespace-nowrap">{c.label}</th>)}
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.id} className="border-t">
                {columns.map(c => (
                  <td key={c.key} className="px-3 py-2 whitespace-nowrap">
                    {renderCell(row[c.key], c.type)}
                  </td>
                ))}
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button className="text-blue-600 mr-3" onClick={() => startEdit(row)}>編輯</button>
                  <button className="text-red-600" onClick={() => del(row)}>刪除</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={columns.length + 1}>沒有資料</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_,i)=>i+1).map(p=>(
            <button key={p} className={`px-3 py-1 rounded border ${p===page?'bg-black text-white border-black':''}`} onClick={()=>{ setPage(p); fetchList(p) }}>{p}</button>
          ))}
        </div>
      )}

      {/* 抽屉/模态 */}
      <div className={`fixed inset-0 z-50 ${open?'':'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity ${open?'opacity-100':'opacity-0'}`} onClick={()=>setOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl transition-transform ${open?'translate-x-0':'translate-x-full'}`}>
          <div className="p-4 border-b font-semibold">{editing ? '編輯' : '新增'}</div>
          <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-120px)]">
            {columns.map(f => (
              <div key={f.key}>
                <label className="text-sm text-gray-600">{f.label}</label>
                {renderInput(f, form[f.key], (v)=>setForm(prev => ({ ...prev, [f.key]: v })))}
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex gap-2 justify-end">
            <button className="btn btn-outline" onClick={()=>setOpen(false)}>取消</button>
            <button className="btn btn-primary" disabled={loading} onClick={save}>{loading?'儲存中…':'儲存'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderCell(v: any, type: Field['type']) {
  if (type === 'boolean') return v ? '✓' : '—'
  if (type === 'datetime') return v ? new Date(v).toLocaleString() : ''
  if (type === 'number') return v ?? 0
  return (v ?? '').toString().slice(0, 80)
}

function renderInput(f: Field, value: any, onChange: (v:any)=>void) {
  const base = 'border rounded-xl px-3 py-2 w-full'
  switch (f.type) {
    case 'text':
      return <input className={base} value={value || ''} required={f.required} onChange={e=>onChange(e.target.value)} />
    case 'number':
      return <input className={base} type="number" value={value ?? ''} required={f.required} onChange={e=>onChange(e.target.value===''?null:Number(e.target.value))} />
    case 'boolean':
      return (
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={!!value} onChange={e=>onChange(e.target.checked)} />
          <span>{value ? '是' : '否'}</span>
        </div>
      )
    case 'select':
      return (
        <select className={base} value={value ?? ''} required={f.required} onChange={e=>onChange(e.target.value)}>
          <option value="">— 請選擇 —</option>
          {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    case 'datetime':
      const toLocal = (s:any) => s ? new Date(s).toISOString().slice(0,16) : ''
      return <input className={base} type="datetime-local" value={toLocal(value)} onChange={e=>onChange(e.target.value?new Date(e.target.value).toISOString():null)} />
  }
}
