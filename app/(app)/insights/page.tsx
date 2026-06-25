'use client'
import { useAppStore } from '@/store/useAppStore'
import { useInsights } from '@/hooks/useInsights'
import { formatDate } from '@/utils/dateHelpers'

const CONFIDENCE_CONFIG = {
  low: { label: 'Low confidence', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium confidence', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High confidence', color: 'bg-green-100 text-green-700' },
}

export default function InsightsPage() {
  const user = useAppStore(s => s.user)
  const { insights, loading, acknowledge } = useInsights(user?.uid)

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Insights</h1>
        <p className="text-gray-500 text-sm mt-1">Patterns from your health data</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-4xl animate-pulse">💡</div>
        </div>
      )}

      {!loading && insights.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-[#F0E8E2] text-center">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-semibold text-gray-700">No insights yet</p>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Keep logging daily check-ins and insights will appear here as patterns emerge.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {insights.map(insight => {
          const conf = CONFIDENCE_CONFIG[insight.confidence]
          return (
            <div
              key={insight.id}
              className={`bg-white rounded-3xl p-5 border transition-colors ${
                insight.acknowledged ? 'border-[#F0E8E2]' : 'border-[#C4849B]'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {!insight.acknowledged && (
                    <span className="w-2 h-2 bg-[#C4849B] rounded-full flex-shrink-0" />
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conf.color}`}>
                    {conf.label}
                  </span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatDate(insight.generatedAt.toDate())}
                </span>
              </div>
              <p className="text-gray-800 leading-relaxed">{insight.message}</p>
              {insight.dataBasis && (
                <p className="text-gray-500 text-sm mt-2">{insight.dataBasis}</p>
              )}
              {!insight.acknowledged && (
                <button
                  onClick={() => acknowledge(insight.id)}
                  className="mt-3 text-sm text-[#C4849B] font-medium"
                >
                  Mark as read
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
