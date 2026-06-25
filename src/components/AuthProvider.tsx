'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { useAppStore } from '@/store/useAppStore'
import { getProfile, getSettings } from '@/services/firestore'

const PUBLIC_PATHS = ['/login', '/signup']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAppStore(s => s.setUser)
  const setInitialised = useAppStore(s => s.setInitialised)
  const setProfile = useAppStore(s => s.setProfile)
  const setSettings = useAppStore(s => s.setSettings)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const [profile, settings] = await Promise.all([
          getProfile(user.uid),
          getSettings(user.uid),
        ])
        setProfile(profile)
        setSettings(settings)
      }
      setInitialised(true)

      if (!user && !PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        router.replace('/login')
      }
      if (user && PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        router.replace('/dashboard')
      }
    })
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
