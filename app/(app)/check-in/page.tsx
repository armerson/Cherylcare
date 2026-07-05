'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { saveDailyCheckIn, getDailyCheckIn } from '@/services/firestore'
import { getTodayDateString } from '@/utils/dateHelpers'
import { format, subDays } from 'date-fns'
import { APP_VERSION } from '@/constants/version'
import type { DailyCheckIn } from '@/types'

const MOODS = ['😞', '😕', '😐', '🙂', '😄']

function Slider({ label, value, onChange, color = '#C4849B', low = 'Low', high = 'High' }: {
  label: string
  value: number
  onChange: (v: number) => void
  color?: string
  low?: string
  high?: string
}) {
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}/10</span>
      </div>
      <input
        type="range" min={0} max={10} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full rounded-full"
        style={{ accentColor: color, background: `linear-gradient(to right, ${color} ${value * 10}%, #F0E8E2 ${value * 10}%)` }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{low}</span>
        <span className="text-xs text-gray-400">{high}</span>
      </div>
    </div>
  )
}

const TODAY = getTodayDateString()
const YESTERDAY = format(subDays(new Date(), 1), 'yyyy-MM-dd')
const TWO_DAYS_AGO = format(subDays(new Date(), 2), 'yyyy-MM-dd')

function CheckInContent() {
  const user = useAppStore(s => s.user)
  const setTodayCheckIn = useAppStore(s => s.setTodayCheckIn)
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialDate = searchParams.get('date') === 'yesterday'
    ? YESTERDAY
    : searchParams.get('date') === 'two-days-ago'
      ? TWO_DAYS_AGO
      : TODAY

  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [mood, setMood] = useState(2)
  const [painLevel, setPainLevel] = useState(3)
  const [fatigue, setFatigue] = useState(3)
  const [stress, setStress] = useState(3)
  const [sleepQuality, setSleepQuality] = useState(7)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [alreadyLogged, setAlreadyLogged] = useState(false)

  useEffect(() => {
    if (!user || initialDate === TODAY) return
    getDailyCheckIn(user.uid, initialDate).then(existing => setAlreadyLogged(!!existing))
  }, [user, initialDate])

  const handleDateChange = async (date: string) => {
    if (!user) return
    setSelectedDate(date)
    const existing = await getDailyCheckIn(user.uid, date)
    setAlreadyLogged(!!existing)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const checkIn: Omit<DailyCheckIn, 'completedAt' | 'updatedAt'> = {
      date: selectedDate,
      mood: (mood + 1) * 2,
      painLevel,
      fatigue,
      stress,
      sleepQuality,
      notes: notes || undefined,
    }
    try {
      await saveDailyCheckIn(user.uid, checkIn)
      if (selectedDate === TODAY) setTodayCheckIn(checkIn as DailyCheckIn)
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 1200)
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-xl font-semibold text-gray-800">Check-in saved!</p>
          <p className="text-gray-500 text-sm mt-1">Well done for showing up for yourself.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Daily Check-In</h1>
        <p className="text-gray-500 text-sm mt-1">How are you feeling?</p>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { label: 'Today', value: TODAY },
          { label: 'Yesterday', value: YESTERDAY },
          { label: '2 days ago', value: TWO_DAYS_AGO },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => handleDateChange(opt.value)}
            className={`flex-1 py-2 rounded-2xl text-sm font-medium border transition-colors ${
              selectedDate === opt.value
                ? 'bg-[#C4849B] text-white border-[#C4849B]'
                : 'bg-white text-gray-600 border-[#F0E8E2]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {alreadyLogged && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-4">
          <p className="text-yellow-700 text-sm">
            You already logged {selectedDate === TODAY ? 'today' : selectedDate === YESTERDAY ? 'yesterday' : '2 days ago'}. Saving will overwrite it.
          </p>
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 border border-[#F0E8E2] mb-4">
        <p className="font-semibold text-gray-700 mb-4">Mood</p>
        <div className="flex justify-between">
          {MOODS.map((emoji, i) => (
            <button
              key={i}
              onClick={() => setMood(i)}
              className={`text-3xl p-2 rounded-full transition-all duration-150 ${mood === i ? 'scale-125 bg-pink-50' : 'opacity-40 hover:opacity-70'}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-[#F0E8E2] mb-4">
        <Slider label="Pain Level" value={painLevel} onChange={setPainLevel} color="#C4849B" low="No pain" high="Severe" />
        <Slider label="Fatigue" value={fatigue} onChange={setFatigue} color="#9B84C4" low="Energised" high="Exhausted" />
        <Slider label="Stress" value={stress} onChange={setStress} color="#E8A5B5" low="Calm" high="Very stressed" />
        <Slider label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality} color="#84C4A3" low="Poor" high="Great" />
      </div>

      <div className="bg-white rounded-3xl p-5 border border-[#F0E8E2] mb-6">
        <p className="font-semibold text-gray-700 mb-2">Notes <span className="text-gray-400 font-normal text-sm">(optional)</span></p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anything else to note today..."
          className="w-full h-20 text-sm text-gray-700 resize-none focus:outline-none placeholder-gray-300"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-3xl bg-[#C4849B] text-white font-semibold text-lg disabled:opacity-60 transition-opacity active:scale-[0.98]"
      >
        {saving ? 'Saving...' : 'Save Check-In'}
      </button>

      <p className="text-center text-[10px] text-gray-300 mt-4">
        Notes are optional · {APP_VERSION}
      </p>
    </div>
  )
}

export default function CheckInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl animate-pulse">🌸</div>
      </div>
    }>
      <CheckInContent />
    </Suspense>
  )
}
