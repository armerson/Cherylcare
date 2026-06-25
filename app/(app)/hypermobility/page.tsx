'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { saveHypermobilityLog } from '@/services/firestore'
import { getTodayDateString } from '@/utils/dateHelpers'

const BODY_PARTS = ['Neck', 'Shoulders', 'Elbows', 'Wrists', 'Fingers', 'Hips', 'Knees', 'Ankles', 'Lower back', 'Upper back']

export default function HypermobilityPage() {
  const user = useAppStore(s => s.user)
  const [painParts, setPainParts] = useState<string[]>([])
  const [fatigue, setFatigue] = useState(3)
  const [dizziness, setDizziness] = useState(0)
  const [exercised, setExercised] = useState(false)
  const [headaches, setHeadaches] = useState(false)
  const [digestive, setDigestive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const togglePart = (part: string) => {
    setPainParts(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    )
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await saveHypermobilityLog(user.uid, {
        date: getTodayDateString(),
        jointPain: painParts,
        subluxations: [],
        fatigue,
        dizziness,
        exerciseCompleted: exercised,
        headaches,
        digestiveIssues: digestive,
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
          <p className="text-xl font-semibold text-gray-800">Joint log saved</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Joint Health</h1>
        <p className="text-gray-500 text-sm mt-1">Log today&apos;s hypermobility symptoms</p>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-[#F0E8E2] mb-4">
        <p className="font-semibold text-gray-700 mb-3">Joint pain today</p>
        <div className="flex flex-wrap gap-2">
          {BODY_PARTS.map(part => (
            <button
              key={part}
              onClick={() => togglePart(part)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                painParts.includes(part)
                  ? 'bg-[#C4849B] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {part}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-[#F0E8E2] mb-4 space-y-5">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Fatigue</span>
            <span className="text-sm font-bold text-[#9B84C4]">{fatigue}/10</span>
          </div>
          <input type="range" min={0} max={10} value={fatigue} onChange={e => setFatigue(Number(e.target.value))}
            className="w-full" style={{ accentColor: '#9B84C4' }} />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Dizziness / POTS symptoms</span>
            <span className="text-sm font-bold text-[#84A8C4]">{dizziness}/10</span>
          </div>
          <input type="range" min={0} max={10} value={dizziness} onChange={e => setDizziness(Number(e.target.value))}
            className="w-full" style={{ accentColor: '#84A8C4' }} />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-[#F0E8E2] mb-6 space-y-4">
        {[{ label: 'Completed exercise today', value: exercised, set: setExercised },
          { label: 'Headaches', value: headaches, set: setHeadaches },
          { label: 'Digestive issues', value: digestive, set: setDigestive }].map(({ label, value, set }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <button
              onClick={() => set(!value)}
              className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-[#C4849B]' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${value ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 rounded-3xl bg-[#C4849B] text-white font-semibold text-lg disabled:opacity-60">
        {saving ? 'Saving...' : 'Save Joint Log'}
      </button>
    </div>
  )
}
