'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import clsx from 'clsx'

const tabs = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/check-in', label: 'Check In', icon: '✍️' },
  { href: '/cycle', label: 'Cycle', icon: '🌙' },
  { href: '/insights', label: 'Insights', icon: '💡' },
  { href: '/more', label: 'More', icon: '☰' },
]

export function BottomNav() {
  const pathname = usePathname()
  const unreadInsights = useAppStore(s => s.unreadInsights)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0E8E2] flex z-40">
      {tabs.map(tab => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              'flex-1 flex flex-col items-center py-2 px-1 text-xs transition-colors',
              active ? 'text-[#C4849B]' : 'text-gray-400',
            )}
          >
            <div className="relative">
              <span className="text-xl">{tab.icon}</span>
              {tab.href === '/insights' && unreadInsights > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C4849B] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadInsights > 9 ? '9+' : unreadInsights}
                </span>
              )}
            </div>
            <span className="mt-0.5 leading-none">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
