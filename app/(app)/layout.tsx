'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { BottomNav } from '@/components/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useAppStore(s => s.user)
  const isInitialised = useAppStore(s => s.isInitialised)
  const router = useRouter()

  useEffect(() => {
    if (isInitialised && !user) {
      router.replace('/login')
    }
  }, [user, isInitialised, router])

  if (!isInitialised) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center">
        <div className="text-5xl animate-pulse">🌸</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <main className="pb-20 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
