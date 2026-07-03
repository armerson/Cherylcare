'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getRecentCheckIns, getRecentPMDDLogs, getRecentHypermobilityLogs } from '@/services/firestore'
import { formatDate } from '@/utils/dateHelpers'
import type { DailyCheckIn, PMDDLog, HypermobilityLog } from '@/types'

export default function ExportPage() {
  const user = useAppStore(s => s.user)
  const profile = useAppStore(s => s.profile)
  const currentCycleDay = useAppStore(s => s.currentCycleDay)
  const currentCyclePhase = useAppStore(s => s.currentCyclePhase)
  const nextPeriodDate = useAppStore(s => s.nextPeriodDate)

  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([])
  const [pmddLogs, setPmddLogs] = useState<PMDDLog[]>([])
  const [hypermobilityLogs, setHypermobilityLogs] = useState<HypermobilityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getRecentCheckIns(user.uid, 30),
      getRecentPMDDLogs(user.uid, 30),
      getRecentHypermobilityLogs(user.uid, 30),
    ]).then(([ci, pmdd, hm]) => {
      setCheckIns([...ci].sort((a, b) => b.date.localeCompare(a.date)))
      setPmddLogs([...pmdd].sort((a, b) => b.date.localeCompare(a.date)))
      setHypermobilityLogs([...hm].sort((a, b) => b.date.localeCompare(a.date)))
      setLoading(false)
    })
  }, [user])

  const avg = (vals: number[]) =>
    vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '–'

  const avgMood = avg(checkIns.map(c => c.mood))
  const avgPain = avg(checkIns.map(c => c.painLevel))
  const avgFatigue = avg(checkIns.map(c => c.fatigue))
  const avgStress = avg(checkIns.map(c => c.stress))
  const avgSleep = avg(checkIns.map(c => c.sleepQuality))

  if (loading) return <div className="px-4 pt-8 text-center text-3xl animate-pulse">📋</div>

  return (
    <div className="px-4 pt-8 pb-8" id="export-content">
      <div className="flex justify-between items-start mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Health Summary</h1>
          <p className="text-gray-500 text-sm mt-1">For your doctor appointment</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-[#C4849B] text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="hidden print:block mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">CherylCare — Health Summary</h1>
        <p className="text-gray-500 text-sm">
          {profile?.name || profile?.displayName} · Generated {formatDate(new Date())}
        </p>
      </div>

      <div className="bg-pink-50 rounded-2xl p-4 border border-pink-200 mb-4">
        <p className="font-semibold text-[#C4849B] mb-2">Cycle Overview</p>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
          <div><span className="text-gray-500">Current phase: </span>{currentCyclePhase ?? '–'}</div>
          <div><span className="text-gray-500">Cycle day: </span>{currentCycleDay ?? '–'}</div>
          {nextPeriodDate && (
            <div className="col-span-2">
              <span className="text-gray-500">Next period expected: </span>
              {nextPeriodDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-[#F0E8E2] mb-4">
        <p className="font-semibold text-gray-700 mb-3">30-Day Averages ({checkIns.length} check-ins)</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Mood', value: avgMood, max: '/10' },
            { label: 'Pain', value: avgPain, max: '/10' },
            { label: 'Fatigue', value: avgFatigue, max: '/10' },
            { label: 'Stress', value: avgStress, max: '/10' },
            { label: 'Sleep Quality', value: avgSleep, max: '/10' },
          ].map(item => (
            <div key={item.label} className="text-center bg-gray-50 rounded-xl p-3">
              <p className="text-xl font-bold text-[#C4849B]">{item.value}<span className="text-xs text-gray-400">{item.max}</span></p>
              <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {checkIns.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#F0E8E2] mb-4 overflow-hidden">
          <p className="font-semibold text-gray-700 px-4 pt-4 pb-2">Daily Check-ins</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {['Date', 'Mood', 'Pain', 'Fatigue', 'Stress', 'Sleep', 'Notes'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8E2]">
                {checkIns.map(c => (
                  <tr key={c.date}>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{c.date}</td>
                    <td className="px-3 py-2 text-gray-800">{c.mood}/10</td>
                    <td className="px-3 py-2 text-gray-800">{c.painLevel}</td>
                    <td className="px-3 py-2 text-gray-800">{c.fatigue}</td>
                    <td className="px-3 py-2 text-gray-800">{c.stress}</td>
                    <td className="px-3 py-2 text-gray-800">{c.sleepQuality}</td>
                    <td className="px-3 py-2 text-gray-500 max-w-[120px] truncate">{c.notes ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pmddLogs.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-[#F0E8E2] mb-4">
          <p className="font-semibold text-gray-700 mb-2">PMDD Logs ({pmddLogs.length} entries)</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {['irritability', 'anxiety', 'depression', 'bloating', 'fatigue', 'concentration'].map(field => (
              <div key={field} className="bg-purple-50 rounded-xl p-2 text-center">
                <p className="font-bold text-purple-700">
                  {avg(pmddLogs.map(p => (p as unknown as Record<string, number>)[field]).filter(Boolean))}/10
                </p>
                <p className="text-purple-500 capitalize">{field}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {hypermobilityLogs.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-[#F0E8E2] mb-4">
          <p className="font-semibold text-gray-700 mb-2">Joint Health ({hypermobilityLogs.length} entries)</p>
          <p className="text-sm text-gray-600">
            Avg fatigue: {avg(hypermobilityLogs.map(h => h.fatigue))}/10 ·{' '}
            Exercise completed: {hypermobilityLogs.filter(h => h.exerciseCompleted).length} of {hypermobilityLogs.length} days
          </p>
          {hypermobilityLogs.some(h => h.subluxations?.length > 0) && (
            <p className="text-sm text-gray-600 mt-1">
              Subluxations reported on {hypermobilityLogs.filter(h => h.subluxations?.length > 0).length} days
            </p>
          )}
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-4 print:hidden">
        Tap &quot;Print / Save PDF&quot; to share with your doctor
      </p>
    </div>
  )
}
