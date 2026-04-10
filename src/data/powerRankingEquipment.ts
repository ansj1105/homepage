import type {
  EquipmentEnhancePreview,
  PowerRankingEquipmentCatalogEntry,
  PowerRankingEquipmentCode,
  PowerRankingEquipmentSetId,
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

export const powerRankingEquipmentSetCatalog: Record<
  PowerRankingEquipmentSetId,
  {
    id: PowerRankingEquipmentSetId;
    name: string;
    typeLabel: string;
    requirement: string;
    bonusSummary: string;
  }
> = {
  "balanced-freshman": {
    id: "balanced-freshman",
    name: "초심자 탐험가 세트",
    typeLabel: "균형형",
    requirement: "초보 숲 계열 장비 2 / 4부위 장착",
    bonusSummary: "2세트 전투력 +8, 드랍 +4% / 4세트 전투 배수 +8%, 클릭 여유 +20"
  },
  "honor-knight": {
    id: "honor-knight",
    name: "명예 기사 세트",
    typeLabel: "전투형",
    requirement: "성채 기사단 계열 장비 2 / 4부위 장착",
    bonusSummary: "2세트 무기 공격력 +24 / 4세트 최종 전투 배수 +12%"
  },
  "golden-harvester": {
    id: "golden-harvester",
    name: "황금 수확자 세트",
    typeLabel: "파밍형",
    requirement: "평원/광산 파밍 장비 2 / 4부위 장착",
    bonusSummary: "2세트 드랍 +8% / 4세트 드랍 +14%, 보스 추가 롤 +6%"
  },
  "starlight-idol": {
    id: "starlight-idol",
    name: "별빛 아이돌 세트",
    typeLabel: "카드형",
    requirement: "별빛 무대 도시 계열 장비 2 / 4부위 장착",
    bonusSummary: "2세트 카드 성장 +14% / 4세트 카드 성장 +24%, 응원 포인트 획득 +1"
  },
  "gale-chaser": {
    id: "gale-chaser",
    name: "질풍 추적자 세트",
    typeLabel: "클릭형",
    requirement: "속도형 장비 2 / 4부위 장착",
    bonusSummary: "2세트 자동 성장 +10%, 클릭 여유 +25 / 4세트 자동 성장 +18%, 전투 배수 +5%"
  }
};

const equipmentSetName = (setId: PowerRankingEquipmentSetId): string =>
  powerRankingEquipmentSetCatalog[setId].name;

export const powerRankingEquipmentCatalog: Record<string, PowerRankingEquipmentCatalogEntry> = {
  "training-branch": {
    code: "training-branch",
    slot: "weapon",
    name: "캠퍼스 가이드 봉",
    description: "캠퍼스 가이드 구역에서 주워 드는 입문용 응원 봉형 무기입니다.",
    imageUrl: "/assets/equipment/crown-of-cheers.svg",
    setId: "balanced-freshman",
    setName: equipmentSetName("balanced-freshman"),
    rarity: "common",
    effectSummary: "무기 공격력 +18"
  },
  "iron-pickaxe": {
    code: "iron-pickaxe",
    slot: "weapon",
    name: "연구성과 곡괭이",
    description: "연구성과 광맥을 캐내는 광산 전용 실전 무기입니다.",
    imageUrl: "/assets/equipment/titan-gauntlet.svg",
    setId: "golden-harvester",
    setName: equipmentSetName("golden-harvester"),
    rarity: "rare",
    effectSummary: "무기 공격력 +38"
  },
  "fallen-order-blade": {
    code: "fallen-order-blade",
    slot: "weapon",
    name: "헤리티지 블레이드",
    description: "헤리티지와 전통의 무게를 담은 성채 등급 검입니다.",
    imageUrl: "/assets/equipment/commander-jacket.svg",
    setId: "honor-knight",
    setName: equipmentSetName("honor-knight"),
    rarity: "legendary",
    effectSummary: "무기 공격력 +72"
  },
  "heritage-spear": {
    code: "heritage-spear",
    slot: "weapon",
    name: "연세 헤리티지 랜스",
    description: "연세의 상징과 전통을 전투력으로 직결하는 기사단 창입니다.",
    imageUrl: "/assets/equipment/commander-jacket.svg",
    setId: "honor-knight",
    setName: equipmentSetName("honor-knight"),
    rarity: "epic",
    effectSummary: "무기 공격력 +58"
  },
  "spotlight-mic": {
    code: "spotlight-mic",
    slot: "weapon",
    name: "별빛 스포트라이트 마이크",
    description: "무대의 중심을 붙잡아 카드 성장 루프를 돕는 아이돌 무기입니다.",
    imageUrl: "/assets/equipment/star-visor.svg",
    setId: "starlight-idol",
    setName: equipmentSetName("starlight-idol"),
    rarity: "epic",
    effectSummary: "무기 공격력 +46, 카드 성장 +4%"
  },
  "crown-of-cheers": {
    code: "crown-of-cheers",
    slot: "head",
    name: "연세포커스 크라운",
    description: "연세포커스의 시선을 모아 추천 수치를 크게 끌어올립니다.",
    imageUrl: "/assets/equipment/crown-of-cheers.svg",
    setId: "honor-knight",
    setName: equipmentSetName("honor-knight"),
    rarity: "legendary",
    effectSummary: "추천량 2배"
  },
  "star-visor": {
    code: "star-visor",
    slot: "head",
    name: "연세다움 바이저",
    description: "연세다움의 첫 인상을 살려 하루 첫 반영에 추가 보정을 줍니다.",
    imageUrl: "/assets/equipment/star-visor.svg",
    setId: "starlight-idol",
    setName: equipmentSetName("starlight-idol"),
    rarity: "rare",
    effectSummary: "하루 첫 반영 +5"
  },
  "mint-beret": {
    code: "mint-beret",
    slot: "head",
    name: "학생홍보대사 베레모",
    description: "학생홍보대사처럼 동선을 넓게 보며 소비 아이템 드롭을 끌어올립니다.",
    imageUrl: "/assets/equipment/mint-beret.svg",
    setId: "balanced-freshman",
    setName: equipmentSetName("balanced-freshman"),
    rarity: "common",
    effectSummary: "소비 아이템 드롭률 +1.5%"
  },
  "archive-circlet": {
    code: "archive-circlet",
    slot: "head",
    name: "연세 아카이브 서클릿",
    description: "기록과 정리를 통해 세트 정합성을 높여 전투 흐름을 안정시킵니다.",
    imageUrl: "/assets/equipment/mint-beret.svg",
    setId: "honor-knight",
    setName: equipmentSetName("honor-knight"),
    rarity: "epic",
    effectSummary: "무기 공격력 +12"
  },
  "route-cap": {
    code: "route-cap",
    slot: "head",
    name: "질풍 루트 캡",
    description: "이동 동선을 최적화해 자동 사냥 템포와 클릭 여유를 보정합니다.",
    imageUrl: "/assets/equipment/mint-beret.svg",
    setId: "gale-chaser",
    setName: equipmentSetName("gale-chaser"),
    rarity: "rare",
    effectSummary: "자동 성장 +5%, 클릭 여유 +10"
  },
  "commander-jacket": {
    code: "commander-jacket",
    slot: "top",
    name: "연세비전 재킷",
    description: "연세비전의 추진력을 담아 추천 수치를 추가로 올립니다.",
    imageUrl: "/assets/equipment/commander-jacket.svg",
    setId: "honor-knight",
    setName: equipmentSetName("honor-knight"),
    rarity: "epic",
    effectSummary: "추천량 +1"
  },
  "ribbon-cardigan": {
    code: "ribbon-cardigan",
    slot: "top",
    name: "브로슈어 가디건",
    description: "브로슈어처럼 정보가 잘 퍼지도록 전체 드롭 효율을 높입니다.",
    imageUrl: "/assets/equipment/ribbon-cardigan.svg",
    setId: "balanced-freshman",
    setName: equipmentSetName("balanced-freshman"),
    rarity: "common",
    effectSummary: "전체 드롭률 +1%"
  },
  "golden-harness": {
    code: "golden-harness",
    slot: "top",
    name: "발전기금 하네스",
    description: "지원 효과를 증폭해 소비 아이템 사용 위력을 늘립니다.",
    imageUrl: "/assets/equipment/golden-harness.svg",
    setId: "golden-harvester",
    setName: equipmentSetName("golden-harvester"),
    rarity: "rare",
    effectSummary: "소비 아이템 위력 +20"
  },
  "heritage-coat": {
    code: "heritage-coat",
    slot: "top",
    name: "명예 기사 코트",
    description: "성채 기사단장의 외투를 복각한 전투 특화 상의입니다.",
    imageUrl: "/assets/equipment/commander-jacket.svg",
    setId: "honor-knight",
    setName: equipmentSetName("honor-knight"),
    rarity: "legendary",
    effectSummary: "상의 피해 +16%, 무기 공격력 +8"
  },
  "spotlight-blazer": {
    code: "spotlight-blazer",
    slot: "top",
    name: "스포트라이트 블레이저",
    description: "무대 위 시선을 모아 카드 인기와 응원 포인트 수급을 보정합니다.",
    imageUrl: "/assets/equipment/ribbon-cardigan.svg",
    setId: "starlight-idol",
    setName: equipmentSetName("starlight-idol"),
    rarity: "epic",
    effectSummary: "카드 성장 +8%, 드랍률 +2%"
  },
  "midnight-slacks": {
    code: "midnight-slacks",
    slot: "bottom",
    name: "수강신청 슬랙스",
    description: "빠른 판단이 필요한 상황에서 내리기 수치를 강하게 밀어줍니다.",
    imageUrl: "/assets/equipment/midnight-slacks.svg",
    setId: "gale-chaser",
    setName: equipmentSetName("gale-chaser"),
    rarity: "rare",
    effectSummary: "인기도 내리기 2배"
  },
  "wave-denim": {
    code: "wave-denim",
    slot: "bottom",
    name: "학사일정 데님",
    description: "학사일정처럼 정확하게 맞춰 비추천 반영을 더 날카롭게 만듭니다.",
    imageUrl: "/assets/equipment/wave-denim.svg",
    setId: "balanced-freshman",
    setName: equipmentSetName("balanced-freshman"),
    rarity: "common",
    effectSummary: "인기도 내리기 -1 추가"
  },
  "aurora-skirt": {
    code: "aurora-skirt",
    slot: "bottom",
    name: "장학금 스커트",
    description: "장학금 안내처럼 보상을 선명하게 보여 장비 드롭을 끌어올립니다.",
    imageUrl: "/assets/equipment/aurora-skirt.svg",
    setId: "golden-harvester",
    setName: equipmentSetName("golden-harvester"),
    rarity: "rare",
    effectSummary: "장비 드롭률 +1.5%"
  },
  "bastion-greaves": {
    code: "bastion-greaves",
    slot: "bottom",
    name: "성채 바스티온 그리브",
    description: "묵직한 방어와 함께 성채 장비의 전투 보너스를 밀어주는 하의입니다.",
    imageUrl: "/assets/equipment/midnight-slacks.svg",
    setId: "honor-knight",
    setName: equipmentSetName("honor-knight"),
    rarity: "epic",
    effectSummary: "하의 피해 +14%, 전투력 +10"
  },
  "stage-pleats": {
    code: "stage-pleats",
    slot: "bottom",
    name: "별빛 플리츠",
    description: "무대 장악력을 높여 카드 성장과 응원 아이템 위력을 동시에 끌어올립니다.",
    imageUrl: "/assets/equipment/aurora-skirt.svg",
    setId: "starlight-idol",
    setName: equipmentSetName("starlight-idol"),
    rarity: "epic",
    effectSummary: "카드 성장 +6%, 소비 위력 +10"
  },
  "thunder-boots": {
    code: "thunder-boots",
    slot: "shoes",
    name: "캠퍼스 견학 부츠",
    description: "캠퍼스를 먼저 훑고 들어가 하루 첫 반영에 보정을 더합니다.",
    imageUrl: "/assets/equipment/thunder-boots.svg",
    setId: "gale-chaser",
    setName: equipmentSetName("gale-chaser"),
    rarity: "rare",
    effectSummary: "하루 첫 반영 +5"
  },
  "crystal-sneakers": {
    code: "crystal-sneakers",
    slot: "shoes",
    name: "정기 견학 스니커즈",
    description: "동선을 효율적으로 밟아 소비 아이템을 더 잘 발견합니다.",
    imageUrl: "/assets/equipment/crystal-sneakers.svg",
    setId: "balanced-freshman",
    setName: equipmentSetName("balanced-freshman"),
    rarity: "common",
    effectSummary: "소비 아이템 드롭률 +1%"
  },
  "ember-heels": {
    code: "ember-heels",
    slot: "shoes",
    name: "교환프로그램 워커",
    description: "새 구역을 넓게 돌아다니며 장비 아이템 드롭을 높입니다.",
    imageUrl: "/assets/equipment/ember-heels.svg",
    setId: "golden-harvester",
    setName: equipmentSetName("golden-harvester"),
    rarity: "rare",
    effectSummary: "장비 드롭률 +1%"
  },
  "honor-sabatons": {
    code: "honor-sabatons",
    slot: "shoes",
    name: "명예 기사 사바톤",
    description: "무거운 발걸음으로 전투 자세를 고정해 무기 효율을 높입니다.",
    imageUrl: "/assets/equipment/thunder-boots.svg",
    setId: "honor-knight",
    setName: equipmentSetName("honor-knight"),
    rarity: "epic",
    effectSummary: "무기 공격력 +10, 자동 성장 +4%"
  },
  "encore-sneakers": {
    code: "encore-sneakers",
    slot: "shoes",
    name: "앙코르 스니커즈",
    description: "관객 반응을 더 오래 이어가 카드 성장 루프와 클릭 여유를 보정합니다.",
    imageUrl: "/assets/equipment/crystal-sneakers.svg",
    setId: "starlight-idol",
    setName: equipmentSetName("starlight-idol"),
    rarity: "rare",
    effectSummary: "클릭 여유 +12, 카드 성장 +4%"
  },
  "titan-gauntlet": {
    code: "titan-gauntlet",
    slot: "gloves",
    name: "학사지원 건틀릿",
    description: "학사지원실의 정밀함처럼 모든 반영 수치를 안정적으로 보정합니다.",
    imageUrl: "/assets/equipment/titan-gauntlet.svg",
    setId: "honor-knight",
    setName: equipmentSetName("honor-knight"),
    rarity: "epic",
    effectSummary: "모든 반영 수치 +1"
  },
  "silk-gloves": {
    code: "silk-gloves",
    slot: "gloves",
    name: "연구활동 글러브",
    description: "연구활동의 밀도를 담아 소비 아이템 사용 위력을 올립니다.",
    imageUrl: "/assets/equipment/silk-gloves.svg",
    setId: "balanced-freshman",
    setName: equipmentSetName("balanced-freshman"),
    rarity: "common",
    effectSummary: "소비 아이템 위력 +10"
  },
  "pulse-gloves": {
    code: "pulse-gloves",
    slot: "gloves",
    name: "메리트 글러브",
    description: "메리트를 쌓듯 드롭 효율을 끌어올리는 파밍 특화 장갑입니다.",
    imageUrl: "/assets/equipment/pulse-gloves.svg",
    setId: "golden-harvester",
    setName: equipmentSetName("golden-harvester"),
    rarity: "rare",
    effectSummary: "전체 드롭률 +0.8%"
  },
  "oath-gauntlets": {
    code: "oath-gauntlets",
    slot: "gloves",
    name: "기사단 서약 건틀릿",
    description: "맹세한 전투력을 끝까지 밀어주는 기사단 전용 장갑입니다.",
    imageUrl: "/assets/equipment/titan-gauntlet.svg",
    setId: "honor-knight",
    setName: equipmentSetName("honor-knight"),
    rarity: "legendary",
    effectSummary: "전투력 +18, 소비 위력 +8"
  },
  "rhythm-gloves": {
    code: "rhythm-gloves",
    slot: "gloves",
    name: "리듬 메이커 글러브",
    description: "응원 리듬을 유지해 카드 성장과 응원 포인트 획득에 도움을 줍니다.",
    imageUrl: "/assets/equipment/pulse-gloves.svg",
    setId: "starlight-idol",
    setName: equipmentSetName("starlight-idol"),
    rarity: "epic",
    effectSummary: "카드 성장 +6%, 드랍률 +2%"
  }
};

export const powerRankingEquipmentCodes = Object.keys(powerRankingEquipmentCatalog);

export const getPowerRankingEquipmentSetCounts = (
  equipmentCodes: PowerRankingEquipmentCode[]
): Partial<Record<PowerRankingEquipmentSetId, number>> =>
  equipmentCodes.reduce<Partial<Record<PowerRankingEquipmentSetId, number>>>((accumulator, code) => {
    const setId = powerRankingEquipmentCatalog[code]?.setId;
    if (!setId) {
      return accumulator;
    }
    accumulator[setId] = (accumulator[setId] ?? 0) + 1;
    return accumulator;
  }, {});

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
  "fallen-order-blade": 2,
  "heritage-spear": 1,
  "spotlight-mic": 1,
  "heritage-coat": 1,
  "bastion-greaves": 1,
  "oath-gauntlets": 1
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
