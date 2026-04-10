import type { HuntingProgress } from "./huntingProgress";

type MissionReward =
  | { kind: "material"; code: keyof HuntingProgress["materials"]; amount: number; label: string }
  | { kind: "consumable"; code: keyof HuntingProgress["consumables"]; amount: number; label: string };

export type MissionEntry = {
  id: string;
  label: string;
  current: number;
  target: number;
  rewardSummary: string;
  rewards: MissionReward[];
  claimed: boolean;
};

const dailyRewardSummary = (rewards: MissionReward[]): string => rewards.map((reward) => reward.label).join(" / ");

export const getDailyMissions = (progress: HuntingProgress): MissionEntry[] => [
  {
    id: "daily-click-100",
    label: "클릭 100회 달성",
    current: progress.todayClickCount,
    target: 100,
    rewardSummary: "동연 코인 +120 / 에너지 바 +1",
    rewards: [
      { kind: "material", code: "club-coin", amount: 120, label: "동연 코인 +120" },
      { kind: "consumable", code: "energy-bar", amount: 1, label: "에너지 바 +1" }
    ],
    claimed: progress.claimedDailyMissionIds.includes("daily-click-100")
  },
  {
    id: "daily-defeat-50",
    label: "몬스터 50마리 처치",
    current: progress.todayDefeatedCount,
    target: 50,
    rewardSummary: "강화석 +3",
    rewards: [{ kind: "material", code: "enhancement-stone", amount: 3, label: "강화석 +3" }],
    claimed: progress.claimedDailyMissionIds.includes("daily-defeat-50")
  },
  {
    id: "daily-enhance-1",
    label: "장비 1회 강화",
    current: progress.dailyEnhanceCount,
    target: 1,
    rewardSummary: "고급 강화석 +1",
    rewards: [{ kind: "material", code: "refined-stone", amount: 1, label: "고급 강화석 +1" }],
    claimed: progress.claimedDailyMissionIds.includes("daily-enhance-1")
  },
  {
    id: "daily-card-popularity-20",
    label: "카드 인기도 20 올리기",
    current: progress.dailyCardPopularityGain,
    target: 20,
    rewardSummary: "카드 조각 +4",
    rewards: [{ kind: "material", code: "card-shard", amount: 4, label: "카드 조각 +4" }],
    claimed: progress.claimedDailyMissionIds.includes("daily-card-popularity-20")
  },
  {
    id: "daily-consumable-3",
    label: "소비 아이템 3개 사용",
    current: progress.dailyConsumableUseCount,
    target: 3,
    rewardSummary: "에너지 바 +1 / 카드 조각 +2",
    rewards: [
      { kind: "consumable", code: "energy-bar", amount: 1, label: "에너지 바 +1" },
      { kind: "material", code: "card-shard", amount: 2, label: "카드 조각 +2" }
    ],
    claimed: progress.claimedDailyMissionIds.includes("daily-consumable-3")
  }
];

