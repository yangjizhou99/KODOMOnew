'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link className="px-3 py-2 hover:underline" href={href}>{children}</Link>
)

export default function Navbar() {
  const pathname = usePathname()
  const search = useSearchParams()
  const lang = search.get('lang') || 'zh-TW'
  const withLang = (p: string) => `${p}?lang=${lang}`

  const items = useMemo(() => [
    { href: withLang('/'), label: lang === 'en' ? 'Home' : '首頁' },
    { href: withLang('/menu'), label: lang === 'en' ? 'Menu' : '菜單' },
    { href: withLang('/member'), label: lang === 'en' ? 'Member' : '會員' },
    { href: withLang('/news'), label: lang === 'en' ? 'News' : '最新消息' },
    { href: withLang('/contact'), label: lang === 'en' ? 'Contact' : '聯絡我們' },
    { href: withLang('/admin'), label: lang === 'en' ? 'Admin' : '後台' },
  ], [lang])

  return (
    <nav className="w-full border-b">
      <div className="container flex items-center justify-between h-14">
        <Link className="font-bold" href={withLang('/')}>Kodomo 2.0</Link>
        <div className="flex items-center">
          {items.map(i => <NavLink key={i.href} href={i.href}>{i.label}</NavLink>)}
          <LangSwitcher />
        </div>
      </div>
    </nav>
  )
}

function LangSwitcher() {
  const pathname = usePathname()
  const search = useSearchParams()
  const lang = search.get('lang') || 'zh-TW'
  const other = lang === 'en' ? 'zh-TW' : 'en'
  const sp = new URLSearchParams(search.toString())
  sp.set('lang', other)
  const href = `${pathname}?${sp.toString()}`
  return (
    <Link href={href} className="ml-2 text-sm border rounded px-2 py-1">
      {lang === 'en' ? '中文' : 'EN'}
    </Link>
  )
}
