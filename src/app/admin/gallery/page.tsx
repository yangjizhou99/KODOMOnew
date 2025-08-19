'use client'
import CrudTable, { type Field } from '../../../components/admin/CrudTable'

export default function AdminGalleryPage() {
  const columns: Field[] = [
    { key: 'src', label: '圖片URL', type: 'text', required: true },
    { key: 'title_zh', label: '標題(中)', type: 'text' },
    { key: 'title_en', label: '標題(英)', type: 'text' },
    { key: 'sort_order', label: '排序', type: 'number' },
    { key: 'is_active', label: '啟用', type: 'boolean' },
  ]
  return (
    <CrudTable
      entity="gallery"
      columns={columns}
      createDefaults={{ is_active: true, sort_order: 0 }}
      extraHint={<div>請填寫可訪問的圖片URL，標題可留空。</div>}
    />
  )
}