export const getWeeklyMissions = (
  progress: HuntingProgress,
  equippedCount: number,
  ownedEquipmentCount: number,
  selectedCardLevel: number
): MissionEntry[] => [
  {
    id: "weekly-boss-10",
    label: "보스 10회 처치",
    current: progress.weeklyBossDefeatedCount,
    target: 10,
    rewardSummary: "젬 +10 / 고급 강화석 +2",
    rewards: [
      { kind: "material", code: "gem", amount: 10, label: "젬 +10" },
      { kind: "material", code: "refined-stone", amount: 2, label: "고급 강화석 +2" }
    ],
    claimed: progress.claimedWeeklyMissionIds.includes("weekly-boss-10")
  },
  {
    id: "weekly-rare-equip-3",
    label: "희귀 장비 3개 획득",
    current: ownedEquipmentCount,
    target: 3,
    rewardSummary: "동연 코인 +250 / 카드 조각 +5",
    rewards: [
      { kind: "material", code: "club-coin", amount: 250, label: "동연 코인 +250" },
      { kind: "material", code: "card-shard", amount: 5, label: "카드 조각 +5" }
    ],
    claimed: progress.claimedWeeklyMissionIds.includes("weekly-rare-equip-3")
  },
  {
    id: "weekly-set-4",
    label: "세트 4개 부위 장착",
    current: equippedCount,
    target: 4,
    rewardSummary: "이벤트 토큰 +5",
    rewards: [{ kind: "material", code: "event-token", amount: 5, label: "이벤트 토큰 +5" }],
    claimed: progress.claimedWeeklyMissionIds.includes("weekly-set-4")
  },
  {
    id: "weekly-card-level-up",
    label: "카드 레벨 1 상승",
    current: Math.max(0, selectedCardLevel - 1),
    target: 1,
    rewardSummary: "팬레터 +2 / 카드 조각 +3",
    rewards: [
      { kind: "consumable", code: "fan-letter", amount: 2, label: "팬레터 +2" },
      { kind: "material", code: "card-shard", amount: 3, label: "카드 조각 +3" }
    ],
    claimed: progress.claimedWeeklyMissionIds.includes("weekly-card-level-up")
  }
];

export const getAchievements = (
  progress: HuntingProgress,
  maxEnhanceLevel: number,
  equippedCount: number,
  selectedCardPopularity: number
): MissionEntry[] => [
  {
    id: "achievement-total-click-1000",
    label: "총 클릭 1,000회",
    current: progress.totalClickCount,
    target: 1000,
    rewardSummary: "젬 +30",
    rewards: [{ kind: "material", code: "gem", amount: 30, label: "젬 +30" }],
    claimed: progress.claimedAchievementIds.includes("achievement-total-click-1000")
  },
  {
    id: "achievement-enhance-10",
    label: "장비 +10 달성",
    current: maxEnhanceLevel,
    target: 10,
    rewardSummary: "보호 주문서 +2",
    rewards: [{ kind: "consumable", code: "protection-scroll", amount: 2, label: "보호 주문서 +2" }],
    claimed: progress.claimedAchievementIds.includes("achievement-enhance-10")
  },
  {
    id: "achievement-full-set",
    label: "특정 세트 완성",
    current: equippedCount,
    target: 6,
    rewardSummary: "젬 +20 / 이벤트 토큰 +10",
    rewards: [
      { kind: "material", code: "gem", amount: 20, label: "젬 +20" },
      { kind: "material", code: "event-token", amount: 10, label: "이벤트 토큰 +10" }
    ],
    claimed: progress.claimedAchievementIds.includes("achievement-full-set")
  },
  {
    id: "achievement-card-popularity-100",
    label: "특정 카드 인기 100 달성",
    current: selectedCardPopularity,
    target: 100,
    rewardSummary: "바이럴 티켓 +2",
    rewards: [{ kind: "consumable", code: "viral-ticket", amount: 2, label: "바이럴 티켓 +2" }],
    claimed: progress.claimedAchievementIds.includes("achievement-card-popularity-100")
  }
];

export const applyMissionRewards = (progress: HuntingProgress, mission: MissionEntry): HuntingProgress => {
  const next = {
    ...progress,
    materials: { ...progress.materials },
    consumables: { ...progress.consumables }
  };

  mission.rewards.forEach((reward) => {
    if (reward.kind === "material") {
      next.materials[reward.code] += reward.amount;
    } else {
      next.consumables[reward.code] += reward.amount;
    }
  });

  if (mission.id.startsWith("daily-")) {
    next.claimedDailyMissionIds = [...new Set([...progress.claimedDailyMissionIds, mission.id])];
  } else if (mission.id.startsWith("weekly-")) {
    next.claimedWeeklyMissionIds = [...new Set([...progress.claimedWeeklyMissionIds, mission.id])];
  } else {
    next.claimedAchievementIds = [...new Set([...progress.claimedAchievementIds, mission.id])];
  }

  return next;
};

export const getMissionRewardText = (mission: MissionEntry): string =>
  mission.rewardSummary || dailyRewardSummary(mission.rewards);
