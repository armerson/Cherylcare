import { useState, useEffect, useCallback } from 'react';
import { getInsights, acknowledgeInsight as ackInsight } from '../services/firestore';
import { useAppStore } from '../store/useAppStore';

export function useInsights(uid: string | undefined) {
  const insights = useAppStore(s => s.insights);
  const setInsights = useAppStore(s => s.setInsights);
  const acknowledgeInsight = useAppStore(s => s.acknowledgeInsight);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const data = await getInsights(uid);
      setInsights(data);
    } catch (e) {
      console.error('Error loading insights:', e);
    } finally {
      setLoading(false);
    }
  }, [uid, setInsights]);

  const acknowledge = useCallback(
    async (insightId: string) => {
      if (!uid) return;
      acknowledgeInsight(insightId);
      await ackInsight(uid, insightId);
    },
    [uid, acknowledgeInsight],
  );

  useEffect(() => {
    load();
  }, [load]);

  return { insights, loading, refresh: load, acknowledge };
}
