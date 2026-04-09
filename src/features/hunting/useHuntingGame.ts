import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../../api/client";
import { useUserAuth } from "../../auth/UserAuthContext";
import { getHuntingZone } from "../../data/huntingZones";
import {
  createDefaultProgress,
  getExpToNextLevel,
  getHuntingStorageKey,
  loadHuntingProgress,
  MAX_ENDURANCE,
  saveHuntingProgress,
  type HuntingConsumableCode,
  type HuntingMaterialCode,
  type HuntingProgress
} from "../huntingProgress";
import type {
  HuntingCombatClickResponse,
  HuntingCombatState,
  HuntingProfile,
  HuntingZoneDetail,
  HuntingZoneSummary
} from "../../types";

const DAILY_CLICK_LIMIT = 300;

const updateProgressFromCombat = (
  current: HuntingProgress,
  result: HuntingCombatClickResponse
): HuntingProgress => {
  let nextLevel = current.level;
  let nextExp = current.exp + result.expGained;
  const nextMaterials = { ...current.materials };
  const nextConsumables = { ...current.consumables };

  result.rewards.forEach((reward) => {
    if (reward.kind === "material") {
      nextMaterials[reward.code as HuntingMaterialCode] += reward.quantity;
    } else {
      nextConsumables[reward.code as HuntingConsumableCode] += reward.quantity;
    }
  });

  while (nextExp >= getExpToNextLevel(nextLevel)) {
    nextExp -= getExpToNextLevel(nextLevel);
    nextLevel += 1;
  }

  return {
    ...current,
    level: nextLevel,
    exp: nextExp,
    selectedStageId: result.state.zoneId,
    selectedMonsterId: result.state.monster.id,
    todayClickCount: Math.min(DAILY_CLICK_LIMIT, current.todayClickCount + 1),
    totalDefeated: current.totalDefeated + (result.defeated ? 1 : 0),
    todayDefeatedCount: current.todayDefeatedCount + (result.defeated ? 1 : 0)
  };
};

