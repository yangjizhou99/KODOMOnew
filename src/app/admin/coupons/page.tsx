'use client'
import CrudTable, { type Field } from '../../../components/admin/CrudTable'

export default function AdminCouponsPage() {
  const columns: Field[] = [
    { key: 'code', label: '代碼', type: 'text', required: true },
    { key: 'title_zh', label: '標題(中)', type: 'text' },
    { key: 'title_en', label: '標題(英)', type: 'text' },
    { key: 'desc_zh', label: '說明(中)', type: 'text' },
    { key: 'desc_en', label: '說明(英)', type: 'text' },
    { key: 'type', label: '種類', type: 'select', options: [{value:'percent',label:'折扣(%)'},{value:'fixed',label:'固定減免'},{value:'gift',label:'贈品/抵扣'}], required: true },
    { key: 'value', label: '數值(百分比或金額分)', type: 'number', required: true },
    { key: 'min_spend_cents', label: '最低消費(分)', type: 'number' },
    { key: 'starts_at', label: '開始', type: 'datetime' },
    { key: 'ends_at', label: '結束', type: 'datetime' },
    { key: 'is_active', label: '啟用', type: 'boolean' },
  ]
  return (
    <CrudTable
      entity="coupons"
      columns={columns}
      createDefaults={{ is_active: true, type: 'percent', value: 10 }}
      extraHint={<span className="text-xs">百分比請填整數（例：10=10%）；固定金額請填「分」。</span>}
    />
  )
}
