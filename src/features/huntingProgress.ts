import type { PowerRankingEquipmentCode } from "../types";

export type HuntingMaterialCode = "club-coin" | "enhancement-stone" | "refined-stone" | "ancient-core";
export type HuntingConsumableCode =
  | "healing-potion"
  | "berserk-tonic"
  | "lucky-scroll"
  | "protection-scroll";

export type HuntingProgress = {
  level: number;
  exp: number;
  endurance: number;
  selectedStageId: string;
  selectedMonsterId: string;
  autoAttackEnabled: boolean;
  materials: Record<HuntingMaterialCode, number>;
  consumables: Record<HuntingConsumableCode, number>;
  enhancementLevels: Partial<Record<PowerRankingEquipmentCode, number>>;
  totalDefeated: number;
  selectedCardTargetId: string;
  cardSupportPoints: number;
};

export const MAX_ENDURANCE = 100;

export const materialMeta: Record<HuntingMaterialCode, { name: string; description: string }> = {
  "club-coin": { name: "동연 코인", description: "사냥터 경제의 기본 화폐입니다." },
  "enhancement-stone": { name: "강화석", description: "장비 강화의 기본 재료입니다." },
  "refined-stone": { name: "정제 강화석", description: "+8 이상 강화 보조 재료로 사용됩니다." },
  "ancient-core": { name: "고대 코어", description: "상위 사냥터에서 얻는 희귀 성장 재료입니다." }
};

export const consumableMeta: Record<HuntingConsumableCode, { name: string; description: string }> = {
  "healing-potion": { name: "회복 포션", description: "지구력 35를 회복합니다." },
  "berserk-tonic": { name: "광폭 토닉", description: "다음 8회 공격의 최종 공격력을 끌어올립니다." },
  "lucky-scroll": { name: "행운 스크롤", description: "다음 5회 처치 동안 드랍 효율이 증가합니다." },
  "protection-scroll": { name: "보호 주문서", description: "고강화 실패 시 추가 손실을 막아줍니다." }
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
    "enhancement-stone": 0,
    "refined-stone": 0,
    "ancient-core": 0
  },
  consumables: {
    "healing-potion": 0,
    "berserk-tonic": 0,
    "lucky-scroll": 0,
    "protection-scroll": 0
  },
  enhancementLevels: {},
  totalDefeated: 0,
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
    return {
      ...createDefaultProgress(),
      ...parsed,
      materials: {
        ...createDefaultProgress().materials,
        ...(parsed.materials ?? {})
      },
      consumables: {
        ...createDefaultProgress().consumables,
        ...(parsed.consumables ?? {})
      },
      enhancementLevels: parsed.enhancementLevels ?? {}
    };
  } catch {
    return createDefaultProgress();
  }
};

export const saveHuntingProgress = (storageKey: string, progress: HuntingProgress): void => {
  window.localStorage.setItem(storageKey, JSON.stringify(progress));
};

export const getExpToNextLevel = (level: number): number => 80 + (level - 1) * 45;
