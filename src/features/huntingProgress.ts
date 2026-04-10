import type { PowerRankingEquipmentCode } from "../types";

export type HuntingMaterialCode =
  | "club-coin"
  | "gem"
  | "enhancement-stone"
  | "refined-stone"
  | "ancient-core"
  | "card-shard"
  | "event-token";
export type HuntingMiscCode =
  | "night-snack-ticket"
  | "festival-exchange-coupon";
export type HuntingConsumableCode =
  | "healing-potion"
  | "medium-healing-potion"
  | "power-potion"
  | "berserk-tonic"
  | "lucky-scroll"
  | "harvest-booster"
  | "energy-bar"
  | "energy-drink"
  | "fan-letter"
  | "cheering-stick"
  | "viral-ticket"
  | "protection-scroll";

export type HuntingProgress = {
  level: number;
  exp: number;
  endurance: number;
  selectedStageId: string;
  selectedMonsterId: string;
  autoAttackEnabled: boolean;
  materials: Record<HuntingMaterialCode, number>;
  miscItems: Record<HuntingMiscCode, number>;
  consumables: Record<HuntingConsumableCode, number>;
  enhancementLevels: Partial<Record<PowerRankingEquipmentCode, number>>;
  cardLevels: Record<string, number>;
  cardPopularity: Record<string, number>;
  totalDefeated: number;
  totalClickCount: number;
  totalBossDefeated: number;
  totalConsumablesUsed: number;
  todayClickCount: number;
  todayDefeatedCount: number;
  dailyEnhanceCount: number;
  dailyConsumableUseCount: number;
  dailyCardPopularityGain: number;
  weeklyBossDefeatedCount: number;
  claimedDailyMissionIds: string[];
  claimedWeeklyMissionIds: string[];
  claimedAchievementIds: string[];
  lastDailyResetDate: string;
  lastWeeklyResetDate: string;
  selectedCardTargetId: string;
  cardSupportPoints: number;
};

export const MAX_ENDURANCE = 100;

const getTodayDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekDateKey = (): string => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  now.setDate(now.getDate() + diff);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
};

export const materialMeta: Record<HuntingMaterialCode, { name: string; description: string }> = {
  "club-coin": { name: "동연 코인", description: "사냥터 경제와 상점에 쓰이는 기본 화폐입니다." },
  gem: { name: "젬", description: "상점과 이벤트 교환에 쓰이는 상위 재화입니다." },
  "enhancement-stone": { name: "강화석", description: "장비 강화의 기본 재료입니다." },
  "refined-stone": { name: "고급 강화석", description: "+8 이상 강화 보조 재료로 사용됩니다." },
  "ancient-core": { name: "제작 재료", description: "상위 사냥터에서 얻는 희귀 제작 재료입니다." },
  "card-shard": { name: "카드 조각", description: "카드 성장과 해금에 쓰이는 조각입니다." },
  "event-token": { name: "이벤트 토큰", description: "기간 한정 교환 상점에 쓰이는 토큰입니다." }
};

export const miscMeta: Record<HuntingMiscCode, { name: string; description: string }> = {
  "night-snack-ticket": {
    name: "야식 교환권",
    description: "야식 교환권이 1000개 모이면 개발자에게 말해보세요. 좋은 일이 있을지도 모릅니다."
  },
  "festival-exchange-coupon": {
    name: "축제 교환권",
    description: "시즌 이벤트 상점에서 한정 보상과 교환하는 기타 아이템입니다."
  }
};

export const consumableMeta: Record<
  HuntingConsumableCode,
  { name: string; description: string; category: "회복형" | "공격 버프형" | "드랍 버프형" | "클릭 회복형" | "카드 성장형" | "보호형" }
> = {
  "healing-potion": { name: "작은 회복 물약", description: "지구력 35를 회복합니다.", category: "회복형" },
  "medium-healing-potion": { name: "중형 회복 물약", description: "지구력 60을 회복합니다.", category: "회복형" },
  "power-potion": { name: "힘의 물약", description: "다음 6회 공격의 기본 위력을 올립니다.", category: "공격 버프형" },
  "berserk-tonic": { name: "광폭 스크롤", description: "다음 8회 공격의 최종 공격력을 크게 끌어올립니다.", category: "공격 버프형" },
  "lucky-scroll": { name: "행운의 가루", description: "다음 5회 처치 동안 드랍 효율이 증가합니다.", category: "드랍 버프형" },
  "harvest-booster": { name: "채집 증폭제", description: "다음 7회 처치 동안 재료 드랍 수량이 증가합니다.", category: "드랍 버프형" },
  "energy-bar": { name: "에너지 바", description: "오늘의 클릭 여유를 12 회복합니다.", category: "클릭 회복형" },
  "energy-drink": { name: "고농축 에너지 드링크", description: "오늘의 클릭 여유를 24 회복합니다.", category: "클릭 회복형" },
  "fan-letter": { name: "팬레터", description: "선택한 카드의 성장 포인트를 2 올립니다.", category: "카드 성장형" },
  "cheering-stick": { name: "응원봉", description: "선택한 카드의 성장 포인트를 4 올립니다.", category: "카드 성장형" },
  "viral-ticket": { name: "바이럴 티켓", description: "선택한 카드의 성장 포인트를 6 올립니다.", category: "카드 성장형" },
  "protection-scroll": { name: "보호 주문서", description: "고강화 실패 시 추가 손실을 막아줍니다.", category: "보호형" }
};

