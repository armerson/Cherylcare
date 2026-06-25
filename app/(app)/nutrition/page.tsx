'use client'
import { useState } from 'react'

function Stepper({ label, value, onChange, unit, min = 0, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; unit: string; min?: number; step?: number
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F0E8E2] last:border-0">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-lg flex items-center justify-center"
        >-</button>
        <span className="text-sm font-bold text-gray-800 w-16 text-center">{value} {unit}</span>
        <button
          onClick={() => onChange(value + step)}
          className="w-8 h-8 rounded-full bg-[#C4849B] text-white font-bold text-lg flex items-center justify-center"
        >+</button>
      </div>
    </div>
  )
}

export default function NutritionPage() {
  const [water, setWater] = useState(0)
  const [protein, setProtein] = useState(0)
  const [caffeine, setCaffeine] = useState(0)
  const [sleep, setSleep] = useState(7)

  const waterGoal = 2000
  const waterPct = Math.min(100, Math.round((water / waterGoal) * 100))

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Nutrition</h1>
        <p className="text-gray-500 text-sm mt-1">Today&apos;s intake</p>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-[#F0E8E2] mb-4">
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-gray-700">💧 Water</p>
          <p className="text-sm font-bold text-[#84C4A3]">{water} / {waterGoal} ml</p>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#84C4A3] rounded-full transition-all"
            style={{ width: `${waterPct}%` }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[150, 250, 350, 500].map(ml => (
            <button
              key={ml}
              onClick={() => setWater(prev => prev + ml)}
              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium"
            >
              +{ml}ml
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-[#F0E8E2]">
        <Stepper label="🥩 Protein" value={protein} onChange={setProtein} unit="g" step={5} />
        <Stepper label="☕ Caffeine" value={caffeine} onChange={setCaffeine} unit="mg" step={50} />
        <Stepper label="💤 Sleep" value={sleep} onChange={setSleep} unit="hrs" min={0} step={0.5} />
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Nutrition data will sync to Firestore in the next update.
      </p>
    </div>
  )
}
