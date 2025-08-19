import 'server-only'
import { supabaseAdmin } from './supabaseAdmin'

export type StaffInfo = { id: string; email?: string | null; role: 'member'|'cashier'|'kitchen'|'admin' }

export async function requireStaffFromAuthHeader(req: Request, minRole: 'staff'|'admin'='staff'): Promise<StaffInfo> {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) throw Object.assign(new Error('Unauthorized'), { status: 401 })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) throw Object.assign(new Error('Unauthorized'), { status: 401 })

  // 读 public.users（service role 可读）
  const { data: u } = await supabaseAdmin.from('users').select('id,email,role').eq('id', user.id).maybeSingle()
  const role = (u?.role || 'member') as StaffInfo['role']
  const isStaff = role === 'admin' || role === 'cashier' || role === 'kitchen'
  if (minRole === 'staff' && !isStaff) throw Object.assign(new Error('Forbidden'), { status: 403 })
  if (minRole === 'admin' && role !== 'admin') throw Object.assign(new Error('Forbidden'), { status: 403 })
  return { id: user.id, email: u?.email || user.email, role }
}
