import type {
  EquipmentEnhancePreview,
  PowerRankingEquipmentCatalogEntry,
  PowerRankingEquipmentCode,
  PowerRankingEquipmentSlot
} from "../types";

export interface PowerRankingEquipmentEnhancementTier {
  level: number;
  successRate: number;
  stoneCost: number;
  failurePenalty: string;
}

export const powerRankingEquipmentSlotLabels: Record<PowerRankingEquipmentSlot, string> = {
  weapon: "무기",
  head: "머리",
  top: "상의",
  bottom: "하의",
  shoes: "신발",
  gloves: "장갑"
};

export const powerRankingEquipmentCatalog: Record<string, PowerRankingEquipmentCatalogEntry> = {
  "training-branch": {
    code: "training-branch",
    slot: "weapon",
    name: "수련용 나뭇가지",
    description: "초보 숲에서 얻는 가장 기본적인 무기입니다.",
    imageUrl: "/assets/equipment/crown-of-cheers.svg",
    effectSummary: "무기 공격력 +18"
  },
  "iron-pickaxe": {
    code: "iron-pickaxe",
    slot: "weapon",
    name: "철제 곡괭이",
    description: "돌언덕 광산에서 얻는 채광 겸용 무기입니다.",
    imageUrl: "/assets/equipment/titan-gauntlet.svg",
    effectSummary: "무기 공격력 +38"
  },
  "fallen-order-blade": {
    code: "fallen-order-blade",
    slot: "weapon",
    name: "몰락 기사단의 검",
    description: "폐허 기사단 성채에서 얻는 본격 전투 무기입니다.",
    imageUrl: "/assets/equipment/commander-jacket.svg",
    effectSummary: "무기 공격력 +72"
  },
  "crown-of-cheers": {
    code: "crown-of-cheers",
    slot: "head",
    name: "환호의 왕관",
    description: "추천 시 적용 수치가 2배가 됩니다.",
    imageUrl: "/assets/equipment/crown-of-cheers.svg",
    effectSummary: "추천량 2배"
  },
  "star-visor": {
    code: "star-visor",
    slot: "head",
    name: "별빛 바이저",
    description: "추천 또는 비추천 첫 반영 시 추가로 +5 보정을 받습니다.",
    imageUrl: "/assets/equipment/star-visor.svg",
    effectSummary: "하루 첫 반영 +5"
  },
  "mint-beret": {
    code: "mint-beret",
    slot: "head",
    name: "민트 베레모",
    description: "소비 아이템 드롭 확률이 증가합니다.",
    imageUrl: "/assets/equipment/mint-beret.svg",
    effectSummary: "소비 아이템 드롭률 +1.5%"
  },
  "commander-jacket": {
    code: "commander-jacket",
    slot: "top",
    name: "사령관 재킷",
    description: "추천 시 추가로 +1 수치를 더합니다.",
    imageUrl: "/assets/equipment/commander-jacket.svg",
    effectSummary: "추천량 +1"
  },
  "ribbon-cardigan": {
    code: "ribbon-cardigan",
    slot: "top",
    name: "리본 가디건",
    description: "소비 아이템과 장비 드롭 확률이 모두 조금씩 증가합니다.",
    imageUrl: "/assets/equipment/ribbon-cardigan.svg",
    effectSummary: "전체 드롭률 +1%"
  },
  "golden-harness": {
    code: "golden-harness",
    slot: "top",
    name: "골든 하네스",
    description: "아이템 사용 시 적용 수치가 추가됩니다.",
    imageUrl: "/assets/equipment/golden-harness.svg",
    effectSummary: "소비 아이템 위력 +20"
  },
  "midnight-slacks": {
    code: "midnight-slacks",
    slot: "bottom",
    name: "미드나잇 슬랙스",
    description: "비추천 시 적용 수치가 2배가 됩니다.",
    imageUrl: "/assets/equipment/midnight-slacks.svg",
    effectSummary: "인기도 내리기 2배"
  },
  "wave-denim": {
    code: "wave-denim",
    slot: "bottom",
    name: "웨이브 데님",
    description: "비추천 반영 시 추가로 -1 수치를 더합니다.",
    imageUrl: "/assets/equipment/wave-denim.svg",
    effectSummary: "인기도 내리기 -1 추가"
  },
  "aurora-skirt": {
    code: "aurora-skirt",
    slot: "bottom",
    name: "오로라 스커트",
    description: "장비 아이템 드롭 확률이 증가합니다.",
    imageUrl: "/assets/equipment/aurora-skirt.svg",
    effectSummary: "장비 드롭률 +1.5%"
  },
  "thunder-boots": {
    code: "thunder-boots",
    slot: "shoes",
    name: "썬더 부츠",
    description: "하루 첫 반영 시 추가로 +5 보정을 받습니다.",
    imageUrl: "/assets/equipment/thunder-boots.svg",
    effectSummary: "하루 첫 반영 +5"
  },
  "crystal-sneakers": {
    code: "crystal-sneakers",
    slot: "shoes",
    name: "크리스털 스니커즈",
    description: "소비 아이템 드롭 확률이 증가합니다.",
    imageUrl: "/assets/equipment/crystal-sneakers.svg",
    effectSummary: "소비 아이템 드롭률 +1%"
  },
  "ember-heels": {
    code: "ember-heels",
    slot: "shoes",
    name: "엠버 힐",
    description: "장비 아이템 드롭 확률이 증가합니다.",
    imageUrl: "/assets/equipment/ember-heels.svg",
    effectSummary: "장비 드롭률 +1%"
  },
  "titan-gauntlet": {
    code: "titan-gauntlet",
    slot: "gloves",
    name: "타이탄 건틀릿",
    description: "추천과 비추천 모두 기본 수치에 +1 보정을 더합니다.",
    imageUrl: "/assets/equipment/titan-gauntlet.svg",
    effectSummary: "모든 반영 수치 +1"
  },
  "silk-gloves": {
    code: "silk-gloves",
    slot: "gloves",
    name: "실크 글러브",
    description: "소비 아이템 사용 시 위력이 추가됩니다.",
    imageUrl: "/assets/equipment/silk-gloves.svg",
    effectSummary: "소비 아이템 위력 +10"
  },
  "pulse-gloves": {
    code: "pulse-gloves",
    slot: "gloves",
    name: "펄스 글러브",
    description: "추천 시 아이템 드롭을 노리기 좋습니다.",
    imageUrl: "/assets/equipment/pulse-gloves.svg",
    effectSummary: "전체 드롭률 +0.8%"
  }
};

