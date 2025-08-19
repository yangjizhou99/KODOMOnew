'use client'
import CrudTable, { type Field } from '../../../components/admin/CrudTable'

export default function AdminNewsPage() {
  const columns: Field[] = [
    { key: 'title_zh', label: '標題(中)', type: 'text', required: true },
    { key: 'title_en', label: '標題(英)', type: 'text' },
    { key: 'excerpt_zh', label: '摘要(中)', type: 'text' },
    { key: 'excerpt_en', label: '摘要(英)', type: 'text' },
    { key: 'cover_url', label: '封面URL', type: 'text' },
    { key: 'status', label: '狀態', type: 'select', options: [{value:'draft',label:'草稿'},{value:'published',label:'發布'}], required: true },
    { key: 'published_at', label: '發布時間', type: 'datetime' },
  ]
  return (
    <CrudTable
      entity="news"
      columns={columns}
      createDefaults={{ status: 'draft', published_at: new Date().toISOString() }}
      extraHint={<span className="text-xs">發布後才會出現在前台列表；未填發布時間則按建立時間排序。</span>}
    />
  )
}