export const useHuntingGame = () => {
  const { user } = useUserAuth();
  const autoTimerRef = useRef<number | null>(null);
  const [progress, setProgress] = useState<HuntingProgress>(() => createDefaultProgress());
  const [profile, setProfile] = useState<HuntingProfile | null>(null);
  const [zones, setZones] = useState<HuntingZoneSummary[]>([]);
  const [zoneDetail, setZoneDetail] = useState<HuntingZoneDetail | null>(null);
  const [combatState, setCombatState] = useState<HuntingCombatState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [autoAttackEnabled, setAutoAttackEnabled] = useState(false);

  const storageKey = useMemo(() => (user ? getHuntingStorageKey(user.id) : ""), [user]);

  useEffect(() => {
    if (!user || !storageKey) {
      setProgress(createDefaultProgress());
      return;
    }
    setProgress(loadHuntingProgress(storageKey));
  }, [storageKey, user]);

  useEffect(() => {
    if (!user || !storageKey) {
      return;
    }
    saveHuntingProgress(storageKey, progress);
  }, [progress, storageKey, user]);

  const selectedZoneId = zoneDetail?.id ?? progress.selectedStageId;
  const selectedMonsterId = combatState?.monster.id ?? progress.selectedMonsterId;

  const loadZoneBundle = async (zoneId: string, monsterId?: string) => {
    const [detail, state] = await Promise.all([
      apiClient.getHuntingZone(zoneId),
      apiClient.getCombatState(zoneId, monsterId)
    ]);
    setZoneDetail(detail);
    setCombatState(state);
  };

  const refresh = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const savedProgress = storageKey ? loadHuntingProgress(storageKey) : progress;
      const [nextProfile, nextZones] = await Promise.all([
        apiClient.getHuntingProfile(),
        apiClient.getHuntingZones()
      ]);
      setProfile(nextProfile);
      setZones(nextZones);
      setProgress(savedProgress);
      await loadZoneBundle(savedProgress.selectedStageId, savedProgress.selectedMonsterId);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "사냥터 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [storageKey, user]);

  const currentZone = useMemo(
    () => zones.find((zone) => zone.id === selectedZoneId) ?? getHuntingZone(selectedZoneId),
    [selectedZoneId, zones]
  );
  const selectedMonster = combatState?.monster ?? null;
  const remainingClicks =
    combatState?.remainingClicks ?? Math.max(0, DAILY_CLICK_LIMIT - progress.todayClickCount);
  const estimatedDamage =
    combatState?.estimatedDamage ?? Math.max(1, Math.floor((profile?.battlePower ?? 0) * 0.98));

  const syncZone = async (zoneId: string, monsterId?: string) => {
    try {
      await loadZoneBundle(zoneId, monsterId);
      setProgress((current) => ({
        ...current,
        selectedStageId: zoneId,
        selectedMonsterId:
          monsterId ?? getHuntingZone(zoneId)?.monsters[0]?.id ?? current.selectedMonsterId
      }));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "사냥터를 이동하지 못했습니다.");
    }
  };

  const selectZone = async (zoneId: string) => {
    const stage = zones.find((zone) => zone.id === zoneId);
    if (!stage) {
      return;
    }
    if (progress.level < stage.unlockLevel) {
      setErrorMessage(`${stage.name}은 레벨 ${stage.unlockLevel}부터 입장할 수 있습니다.`);
      return;
    }
    await syncZone(zoneId);
  };

  const focusMonster = async (monsterId: string) => {
    await syncZone(selectedZoneId, monsterId);
  };

  const attack = async () => {
    if (!selectedZoneId || !selectedMonsterId || isAttacking) {
      return;
    }
    if (progress.endurance < 1) {
      setErrorMessage("지구력이 부족합니다. 포션을 사용하거나 잠시 회복을 기다리세요.");
      return;
    }

    setIsAttacking(true);
    try {
      const result = await apiClient.clickCombat({
        zoneId: selectedZoneId,
        monsterId: selectedMonsterId
      });
      setCombatState(result.state);
      setProgress((current) => ({
        ...updateProgressFromCombat(current, result),
        endurance: Math.max(0, current.endurance - 1)
      }));
      if (result.rewards.length > 0) {
        window.alert(result.rewards.map((reward) => `${reward.label} x${reward.quantity}`).join(", "));
      }
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "전투를 진행하지 못했습니다.");
      if (autoAttackEnabled) {
        setAutoAttackEnabled(false);
      }
    } finally {
      setIsAttacking(false);
    }
  };

  const useConsumable = async (code: HuntingConsumableCode) => {
    if (progress.consumables[code] <= 0) {
      setErrorMessage("보유한 소비 아이템이 없습니다.");
      return;
    }

    try {
      const nextState = await apiClient.useCombatConsumable({ consumableCode: code });
      setCombatState(nextState);
      setProgress((current) => ({
        ...current,
        endurance:
          code === "healing-potion"
            ? Math.min(MAX_ENDURANCE, current.endurance + 35)
            : code === "medium-healing-potion"
              ? Math.min(MAX_ENDURANCE, current.endurance + 60)
              : current.endurance,
        cardSupportPoints:
          code === "fan-letter"
            ? current.cardSupportPoints + 2
            : code === "cheering-stick"
              ? current.cardSupportPoints + 4
              : code === "viral-ticket"
                ? current.cardSupportPoints + 6
                : current.cardSupportPoints,
        consumables: {
          ...current.consumables,
          [code]: Math.max(0, current.consumables[code] - 1)
        }
      }));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "소비 아이템을 사용하지 못했습니다.");
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const recoveryTimer = window.setInterval(() => {
      setProgress((current) => ({
        ...current,
        endurance: Math.min(MAX_ENDURANCE, current.endurance + 2)
      }));
    }, 3000);

    return () => window.clearInterval(recoveryTimer);
  }, [user]);

  useEffect(() => {
    if (autoTimerRef.current) {
      window.clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    if (!autoAttackEnabled || !selectedMonster || !user) {
      return;
    }

    autoTimerRef.current = window.setInterval(() => {
      void attack();
    }, 1600);

    return () => {
      if (autoTimerRef.current) {
        window.clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [autoAttackEnabled, selectedMonsterId, user, progress.endurance, isAttacking]);

  const zoneDropPreview = useMemo(() => {
    if (!zoneDetail) {
      return [];
    }
    return Array.from(
      new Map(zoneDetail.monsters.flatMap((monster) => monster.dropTable).map((drop) => [drop.code, drop])).values()
    );
  }, [zoneDetail]);

  return {
    user,
    progress,
    profile,
    zones,
    zoneDetail,
    combatState,
    isLoading,
    isAttacking,
    errorMessage,
    autoAttackEnabled,
    currentZone,
    selectedZoneId,
    selectedMonsterId,
    selectedMonster,
    remainingClicks,
    estimatedDamage,
    zoneDropPreview,
    setAutoAttackEnabled,
    refresh,
    selectZone,
    focusMonster,
    attack,
    useConsumable
  };
};
