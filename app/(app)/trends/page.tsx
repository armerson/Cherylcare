'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getRecentCheckIns } from '@/services/firestore'
import { calculateCycleDay, calculateCyclePhase } from '@/utils/cycleCalculations'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { DailyCheckIn } from '@/types'

const METRICS = [
  { key: 'mood', label: 'Mood', color: '#C4849B' },
  { key: 'painLevel', label: 'Pain', color: '#E07070' },
  { key: 'fatigue', label: 'Fatigue', color: '#9B84C4' },
  { key: 'stress', label: 'Stress', color: '#D4A84B' },
  { key: 'sleepQuality', label: 'Sleep', color: '#84C4B8' },
] as const

type MetricKey = typeof METRICS[number]['key']

const PHASE_BG: Record<string, string> = {
  menstrual: '#FDE8EF',
  follicular: '#E8F0FD',
  ovulatory: '#E8FDF0',
  luteal: '#F0E8FD',
}

export default function TrendsPage() {
  const user = useAppStore(s => s.user)
  const currentCycle = useAppStore(s => s.currentCycle)
  const settings = useAppStore(s => s.settings)
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(
    new Set<MetricKey>(['mood', 'painLevel', 'fatigue']),
  )

  useEffect(() => {
    if (!user) return
    getRecentCheckIns(user.uid, 30).then(data => {
      setCheckIns([...data].sort((a, b) => a.date.localeCompare(b.date)))
      setLoading(false)
    })
  }, [user])

  const avgLength = settings?.averageCycleLength ?? 28

  const chartData = checkIns.map(c => {
    const phase = currentCycle?.startDate
      ? calculateCyclePhase(calculateCycleDay(currentCycle.startDate, new Date(c.date)), avgLength)
      : null
    return {
      date: c.date.slice(5),
      mood: c.mood,
      painLevel: c.painLevel,
      fatigue: c.fatigue,
      stress: c.stress,
      sleepQuality: c.sleepQuality,
      phase,
      phaseBg: phase ? PHASE_BG[phase] : undefined,
    }
  })

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const averages = METRICS.map(m => {
    const vals = checkIns.map(c => c[m.key]).filter(Boolean)
    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '–'
    return { ...m, avg }
  })

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Trends</h1>
        <p className="text-gray-500 text-sm mt-1">Last 30 days</p>
      </div>

      {loading && <div className="text-center py-12 text-3xl animate-pulse">📈</div>}

      {!loading && checkIns.length < 3 && (
        <div className="bg-white rounded-3xl p-8 border border-[#F0E8E2] text-center mb-4">
          <div className="text-4xl mb-3">📈</div>
          <p className="font-semibold text-gray-700">Not enough data yet</p>
          <p className="text-gray-500 text-sm mt-2">Log at least 3 daily check-ins to see your trends.</p>
        </div>
      )}

      {!loading && checkIns.length >= 3 && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeMetrics.has(m.key)
                    ? 'text-white border-transparent'
                    : 'bg-white text-gray-500 border-[#F0E8E2]'
                }`}
                style={activeMetrics.has(m.key) ? { backgroundColor: m.color, borderColor: m.color } : {}}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-4 border border-[#F0E8E2] mb-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #F0E8E2', fontSize: 12 }}
                  labelStyle={{ color: '#6B7280', marginBottom: 4 }}
                />
                <ReferenceLine y={5} stroke="#F0E8E2" strokeDasharray="3 3" />
                {METRICS.filter(m => activeMetrics.has(m.key)).map(m => (
                  <Line
                    key={m.key}
                    type="monotone"
                    dataKey={m.key}
                    stroke={m.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#F0E8E2] mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">30-day averages</p>
            <div className="grid grid-cols-5 gap-2">
              {averages.map(m => (
                <div key={m.key} className="text-center">
                  <p className="text-lg font-bold" style={{ color: m.color }}>{m.avg}</p>
                  <p className="text-xs text-gray-400">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PHASE_BG).map(([phase, color]) => (
              <div key={phase} className="flex items-center gap-2 p-2 rounded-xl" style={{ backgroundColor: color }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.replace('FD', 'C4').replace('FE', 'A0') }} />
                <span className="text-xs text-gray-600 capitalize">{phase}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
