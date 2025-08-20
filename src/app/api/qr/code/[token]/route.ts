import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export const runtime = 'nodejs' // 需要 Node 运行时

function absUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  return base.replace(/\/$/, '') + path
}

/**
 * GET /api/qr/code/:token[?mode=home|direct][&fmt=svg|png]
 * mode=home   -> 扫码先到首页，URL 携带 ?qr=token，点击"扫码点餐"再进桌位
 * mode=direct -> 扫码直接进 /qr/:token（无需再点一次）
 * 默认 fmt=svg（清晰可打印），可改 fmt=png
 */
export async function GET(req: Request, { params }: { params: { token: string }}) {
  try {
    const url = new URL(req.url)
    const mode = (url.searchParams.get('mode') || 'home') as 'home'|'direct'
    const fmt = (url.searchParams.get('fmt') || 'svg') as 'svg'|'png'
    const token = params.token

    const target = mode === 'direct'
      ? absUrl(`/qr/${encodeURIComponent(token)}`)
      : absUrl(`/?qr=${encodeURIComponent(token)}`)

    if (fmt === 'png') {
      const buf = await QRCode.toBuffer(target, { margin: 1, width: 1024 })
      return new NextResponse(buf, {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' }
      })
    }

    const svg = await QRCode.toString(target, { type: 'svg', margin: 1, width: 1024 })
    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'qr error' }, { status: 500 })
  }
}
