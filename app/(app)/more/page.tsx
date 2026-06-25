'use client'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { signOut } from '@/services/auth'
import { useRouter } from 'next/navigation'

const MENU_ITEMS = [
  { href: '/pmdd', label: 'PMDD Tracking', icon: '🧠', desc: 'Track late luteal symptoms' },
  { href: '/hypermobility', label: 'Joint Health', icon: '🦴', desc: 'Log hypermobility symptoms' },
  { href: '/medications', label: 'Medications', icon: '💊', desc: 'Track supplements & meds' },
  { href: '/physio', label: 'Physio', icon: '🏃‍♀️', desc: 'Exercise & recovery logging' },
  { href: '/nutrition', label: 'Nutrition', icon: '🥗', desc: 'Water, protein & sleep' },
  { href: '/settings', label: 'Settings', icon: '⚙️', desc: 'Preferences & reminders' },
]

export default function MorePage() {
  const profile = useAppStore(s => s.profile)
  const setUser = useAppStore(s => s.setUser)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    router.replace('/login')
  }

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">More</h1>
        {(profile?.name || profile?.displayName) && (
          <p className="text-gray-500 text-sm">Hi {profile.name || profile.displayName}</p>
        )}
      </div>

      <div className="space-y-2 mb-8">
        {MENU_ITEMS.map(item => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white rounded-2xl p-4 border border-[#F0E8E2] flex items-center gap-4 active:bg-gray-50 transition-colors">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={handleSignOut}
        className="w-full py-3 rounded-2xl border border-red-200 text-red-500 font-medium text-sm active:bg-red-50 transition-colors"
      >
        Sign Out
      </button>
    </div>
  )
}
