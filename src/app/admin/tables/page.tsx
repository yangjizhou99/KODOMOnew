'use client'
import CrudTable, { type Field } from '../../../components/admin/CrudTable'
import Link from 'next/link'

export default function AdminTablesPage() {
  const columns: Field[] = [
    { key: 'name', label: '桌位名稱', type: 'text', required: true },
    { key: 'qrcode_token', label: 'QR Token', type: 'text', required: true },
    { key: 'location', label: '位置', type: 'text' },
  ]

  return (
    <CrudTable
      entity="tables"
      columns={columns}
      createDefaults={{}}
      extraHint={<span className="text-xs">QR Token 將用於生成掃碼網址：/qr/[token]</span>}
      renderRowActions={(row:any)=> (
        <>
          <Link className="text-green-600" href={`/qr/${encodeURIComponent(row.qrcode_token)}`} target="_blank">打開點餐頁</Link>
        </>
      )}
    />
  )
}


