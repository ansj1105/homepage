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

type HuntingNotification = {
  id: string;
  tone: "reward" | "info";
  title: string;
  body: string;
};

const updateProgressFromCombat = (
  current: HuntingProgress,
  result: HuntingCombatClickResponse
): { progress: HuntingProgress; levelUps: number } => {
  let nextLevel = current.level;
  let nextExp = current.exp + result.expGained;
  let levelUps = 0;
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
    levelUps += 1;
  }

  return {
    levelUps,
    progress: {
      ...current,
      level: nextLevel,
      exp: nextExp,
      materials: nextMaterials,
      consumables: nextConsumables,
      selectedStageId: result.state.zoneId,
      selectedMonsterId: result.state.monster.id,
      totalClickCount: current.totalClickCount + 1,
      todayClickCount: current.todayClickCount + 1,
      totalDefeated: current.totalDefeated + (result.defeated ? 1 : 0),
      totalBossDefeated: current.totalBossDefeated + (result.defeated && result.state.monster.isBoss ? 1 : 0),
      todayDefeatedCount: current.todayDefeatedCount + (result.defeated ? 1 : 0),
      weeklyBossDefeatedCount: current.weeklyBossDefeatedCount + (result.defeated && result.state.monster.isBoss ? 1 : 0)
    }
  };
};

