'use client'
import CrudTable, { type Field } from '../../../components/admin/CrudTable'

export default function AdminTeamPage() {
  const columns: Field[] = [
    { key: 'name_zh', label: '姓名(中)', type: 'text', required: true },
    { key: 'name_en', label: '姓名(英)', type: 'text', required: true },
    { key: 'role_zh', label: '職務(中)', type: 'text' },
    { key: 'role_en', label: '職務(英)', type: 'text' },
    { key: 'bio_zh', label: '簡介(中)', type: 'text' },
    { key: 'bio_en', label: '簡介(英)', type: 'text' },
    { key: 'photo', label: '照片URL', type: 'text' },
    { key: 'sort_order', label: '排序', type: 'number' },
    { key: 'is_active', label: '啟用', type: 'boolean' },
  ]
  return (
    <CrudTable
      entity="team"
      columns={columns}
      createDefaults={{ is_active: true, sort_order: 0 }}
      extraHint={<div>建議填寫中/英名稱與職務，照片URL可指向上傳的圖片地址。</div>}
    />
  )
}


