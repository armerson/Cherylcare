'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { saveSettings } from '@/services/firestore'

export default function SettingsPage() {
  const user = useAppStore(s => s.user)
  const settings = useAppStore(s => s.settings)
  const setSettings = useAppStore(s => s.setSettings)

  const [cycleLength, setCycleLength] = useState(28)
  const [christianMode, setChristianMode] = useState(false)
  const [insightsEnabled, setInsightsEnabled] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setCycleLength(settings.averageCycleLength)
      setChristianMode(settings.christianModeEnabled)
      setInsightsEnabled(settings.insightsEnabled)
    }
  }, [settings])

  const handleSave = async () => {
    if (!user || !settings) return
    setSaving(true)
    const updated = {
      ...settings,
      averageCycleLength: cycleLength,
      christianModeEnabled: christianMode,
      insightsEnabled,
    }
    try {
      await saveSettings(user.uid, updated)
      setSettings(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded-2xl p-5 border border-[#F0E8E2]">
          <p className="font-semibold text-gray-700 mb-1">Average Cycle Length</p>
          <p className="text-xs text-gray-500 mb-3">Used for phase calculations and predictions</p>
          <div className="flex items-center gap-4">
            <input
              type="range" min={21} max={40} step={1}
              value={cycleLength}
              onChange={e => setCycleLength(Number(e.target.value))}
              className="flex-1"
              style={{ accentColor: '#C4849B' }}
            />
            <span className="text-lg font-bold text-[#C4849B] w-10 text-right">{cycleLength}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#F0E8E2] flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-700">AI Insights</p>
            <p className="text-xs text-gray-500">Pattern analysis from your data</p>
          </div>
          <button
            onClick={() => setInsightsEnabled(!insightsEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              insightsEnabled ? 'bg-[#C4849B]' : 'bg-gray-200'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
              insightsEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#F0E8E2] flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-700">Christian Mode</p>
            <p className="text-xs text-gray-500">Show scripture & faith-based encouragements</p>
          </div>
          <button
            onClick={() => setChristianMode(!christianMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              christianMode ? 'bg-[#C4849B]' : 'bg-gray-200'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
              christianMode ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-6 py-4 rounded-3xl bg-[#C4849B] text-white font-semibold disabled:opacity-60"
      >
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
