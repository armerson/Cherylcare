'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { getMedications, saveMedicationLog, getTodayMedicationLogs } from '@/services/firestore'
import { getTodayDateString } from '@/utils/dateHelpers'
import type { MedicationEntry } from '@/types'

export default function MedicationsPage() {
  const user = useAppStore(s => s.user)
  const [medications, setMedications] = useState<MedicationEntry[]>([])
  const [takenIds, setTakenIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [meds, logs] = await Promise.all([
        getMedications(user.uid),
        getTodayMedicationLogs(user.uid, getTodayDateString()),
      ])
      setMedications(meds)
      setTakenIds(new Set(logs.filter(l => l.taken).map(l => l.medicationId)))
      setLoading(false)
    }
    load()
  }, [user])

  const handleToggle = async (med: MedicationEntry) => {
    if (!user) return
    const newTaken = !takenIds.has(med.id)
    setTakenIds(prev => {
      const next = new Set(prev)
      newTaken ? next.add(med.id) : next.delete(med.id)
      return next
    })
    await saveMedicationLog(user.uid, {
      medicationId: med.id,
      date: getTodayDateString(),
      taken: newTaken,
      takenAt: newTaken ? new Date().toISOString() : undefined,
    })
  }

  const adherence = medications.length ? Math.round((takenIds.size / medications.length) * 100) : 0

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Medications</h1>
        <p className="text-gray-500 text-sm mt-1">Today&apos;s supplements & medications</p>
      </div>

      {medications.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-[#F0E8E2] mb-4">
          <div className="flex justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Today&apos;s adherence</p>
            <p className="text-sm font-bold text-[#C4849B]">{adherence}%</p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C4849B] rounded-full transition-all"
              style={{ width: `${adherence}%` }}
            />
          </div>
        </div>
      )}

      {loading && <div className="text-center py-8 text-3xl animate-pulse">💊</div>}

      {!loading && medications.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-[#F0E8E2] text-center">
          <div className="text-5xl mb-3">💊</div>
          <p className="font-semibold text-gray-700">No medications yet</p>
          <p className="text-gray-500 text-sm mt-2">Medication management coming in the next update.</p>
        </div>
      )}

      <div className="space-y-2">
        {medications.map(med => {
          const taken = takenIds.has(med.id)
          return (
            <button
              key={med.id}
              onClick={() => handleToggle(med)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                taken ? 'bg-green-50 border-green-200' : 'bg-white border-[#F0E8E2]'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                taken ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {taken && <span className="text-white text-xs">✓</span>}
              </div>
              <div className="text-left flex-1">
                <p className={`font-medium ${taken ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                  {med.name}
                </p>
                <p className="text-xs text-gray-500">{med.dosage} · {med.type}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
