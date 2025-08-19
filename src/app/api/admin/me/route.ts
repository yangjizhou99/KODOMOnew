import { NextResponse } from 'next/server'
import { requireStaffFromAuthHeader } from '../../../../lib/adminAuth'

export async function GET(req: Request) {
  try {
    const me = await requireStaffFromAuthHeader(req, 'staff')
    return NextResponse.json({ ok: true, me })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: e.status || 500 })
  }
}
