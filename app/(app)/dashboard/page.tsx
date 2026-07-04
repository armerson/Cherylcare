'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useCycleInit } from '@/hooks/useCycle'
import { getDailyCheckIn } from '@/services/firestore'
import { getGreeting } from '@/utils/dateHelpers'
import { CYCLE_PHASE_CONFIG } from '@/constants/theme'
import { format, subDays } from 'date-fns'

export default function DashboardPage() {
  const user = useAppStore(s => s.user)
  const profile = useAppStore(s => s.profile)
  const currentCycleDay = useAppStore(s => s.currentCycleDay)
  const currentCyclePhase = useAppStore(s => s.currentCyclePhase)
  const pmddWindowActive = useAppStore(s => s.pmddWindowActive)
  const checkInStreak = useAppStore(s => s.checkInStreak)
  const todayCheckIn = useAppStore(s => s.todayCheckIn)
  const nextPeriodDate = useAppStore(s => s.nextPeriodDate)

  const [missedYesterday, setMissedYesterday] = useState(false)
  const [missedTwoDays, setMissedTwoDays] = useState(false)

  useCycleInit(user?.uid)

  useEffect(() => {
    if (!user) return
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd')
    Promise.all([
      getDailyCheckIn(user.uid, yesterday),
      getDailyCheckIn(user.uid, twoDaysAgo),
    ]).then(([yest, two]) => {
      setMissedYesterday(!yest)
      setMissedTwoDays(!two)
    })
  }, [user])

  const phaseConfig = currentCyclePhase ? CYCLE_PHASE_CONFIG[currentCyclePhase] : null

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <p className="text-gray-500 text-sm">{getGreeting()}</p>
        <h1 className="text-2xl font-bold text-gray-800">
          {profile?.name || profile?.displayName || 'There'} 🌸
        </h1>
      </div>

      {phaseConfig && (
        <div
          className="rounded-3xl p-5 mb-4"
          style={{ backgroundColor: phaseConfig.background }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{phaseConfig.emoji}</span>
            <div>
              <p className="text-xs text-gray-500">Cycle Day {currentCycleDay}</p>
              <p className="text-lg font-semibold text-gray-800">{phaseConfig.label}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">{phaseConfig.shortDescription}</p>
        </div>
      )}

      {!currentCyclePhase && (
        <div className="bg-pink-50 border border-pink-200 rounded-3xl p-5 mb-4">
          <p className="font-semibold text-[#C4849B]">Set up cycle tracking</p>
          <p className="text-sm text-gray-600 mt-1">Log your last period to see your phase and predictions.</p>
          <Link href="/cycle" className="inline-block mt-3 text-sm font-medium text-[#C4849B]">Go to Cycle →</Link>
        </div>
      )}

      {pmddWindowActive && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-4">
          <p className="text-purple-700 font-semibold text-sm">⚠️ PMDD Window Active</p>
          <p className="text-purple-600 text-xs mt-1">You&apos;re in your late luteal phase. Be extra gentle with yourself today.</p>
        </div>
      )}

      {!todayCheckIn ? (
        <Link href="/check-in">
          <div className="bg-[#C4849B] rounded-3xl p-5 mb-4 text-white active:opacity-90 transition-opacity">
            <p className="font-semibold text-lg">How are you feeling today?</p>
            <p className="text-pink-100 text-sm mt-1">Tap to log your daily check-in</p>
          </div>
        </Link>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
          <p className="text-green-700 font-semibold text-sm">✓ Check-in complete</p>
          <p className="text-green-600 text-xs">
            Mood {todayCheckIn.mood}/10 · Pain {todayCheckIn.painLevel}/10 · Streak: {checkInStreak} days
          </p>
        </div>
      )}

      {missedYesterday && (
        <Link href="/check-in?date=yesterday">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-3 active:bg-amber-100 transition-colors">
            <span className="text-xl">📝</span>
            <div className="flex-1">
              <p className="text-amber-800 font-semibold text-sm">Missed yesterday&apos;s check-in</p>
              <p className="text-amber-600 text-xs mt-0.5">Tap to fill it in — takes 30 seconds</p>
            </div>
            <span className="text-amber-400 text-lg">›</span>
          </div>
        </Link>
      )}

      {missedTwoDays && (
        <Link href="/check-in?date=two-days-ago">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-3 active:bg-amber-100 transition-colors">
            <span className="text-xl">📝</span>
            <div className="flex-1">
              <p className="text-amber-800 font-semibold text-sm">Missed check-in 2 days ago</p>
              <p className="text-amber-600 text-xs mt-0.5">Tap to fill it in before it&apos;s too late</p>
            </div>
            <span className="text-amber-400 text-lg">›</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 border border-[#F0E8E2]">
          <p className="text-2xl font-bold text-[#C4849B]">{checkInStreak}</p>
          <p className="text-gray-500 text-xs mt-0.5">Day streak</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#F0E8E2]">
          <p className="text-2xl font-bold text-[#9B84C4]">
            {currentCycleDay ? `Day ${currentCycleDay}` : '–'}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Cycle day</p>
        </div>
      </div>

      {nextPeriodDate && (
        <div className="bg-white rounded-2xl p-4 border border-[#F0E8E2] mb-4">
          <p className="text-xs text-gray-500">Next period expected</p>
          <p className="font-semibold text-gray-800">
            {nextPeriodDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/pmdd', label: 'PMDD Log', icon: '🧠' },
          { href: '/medications', label: 'Medications', icon: '💊' },
          { href: '/physio', label: 'Physio', icon: '🏃‍♀️' },
          { href: '/hypermobility', label: 'Joints', icon: '🦴' },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white rounded-2xl p-4 border border-[#F0E8E2] flex items-center gap-3 active:bg-gray-50">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