export const powerRankingEquipmentCodes = Object.keys(powerRankingEquipmentCatalog);

const enhancementStoneBaseBySlot: Record<PowerRankingEquipmentSlot, number> = {
  weapon: 2,
  head: 1,
  top: 2,
  bottom: 2,
  shoes: 1,
  gloves: 1
};

const enhancementStoneBonusByCode: Partial<Record<PowerRankingEquipmentCode, number>> = {
  "crown-of-cheers": 1,
  "golden-harness": 1,
  "midnight-slacks": 1,
  "aurora-skirt": 1,
  "titan-gauntlet": 1,
  "fallen-order-blade": 2
};

export const getPowerRankingEquipmentEnhancementPlan = (
  equipmentCode: PowerRankingEquipmentCode
): PowerRankingEquipmentEnhancementTier[] => {
  const equipment = powerRankingEquipmentCatalog[equipmentCode];
  const baseStoneCost = enhancementStoneBaseBySlot[equipment.slot] + (enhancementStoneBonusByCode[equipmentCode] ?? 0);

  return [
    { level: 1, successRate: 1, stoneCost: baseStoneCost, failurePenalty: "없음" },
    { level: 2, successRate: 1, stoneCost: baseStoneCost + 1, failurePenalty: "없음" },
    { level: 3, successRate: 1, stoneCost: baseStoneCost + 1, failurePenalty: "없음" },
    { level: 4, successRate: 1, stoneCost: baseStoneCost + 2, failurePenalty: "없음" },
    { level: 5, successRate: 1, stoneCost: baseStoneCost + 2, failurePenalty: "없음" },
    { level: 6, successRate: 0.8, stoneCost: baseStoneCost + 3, failurePenalty: "없음" },
    { level: 7, successRate: 0.65, stoneCost: baseStoneCost + 4, failurePenalty: "없음" },
    { level: 8, successRate: 0.5, stoneCost: baseStoneCost + 5, failurePenalty: "강화석 추가 소모" },
    { level: 9, successRate: 0.35, stoneCost: baseStoneCost + 6, failurePenalty: "유지" },
    { level: 10, successRate: 0.2, stoneCost: baseStoneCost + 8, failurePenalty: "유지" }
  ];
};

export const getPowerRankingEquipmentEnhancePreview = (
  equipmentCode: PowerRankingEquipmentCode,
  currentLevel: number
): EquipmentEnhancePreview | null => {
  const nextTier = getPowerRankingEquipmentEnhancementPlan(equipmentCode).find(
    (tier) => tier.level === currentLevel + 1
  );
  if (!nextTier) {
    return null;
  }

  const nextBattleBonus = nextTier.level * 8 + (nextTier.level >= 8 ? 10 : 0);

  return {
    equipmentCode,
    currentLevel,
    nextLevel: nextTier.level,
    successRate: nextTier.successRate,
    stoneCost: nextTier.stoneCost,
    goldCost: nextTier.stoneCost * 120 + nextTier.level * 40,
    failurePenalty: nextTier.failurePenalty,
    nextEffectSummary: `사냥 전투력 보정 +${nextBattleBonus}`
  };
};
