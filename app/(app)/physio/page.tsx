'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getPhysioSessions } from '@/services/firestore'
import { formatDayDate } from '@/utils/dateHelpers'
import type { PhysioSession } from '@/types'

export default function PhysioPage() {
  const user = useAppStore(s => s.user)
  const [sessions, setSessions] = useState<PhysioSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getPhysioSessions(user.uid, 10).then(s => {
      setSessions(s)
      setLoading(false)
    })
  }, [user])

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Physio</h1>
        <p className="text-gray-500 text-sm mt-1">Exercise & recovery tracking</p>
      </div>

      {loading && <div className="text-center py-8 text-3xl animate-pulse">🏃‍♀️</div>}

      {!loading && sessions.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-[#F0E8E2] text-center">
          <div className="text-5xl mb-3">🏃‍♀️</div>
          <p className="font-semibold text-gray-700">No sessions yet</p>
          <p className="text-gray-500 text-sm mt-2">Full physio session logging coming in the next update.</p>
        </div>
      )}

      <div className="space-y-3">
        {sessions.map(session => (
          <div key={session.id} className="bg-white rounded-2xl p-4 border border-[#F0E8E2]">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-800">{formatDayDate(session.date)}</p>
                <p className="text-xs text-gray-500">
                  {session.exercises.length} exercises · {session.durationMinutes} min
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#C4849B]">RPE {session.overallExertion}/10</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