export const useHuntingGame = () => {
  const { user } = useUserAuth();
  const autoTimerRef = useRef<number | null>(null);
  const autoAttackEnabledRef = useRef(false);
  const attackRef = useRef<() => Promise<void>>(async () => undefined);
  const notificationTimersRef = useRef<number[]>([]);
  const [progress, setProgress] = useState<HuntingProgress>(() => createDefaultProgress());
  const [profile, setProfile] = useState<HuntingProfile | null>(null);
  const [zones, setZones] = useState<HuntingZoneSummary[]>([]);
  const [zoneDetail, setZoneDetail] = useState<HuntingZoneDetail | null>(null);
  const [combatState, setCombatState] = useState<HuntingCombatState | null>(null);
  const [notifications, setNotifications] = useState<HuntingNotification[]>([]);
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
  const selectedCardLevel = progress.selectedCardTargetId
    ? (progress.cardLevels[progress.selectedCardTargetId] ?? 1)
    : 1;

  const pushNotification = (notification: Omit<HuntingNotification, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setNotifications((current) => [...current, { ...notification, id }].slice(-4));
    const timer = window.setTimeout(() => {
      setNotifications((current) => current.filter((entry) => entry.id !== id));
      notificationTimersRef.current = notificationTimersRef.current.filter((value) => value !== timer);
    }, 2800);
    notificationTimersRef.current.push(timer);
  };

  const loadZoneBundle = async (zoneId: string, monsterId?: string, selectedCardId?: string, cardLevel = 1) => {
    const [detail, state] = await Promise.all([
      apiClient.getHuntingZone(zoneId),
      apiClient.getCombatState(zoneId, monsterId, selectedCardId, cardLevel)
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
        apiClient.getHuntingProfile(
          savedProgress.selectedCardTargetId,
          savedProgress.selectedCardTargetId ? (savedProgress.cardLevels[savedProgress.selectedCardTargetId] ?? 1) : 1
        ),
        apiClient.getHuntingZones()
      ]);
      setProfile(nextProfile);
      setZones(nextZones);
      setProgress(savedProgress);
      await loadZoneBundle(
        savedProgress.selectedStageId,
        savedProgress.selectedMonsterId,
        savedProgress.selectedCardTargetId,
        savedProgress.selectedCardTargetId ? (savedProgress.cardLevels[savedProgress.selectedCardTargetId] ?? 1) : 1
      );
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
    combatState?.remainingClicks ?? Math.max(0, (profile?.dailyClickLimit ?? 300) - progress.todayClickCount);
  const estimatedDamage =
    combatState?.estimatedDamage ?? Math.max(1, Math.floor((profile?.battlePower ?? 0) * 0.98));

  const syncZone = async (zoneId: string, monsterId?: string) => {
    try {
      await loadZoneBundle(zoneId, monsterId, progress.selectedCardTargetId, selectedCardLevel);
      const nextMonsterId =
        monsterId ?? getHuntingZone(zoneId)?.monsters[0]?.id ?? progress.selectedMonsterId;
      setProgress((current) => {
        const nextProgress = {
          ...current,
          selectedStageId: zoneId,
          selectedMonsterId: nextMonsterId
        };
        if (storageKey) {
          saveHuntingProgress(storageKey, nextProgress);
        }
        return nextProgress;
      });
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
    const requiredEndurance = combatState?.clickCost ?? currentZone?.clickCost ?? 1;
    if (progress.endurance < requiredEndurance) {
      setErrorMessage(`피로도가 부족합니다. 현재 지역은 ${requiredEndurance} 피로도를 소모합니다.`);
      if (autoAttackEnabledRef.current) {
        setAutoAttackEnabled(false);
      }
      return;
    }

    setIsAttacking(true);
    try {
      const result = await apiClient.clickCombat({
        zoneId: selectedZoneId,
        monsterId: selectedMonsterId,
        selectedCardId: progress.selectedCardTargetId || undefined,
        selectedCardLevel
      });
      setCombatState(result.state);
      let nextLevelUpCount = 0;
      let nextLevel = progress.level;
      setProgress((current) => {
        const combatUpdate = updateProgressFromCombat(current, result);
        nextLevelUpCount = combatUpdate.levelUps;
        nextLevel = combatUpdate.progress.level;
        return {
          ...combatUpdate.progress,
          endurance: Math.max(0, current.endurance - result.state.clickCost),
          cardPopularity: current.selectedCardTargetId
            ? {
                ...current.cardPopularity,
                [current.selectedCardTargetId]:
                  (current.cardPopularity[current.selectedCardTargetId] ?? 0) +
                  Math.max(1, 1 + Math.floor(((profile?.cardGrowthMultiplier ?? 1) - 1) * 10))
              }
            : current.cardPopularity,
          dailyCardPopularityGain:
            current.selectedCardTargetId
              ? current.dailyCardPopularityGain + Math.max(1, 1 + Math.floor(((profile?.cardGrowthMultiplier ?? 1) - 1) * 10))
              : current.dailyCardPopularityGain
        };
      });
      if (result.expGained > 0) {
        pushNotification({
          tone: "info",
          title: "사냥 경험치",
          body: `처치 보상 경험치 +${result.expGained}`
        });
      }
      if (nextLevelUpCount > 0) {
        pushNotification({
          tone: "reward",
          title: "레벨 업",
          body: `현재 레벨 ${nextLevel}`
        });
      }
      if (result.rewards.length > 0) {
        pushNotification({
          tone: "reward",
          title: "드랍 획득",
          body: result.rewards.map((reward) => `${reward.label} x${reward.quantity}`).join(", ")
        });
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

  attackRef.current = attack;

  const useConsumable = async (code: HuntingConsumableCode) => {
    if (progress.consumables[code] <= 0) {
      setErrorMessage("보유한 소비 아이템이 없습니다.");
      return;
    }

    try {
      const nextState = await apiClient.useCombatConsumable({
        consumableCode: code,
        selectedCardId: progress.selectedCardTargetId || undefined,
        selectedCardLevel
      });
      setCombatState(nextState);
      setProgress((current) => ({
        ...current,
        endurance:
          code === "healing-potion"
            ? Math.min(MAX_ENDURANCE, current.endurance + 35)
            : code === "medium-healing-potion"
              ? Math.min(MAX_ENDURANCE, current.endurance + 60)
              : current.endurance,
        todayClickCount:
          code === "energy-bar"
            ? Math.max(0, current.todayClickCount - 12)
            : code === "energy-drink"
              ? Math.max(0, current.todayClickCount - 24)
              : current.todayClickCount,
        cardSupportPoints:
          code === "fan-letter"
            ? current.cardSupportPoints + 2
            : code === "cheering-stick"
              ? current.cardSupportPoints + 4
              : code === "viral-ticket"
                ? current.cardSupportPoints + 6
                : current.cardSupportPoints,
        totalConsumablesUsed: current.totalConsumablesUsed + 1,
        dailyConsumableUseCount: current.dailyConsumableUseCount + 1,
        consumables: {
          ...current.consumables,
          [code]: Math.max(0, current.consumables[code] - 1)
        }
      }));
      if (code === "energy-bar" || code === "energy-drink") {
        pushNotification({
          tone: "reward",
          title: "클릭 여유 회복",
          body: code === "energy-bar" ? "에너지 바 사용 · 클릭 여유 +12" : "고농축 에너지 드링크 사용 · 클릭 여유 +24"
        });
      }
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
        endurance: Math.min(MAX_ENDURANCE, current.endurance + 1)
      }));
    }, 20000);

    return () => window.clearInterval(recoveryTimer);
  }, [user]);

  useEffect(() => {
    return () => {
      notificationTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      notificationTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    autoAttackEnabledRef.current = autoAttackEnabled;
  }, [autoAttackEnabled]);

  useEffect(() => {
    if (autoTimerRef.current) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    if (!autoAttackEnabled || !selectedMonster || !user) {
      return;
    }

    const runAutoAttack = async () => {
      await attackRef.current();
      if (!autoAttackEnabledRef.current) {
        return;
      }
      autoTimerRef.current = window.setTimeout(() => {
        void runAutoAttack();
      }, 1600);
    };

    autoTimerRef.current = window.setTimeout(() => {
      void runAutoAttack();
    }, 0);

    return () => {
      if (autoTimerRef.current) {
        window.clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [autoAttackEnabled, selectedMonster, selectedMonsterId, selectedZoneId, user]);

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
    notifications,
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
