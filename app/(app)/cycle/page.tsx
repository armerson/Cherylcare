'use client'
import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { deleteCycleEntry, getCycleEntries, saveCycleEntry } from '@/services/firestore'
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameMonth, parseISO, startOfMonth } from 'date-fns'
import { getPhaseForDate } from '@/utils/cycleCalculations'
import type { CycleEntry } from '@/types'

const PHASE_COLORS: Record<string, string> = {
  menstrual: '#FAEEF2',
  follicular: '#EEF4FA',
  ovulatory: '#EEF9F4',
  luteal: '#FAF6EE',
}

export default function CyclePage() {
  const user = useAppStore(s => s.user)
  const currentCycleDay = useAppStore(s => s.currentCycleDay)
  const nextPeriodDate = useAppStore(s => s.nextPeriodDate)
  const settings = useAppStore(s => s.settings)

  const [showModal, setShowModal] = useState(false)
  const [periodDate, setPeriodDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()))
  const [cycleEntries, setCycleEntries] = useState<CycleEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(true)
  const [entryToDelete, setEntryToDelete] = useState<CycleEntry | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEntries = useCallback(async () => {
    if (!user) return
    setLoadingEntries(true)
    try {
      const entries = await getCycleEntries(user.uid, 24)
      setCycleEntries(entries.filter(entry => entry.type === 'period_start'))
    } catch {
      setError('Cycle history could not be loaded. Please try again.')
    } finally {
      setLoadingEntries(false)
    }
  }, [user])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const today = new Date()
  const monthStart = startOfMonth(visibleMonth)
  const monthEnd = endOfMonth(visibleMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)
  const avgLength = settings?.averageCycleLength ?? 28

  const handleLogPeriod = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      await saveCycleEntry(user.uid, {
        startDate: periodDate,
        type: 'period_start',
      })
      await loadEntries()
      setShowModal(false)
    } catch {
      setError('That period date could not be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePeriod = async () => {
    if (!user || !entryToDelete) return
    setDeleting(true)
    setError(null)
    try {
      await deleteCycleEntry(user.uid, entryToDelete.id)
      setCycleEntries(entries => entries.filter(entry => entry.id !== entryToDelete.id))
      setEntryToDelete(null)
    } catch {
      setError('That period date could not be deleted. Please try again.')
    } finally {
      setDeleting(false)
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

      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="bg-white rounded-3xl p-4 border border-[#F0E8E2] mb-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setVisibleMonth(month => addMonths(month, -1))}
            aria-label="Show previous month"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E4CCD5] text-2xl font-semibold text-[#9A5F73]"
          >
            ‹
          </button>
          <div className="text-center">
            <p className="font-semibold text-gray-700">{format(visibleMonth, 'MMMM yyyy')}</p>
            {!isSameMonth(visibleMonth, today) && (
              <button
                type="button"
                onClick={() => setVisibleMonth(startOfMonth(new Date()))}
                className="mt-0.5 text-xs font-semibold text-[#9A5F73] underline underline-offset-2"
              >
                Return to this month
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setVisibleMonth(month => addMonths(month, 1))}
            aria-label="Show next month"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E4CCD5] text-2xl font-semibold text-[#9A5F73]"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dateString = format(day, 'yyyy-MM-dd')
            const isToday = dateString === format(today, 'yyyy-MM-dd')
            const phase = getPhaseForDate(day, cycleEntries, avgLength)
            const isLoggedPeriod = cycleEntries.some(entry =>
              dateString >= entry.startDate && dateString <= (entry.endDate ?? entry.startDate),
            )
            const bgColor = isLoggedPeriod ? '#F4C7D5' : phase ? PHASE_COLORS[phase] : undefined

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square flex items-center justify-center rounded-full text-sm
                  ${isToday ? 'ring-2 ring-[#C4849B] font-bold text-[#C4849B]' : 'text-gray-700'}`}
                style={{ backgroundColor: bgColor }}
                title={isLoggedPeriod ? 'Logged period' : phase ?? undefined}
              >
                {format(day, 'd')}
              </div>
            )
          })}
        </div>
      </div>

      <section className="mt-5 rounded-3xl border border-[#F0E8E2] bg-white p-4">
        <h2 className="font-semibold text-gray-800">Saved period dates</h2>
        <p className="mt-1 text-xs text-gray-500">Delete a date here if it was added by mistake.</p>
        {loadingEntries ? (
          <p className="py-5 text-center text-sm text-gray-400">Loading…</p>
        ) : cycleEntries.length === 0 ? (
          <p className="py-5 text-center text-sm text-gray-500">No period dates saved yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-gray-100">
            {cycleEntries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between gap-3 py-3">
                <p className="text-sm font-medium text-gray-800">
                  {format(parseISO(entry.startDate), 'd MMMM yyyy')}
                </p>
                <button
                  type="button"
                  onClick={() => setEntryToDelete(entry)}
                  className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

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

      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => !deleting && setEntryToDelete(null)}>
          <div className="mx-auto w-full max-w-lg rounded-t-3xl bg-white p-6" onClick={event => event.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-800">Delete this period date?</h2>
            <p className="mt-2 text-sm text-gray-600">
              {format(parseISO(entryToDelete.startDate), 'd MMMM yyyy')} will be removed from cycle history. This cannot be undone.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setEntryToDelete(null)}
                className="rounded-2xl border border-gray-200 py-3 font-semibold text-gray-700 disabled:opacity-60"
              >
                Keep date
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeletePeriod}
                className="rounded-2xl bg-red-600 py-3 font-semibold text-white disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete date'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
