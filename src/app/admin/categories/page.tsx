'use client'
import CrudTable, { type Field } from '../../../components/admin/CrudTable'

export default function AdminCategoriesPage() {
  const columns: Field[] = [
    { key: 'name_zh', label: '名稱(中)', type: 'text', required: true },
    { key: 'name_en', label: '名稱(英)', type: 'text', required: true },
    { key: 'sort_order', label: '排序', type: 'number' },
    { key: 'is_active', label: '啟用', type: 'boolean' },
  ]
  return <CrudTable entity="categories" columns={columns} createDefaults={{ is_active: true, sort_order: 0 }} />
}