export const createDefaultProgress = (): HuntingProgress => ({
  level: 1,
  exp: 0,
  endurance: MAX_ENDURANCE,
  selectedStageId: "beginner-yard",
  selectedMonsterId: "slime-chairman",
  autoAttackEnabled: false,
  materials: {
    "club-coin": 0,
    gem: 0,
    "enhancement-stone": 0,
    "refined-stone": 0,
    "ancient-core": 0,
    "card-shard": 0,
    "event-token": 0
  },
  miscItems: {
    "night-snack-ticket": 0,
    "festival-exchange-coupon": 0
  },
  consumables: {
    "healing-potion": 0,
    "medium-healing-potion": 0,
    "power-potion": 0,
    "berserk-tonic": 0,
    "lucky-scroll": 0,
    "harvest-booster": 0,
    "energy-bar": 0,
    "energy-drink": 0,
    "fan-letter": 0,
    "cheering-stick": 0,
    "viral-ticket": 0,
    "protection-scroll": 0
  },
  enhancementLevels: {},
  cardLevels: {},
  cardPopularity: {},
  totalDefeated: 0,
  totalClickCount: 0,
  totalBossDefeated: 0,
  totalConsumablesUsed: 0,
  todayClickCount: 0,
  todayDefeatedCount: 0,
  dailyEnhanceCount: 0,
  dailyConsumableUseCount: 0,
  dailyCardPopularityGain: 0,
  weeklyBossDefeatedCount: 0,
  claimedDailyMissionIds: [],
  claimedWeeklyMissionIds: [],
  claimedAchievementIds: [],
  lastDailyResetDate: getTodayDateKey(),
  lastWeeklyResetDate: getWeekDateKey(),
  selectedCardTargetId: "",
  cardSupportPoints: 0
});

export const getHuntingStorageKey = (userId: string): string => `dongyeon-hunting:${userId}`;

export const loadHuntingProgress = (storageKey: string): HuntingProgress => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return createDefaultProgress();
    }
    const parsed = JSON.parse(raw) as Partial<HuntingProgress>;
    const currentDateKey = getTodayDateKey();
    const currentWeekKey = getWeekDateKey();
    const needsDailyReset = parsed.lastDailyResetDate !== currentDateKey;
    const needsWeeklyReset = parsed.lastWeeklyResetDate !== currentWeekKey;
    return {
      ...createDefaultProgress(),
      ...parsed,
      materials: {
        ...createDefaultProgress().materials,
        ...(parsed.materials ?? {})
      },
      miscItems: {
        ...createDefaultProgress().miscItems,
        ...(parsed.miscItems ?? {})
      },
      consumables: {
        ...createDefaultProgress().consumables,
        ...(parsed.consumables ?? {})
      },
      enhancementLevels: parsed.enhancementLevels ?? {},
      cardLevels: parsed.cardLevels ?? {},
      cardPopularity: parsed.cardPopularity ?? {},
      totalClickCount: parsed.totalClickCount ?? 0,
      totalBossDefeated: parsed.totalBossDefeated ?? 0,
      totalConsumablesUsed: parsed.totalConsumablesUsed ?? 0,
      todayClickCount: needsDailyReset ? 0 : parsed.todayClickCount ?? 0,
      todayDefeatedCount: needsDailyReset ? 0 : parsed.todayDefeatedCount ?? 0,
      dailyEnhanceCount: needsDailyReset ? 0 : parsed.dailyEnhanceCount ?? 0,
      dailyConsumableUseCount: needsDailyReset ? 0 : parsed.dailyConsumableUseCount ?? 0,
      dailyCardPopularityGain: needsDailyReset ? 0 : parsed.dailyCardPopularityGain ?? 0,
      weeklyBossDefeatedCount: needsWeeklyReset ? 0 : parsed.weeklyBossDefeatedCount ?? 0,
      claimedDailyMissionIds: needsDailyReset ? [] : parsed.claimedDailyMissionIds ?? [],
      claimedWeeklyMissionIds: needsWeeklyReset ? [] : parsed.claimedWeeklyMissionIds ?? [],
      claimedAchievementIds: parsed.claimedAchievementIds ?? [],
      lastDailyResetDate: currentDateKey,
      lastWeeklyResetDate: currentWeekKey
    };
  } catch {
    return createDefaultProgress();
  }
};

export const saveHuntingProgress = (storageKey: string, progress: HuntingProgress): void => {
  window.localStorage.setItem(storageKey, JSON.stringify(progress));
};

export const getExpToNextLevel = (level: number): number => 80 + (level - 1) * 45;
