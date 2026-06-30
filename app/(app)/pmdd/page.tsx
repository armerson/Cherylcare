'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { savePMDDLog } from '@/services/firestore'
import { getTodayDateString } from '@/utils/dateHelpers'

const SYMPTOMS = [
  { key: 'irritability', label: 'Irritability', color: '#C4849B' },
  { key: 'anxiety', label: 'Anxiety', color: '#9B84C4' },
  { key: 'depression', label: 'Low mood', color: '#7284C4' },
  { key: 'foodCravings', label: 'Food cravings', color: '#C4A884' },
  { key: 'bloating', label: 'Bloating', color: '#84C4A3' },
  { key: 'breastTenderness', label: 'Breast tenderness', color: '#C48484' },
  { key: 'fatigue', label: 'Fatigue', color: '#A484C4' },
  { key: 'sleepDisturbance', label: 'Sleep disruption', color: '#849BC4' },
  { key: 'overwhelm', label: 'Overwhelm', color: '#C49B84' },
  { key: 'concentration', label: 'Concentration issues', color: '#C4B484' },
] as const

type SymptomKey = typeof SYMPTOMS[number]['key']
type Scores = Record<SymptomKey, number>

export default function PMDDPage() {
  const user = useAppStore(s => s.user)
  const currentCycleDay = useAppStore(s => s.currentCycleDay)
  const pmddWindowActive = useAppStore(s => s.pmddWindowActive)

  const initialScores = Object.fromEntries(SYMPTOMS.map(s => [s.key, 0])) as Scores
  const [scores, setScores] = useState<Scores>(initialScores)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await savePMDDLog(user.uid, {
        date: getTodayDateString(),
        cycleDay: currentCycleDay ?? undefined,
        notes: notes || undefined,
        ...scores,
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-xl font-semibold text-gray-800">PMDD log saved</p>
          <p className="text-gray-500 text-sm mt-1">Tracking this helps build your insights.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">PMDD Tracking</h1>
        <p className="text-gray-500 text-sm mt-1">
          {currentCycleDay ? `Cycle day ${currentCycleDay}` : 'Track your late luteal symptoms'}
        </p>
      </div>

      {pmddWindowActive && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-4">
          <p className="text-purple-700 text-sm font-medium">🟣 You&apos;re in your PMDD window</p>
          <p className="text-purple-600 text-xs mt-1">Logging symptoms now helps identify patterns over time.</p>
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 border border-[#F0E8E2] mb-4 space-y-5">
        {SYMPTOMS.map(({ key, label, color }) => (
          <div key={key}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <span className="text-sm font-bold" style={{ color }}>{scores[key]}/10</span>
            </div>
            <input
              type="range" min={0} max={10} step={1}
              value={scores[key]}
              onChange={e => setScores(prev => ({ ...prev, [key]: Number(e.target.value) }))}
              className="w-full rounded-full"
              style={{ accentColor: color }}
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-5 border border-[#F0E8E2] mb-6">
        <p className="font-semibold text-gray-700 mb-2">Notes <span className="text-gray-400 font-normal text-sm">(optional)</span></p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How are you feeling overall?"
          className="w-full h-20 text-sm text-gray-700 resize-none focus:outline-none placeholder-gray-300"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-3xl bg-[#9B84C4] text-white font-semibold text-lg disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save PMDD Log'}
      </button>
    </div>
  )
}
