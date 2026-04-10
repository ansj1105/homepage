import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../../api/client";
import {
  createDefaultProgress,
  getHuntingStorageKey,
  loadHuntingProgress,
  saveHuntingProgress,
  type HuntingProgress
} from "../huntingProgress";

export const useSyncedHuntingProgress = (userId?: string) => {
  const [progress, setProgress] = useState<HuntingProgress | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const storageKey = useMemo(() => (userId ? getHuntingStorageKey(userId) : ""), [userId]);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (!userId || !storageKey) {
      hasHydratedRef.current = false;
      setProgress(createDefaultProgress());
      setIsHydrated(false);
      return;
    }

    hasHydratedRef.current = false;
    const localProgress = loadHuntingProgress(storageKey);
    setProgress(localProgress);
    setIsHydrated(false);

    void apiClient
      .getHuntingProgress()
      .then((serverProgress) => {
        setProgress(serverProgress);
      })
      .catch(() => {
        setProgress(localProgress);
      })
      .finally(() => {
        hasHydratedRef.current = true;
        setIsHydrated(true);
      });
  }, [storageKey, userId]);

  useEffect(() => {
    if (!userId || !storageKey || !progress || !hasHydratedRef.current) {
      return;
    }
    saveHuntingProgress(storageKey, progress);
    void apiClient.saveHuntingProgress(progress).catch(() => {
      // Keep local mirror even if server sync temporarily fails.
    });
  }, [progress, storageKey, userId]);

  return { progress, setProgress, isHydrated };
};
