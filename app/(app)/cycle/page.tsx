'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { saveCycleEntry } from '@/services/firestore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { calculateCycleDay, calculateCyclePhase } from '@/utils/cycleCalculations'

const PHASE_COLORS: Record<string, string> = {
  menstrual: '#FAEEF2',
  follicular: '#EEF4FA',
  ovulatory: '#EEF9F4',
  luteal: '#FAF6EE',
}

export default function CyclePage() {
  const user = useAppStore(s => s.user)
  const currentCycle = useAppStore(s => s.currentCycle)
  const currentCycleDay = useAppStore(s => s.currentCycleDay)
  const nextPeriodDate = useAppStore(s => s.nextPeriodDate)
  const settings = useAppStore(s => s.settings)

  const [showModal, setShowModal] = useState(false)
  const [periodDate, setPeriodDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)

  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)
  const avgLength = settings?.averageCycleLength ?? 28

  const handleLogPeriod = async () => {
    if (!user) return
    setSaving(true)
    try {
      await saveCycleEntry(user.uid, {
        startDate: periodDate,
        type: 'period_start',
      })
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cycle Tracking</h1>
          <p className="text-gray-500 text-sm">
            {currentCycleDay ? `Day ${currentCycleDay} of your cycle` : 'Log your first period to start'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#C4849B] text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          Log Period
        </button>
      </div>

      {nextPeriodDate && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 mb-4">
          <p className="text-[#C4849B] font-semibold text-sm">Next period expected</p>
          <p className="text-gray-700 font-medium">
            {nextPeriodDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
          </p>
        </div>
      )}

      <div className="bg-white rounded-3xl p-4 border border-[#F0E8E2] mb-4">
        <p className="font-semibold text-gray-700 mb-3 text-center">{format(today, 'MMMM yyyy')}</p>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
            const phase = currentCycle?.startDate
              ? calculateCyclePhase(calculateCycleDay(currentCycle.startDate, day), avgLength)
              : null
            const bgColor = phase ? PHASE_COLORS[phase] : undefined

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square flex items-center justify-center rounded-full text-sm
                  ${isToday ? 'ring-2 ring-[#C4849B] font-bold text-[#C4849B]' : 'text-gray-700'}`}
                style={{ backgroundColor: bgColor }}
              >
                {format(day, 'd')}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(PHASE_COLORS).map(([phase, color]) => (
          <div key={phase} className="flex items-center gap-2 bg-white rounded-xl p-3 border border-[#F0E8E2]">
            <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-600 capitalize">{phase}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white w-full max-w-lg mx-auto rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Log Period Start</h2>
            <p className="text-sm text-gray-500 mb-3">When did your period start?</p>
            <input
              type="date"
              value={periodDate}
              onChange={e => setPeriodDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#F0E8E2] mb-4 text-gray-800"
            />
            <button
              onClick={handleLogPeriod}
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-[#C4849B] text-white font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Log Period'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
