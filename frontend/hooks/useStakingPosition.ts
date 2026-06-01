import { useEffect, useState, useCallback } from "react";
import { getStakingPosition, type StakingPositionReponse } from "@/lib/config";

export interface UseStakingPositionOptions {
  walletAddress?: string | null;
  pollInterval?: number;
  enabled?: boolean;
}

export function useStakingPosition({
  walletAddress,
  pollInterval = 30000, // 30 seconds default
  enabled = true,
}: UseStakingPositionOptions = {}) {
  const [position, setPosition] = useState<StakingPositionReponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosition = useCallback(async () => {
    if (!walletAddress || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getStakingPosition(walletAddress);
      setPosition(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [walletAddress, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  // Setup polling
  useEffect(() => {
    if (!walletAddress || !enabled || pollInterval <= 0) {
      return;
    }

    const interval = setInterval(fetchPosition, pollInterval);
    return () => clearInterval(interval);
  }, [walletAddress, enabled, pollInterval, fetchPosition]);

  return {
    position,
    loading,
    error,
    refetch: fetchPosition,
  };
}
