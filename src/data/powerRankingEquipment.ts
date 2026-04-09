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
    name: "캠퍼스 가이드 봉",
    description: "캠퍼스 가이드 구역에서 주워 드는 입문용 응원 봉형 무기입니다.",
    imageUrl: "/assets/equipment/crown-of-cheers.svg",
    effectSummary: "무기 공격력 +18"
  },
  "iron-pickaxe": {
    code: "iron-pickaxe",
    slot: "weapon",
    name: "연구성과 곡괭이",
    description: "연구성과 광맥을 캐내는 광산 전용 실전 무기입니다.",
    imageUrl: "/assets/equipment/titan-gauntlet.svg",
    effectSummary: "무기 공격력 +38"
  },
  "fallen-order-blade": {
    code: "fallen-order-blade",
    slot: "weapon",
    name: "헤리티지 블레이드",
    description: "헤리티지와 전통의 무게를 담은 성채 등급 검입니다.",
    imageUrl: "/assets/equipment/commander-jacket.svg",
    effectSummary: "무기 공격력 +72"
  },
  "crown-of-cheers": {
    code: "crown-of-cheers",
    slot: "head",
    name: "연세포커스 크라운",
    description: "연세포커스의 시선을 모아 추천 수치를 크게 끌어올립니다.",
    imageUrl: "/assets/equipment/crown-of-cheers.svg",
    effectSummary: "추천량 2배"
  },
  "star-visor": {
    code: "star-visor",
    slot: "head",
    name: "연세다움 바이저",
    description: "연세다움의 첫 인상을 살려 하루 첫 반영에 추가 보정을 줍니다.",
    imageUrl: "/assets/equipment/star-visor.svg",
    effectSummary: "하루 첫 반영 +5"
  },
  "mint-beret": {
    code: "mint-beret",
    slot: "head",
    name: "학생홍보대사 베레모",
    description: "학생홍보대사처럼 동선을 넓게 보며 소비 아이템 드롭을 끌어올립니다.",
    imageUrl: "/assets/equipment/mint-beret.svg",
    effectSummary: "소비 아이템 드롭률 +1.5%"
  },
  "commander-jacket": {
    code: "commander-jacket",
    slot: "top",
    name: "연세비전 재킷",
    description: "연세비전의 추진력을 담아 추천 수치를 추가로 올립니다.",
    imageUrl: "/assets/equipment/commander-jacket.svg",
    effectSummary: "추천량 +1"
  },
  "ribbon-cardigan": {
    code: "ribbon-cardigan",
    slot: "top",
    name: "브로슈어 가디건",
    description: "브로슈어처럼 정보가 잘 퍼지도록 전체 드롭 효율을 높입니다.",
    imageUrl: "/assets/equipment/ribbon-cardigan.svg",
    effectSummary: "전체 드롭률 +1%"
  },
  "golden-harness": {
    code: "golden-harness",
    slot: "top",
    name: "발전기금 하네스",
    description: "지원 효과를 증폭해 소비 아이템 사용 위력을 늘립니다.",
    imageUrl: "/assets/equipment/golden-harness.svg",
    effectSummary: "소비 아이템 위력 +20"
  },
  "midnight-slacks": {
    code: "midnight-slacks",
    slot: "bottom",
    name: "수강신청 슬랙스",
    description: "빠른 판단이 필요한 상황에서 내리기 수치를 강하게 밀어줍니다.",
    imageUrl: "/assets/equipment/midnight-slacks.svg",
    effectSummary: "인기도 내리기 2배"
  },
  "wave-denim": {
    code: "wave-denim",
    slot: "bottom",
    name: "학사일정 데님",
    description: "학사일정처럼 정확하게 맞춰 비추천 반영을 더 날카롭게 만듭니다.",
    imageUrl: "/assets/equipment/wave-denim.svg",
    effectSummary: "인기도 내리기 -1 추가"
  },
  "aurora-skirt": {
    code: "aurora-skirt",
    slot: "bottom",
    name: "장학금 스커트",
    description: "장학금 안내처럼 보상을 선명하게 보여 장비 드롭을 끌어올립니다.",
    imageUrl: "/assets/equipment/aurora-skirt.svg",
    effectSummary: "장비 드롭률 +1.5%"
  },
  "thunder-boots": {
    code: "thunder-boots",
    slot: "shoes",
    name: "캠퍼스 견학 부츠",
    description: "캠퍼스를 먼저 훑고 들어가 하루 첫 반영에 보정을 더합니다.",
    imageUrl: "/assets/equipment/thunder-boots.svg",
    effectSummary: "하루 첫 반영 +5"
  },
  "crystal-sneakers": {
    code: "crystal-sneakers",
    slot: "shoes",
    name: "정기 견학 스니커즈",
    description: "동선을 효율적으로 밟아 소비 아이템을 더 잘 발견합니다.",
    imageUrl: "/assets/equipment/crystal-sneakers.svg",
    effectSummary: "소비 아이템 드롭률 +1%"
  },
  "ember-heels": {
    code: "ember-heels",
    slot: "shoes",
    name: "교환프로그램 워커",
    description: "새 구역을 넓게 돌아다니며 장비 아이템 드롭을 높입니다.",
    imageUrl: "/assets/equipment/ember-heels.svg",
    effectSummary: "장비 드롭률 +1%"
  },
  "titan-gauntlet": {
    code: "titan-gauntlet",
    slot: "gloves",
    name: "학사지원 건틀릿",
    description: "학사지원실의 정밀함처럼 모든 반영 수치를 안정적으로 보정합니다.",
    imageUrl: "/assets/equipment/titan-gauntlet.svg",
    effectSummary: "모든 반영 수치 +1"
  },
  "silk-gloves": {
    code: "silk-gloves",
    slot: "gloves",
    name: "연구활동 글러브",
    description: "연구활동의 밀도를 담아 소비 아이템 사용 위력을 올립니다.",
    imageUrl: "/assets/equipment/silk-gloves.svg",
    effectSummary: "소비 아이템 위력 +10"
  },
  "pulse-gloves": {
    code: "pulse-gloves",
    slot: "gloves",
    name: "메리트 글러브",
    description: "메리트를 쌓듯 드롭 효율을 끌어올리는 파밍 특화 장갑입니다.",
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
