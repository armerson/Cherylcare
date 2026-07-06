'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getPhysioSessions, savePhysioSession } from '@/services/firestore'
import { formatDayDate, getTodayDateString } from '@/utils/dateHelpers'
import type { PhysioSession } from '@/types'

export default function PhysioPage() {
  const user = useAppStore(s => s.user)
  const [sessions, setSessions] = useState<PhysioSession[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(getTodayDateString())
  const [duration, setDuration] = useState(30)
  const [exertion, setExertion] = useState(5)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const loadSessions = () => {
    if (!user) return
    getPhysioSessions(user.uid, 10).then(s => {
      setSessions(s)
      setLoading(false)
    })
  }

  useEffect(() => {
    if (!user) return
    loadSessions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const resetForm = () => {
    setDate(getTodayDateString())
    setDuration(30)
    setExertion(5)
    setNotes('')
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await savePhysioSession(user.uid, {
        date,
        exercises: [],
        durationMinutes: duration,
        overallExertion: exertion,
        recoveryNotes: notes || undefined,
      })
      resetForm()
      setShowForm(false)
      setLoading(true)
      loadSessions()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Physio</h1>
          <p className="text-gray-500 text-sm mt-1">Exercise & recovery tracking</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#C4849B] text-white text-sm font-semibold px-4 py-2 rounded-2xl active:opacity-90"
          >
            + Log Session
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl p-5 border border-[#F0E8E2] mb-5">
          <p className="font-semibold text-gray-700 mb-4">Log a physio session</p>

          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            max={getTodayDateString()}
            onChange={e => setDate(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded-2xl border border-[#F0E8E2] text-sm text-gray-700 focus:outline-none focus:border-[#C4849B]"
          />

          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Duration</span>
            <span className="text-sm font-bold text-[#C4849B]">{duration} min</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setDuration(d => Math.max(0, d - 5))}
              className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 font-bold text-lg"
            >−</button>
            <input
              type="range" min={0} max={120} step={5} value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="flex-1" style={{ accentColor: '#C4849B' }}
            />
            <button
              onClick={() => setDuration(d => Math.min(120, d + 5))}
              className="w-9 h-9 rounded-full bg-[#C4849B] text-white font-bold text-lg"
            >+</button>
          </div>

          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Exertion (RPE)</span>
            <span className="text-sm font-bold text-[#C4849B]">{exertion}/10</span>
          </div>
          <input
            type="range" min={0} max={10} step={1} value={exertion}
            onChange={e => setExertion(Number(e.target.value))}
            className="w-full mb-1" style={{ accentColor: '#C4849B' }}
          />
          <div className="flex justify-between mb-4">
            <span className="text-xs text-gray-400">Very easy</span>
            <span className="text-xs text-gray-400">Max effort</span>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What did you do? How did your body respond?"
            className="w-full h-20 text-sm text-gray-700 resize-none px-3 py-2 rounded-2xl border border-[#F0E8E2] focus:outline-none focus:border-[#C4849B] placeholder-gray-300 mb-4"
          />

          <div className="flex gap-2">
            <button
              onClick={() => { resetForm(); setShowForm(false) }}
              className="flex-1 py-3 rounded-2xl border border-[#F0E8E2] text-gray-600 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-[#C4849B] text-white font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="text-center py-8 text-3xl animate-pulse">🏃‍♀️</div>}

      {!loading && sessions.length === 0 && !showForm && (
        <div className="bg-white rounded-3xl p-8 border border-[#F0E8E2] text-center">
          <div className="text-5xl mb-3">🏃‍♀️</div>
          <p className="font-semibold text-gray-700">No sessions yet</p>
          <p className="text-gray-500 text-sm mt-2">Tap &ldquo;Log Session&rdquo; to record your first physio session.</p>
        </div>
      )}

      <div className="space-y-3">
        {sessions.map(session => (
          <div key={session.id} className="bg-white rounded-2xl p-4 border border-[#F0E8E2]">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-800">{formatDayDate(session.date)}</p>
                <p className="text-xs text-gray-500">
                  {session.durationMinutes} min
                  {session.exercises.length > 0 && ` · ${session.exercises.length} exercises`}
                </p>
                {session.recoveryNotes && (
                  <p className="text-xs text-gray-500 mt-1">{session.recoveryNotes}</p>
                )}
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
