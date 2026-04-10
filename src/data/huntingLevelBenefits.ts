export type HuntingLevelBenefitTier = {
  level: number;
  title: string;
  summary: string;
  battlePowerBonus: number;
  dailyClickBonus: number;
  dropRateBonus: number;
  cardGrowthBonus: number;
};

export const huntingLevelBenefitTiers: HuntingLevelBenefitTier[] = [
  {
    level: 1,
    title: "신입 부원",
    summary: "기본 사냥 루프가 열립니다.",
    battlePowerBonus: 0,
    dailyClickBonus: 0,
    dropRateBonus: 0,
    cardGrowthBonus: 0
  },
  {
    level: 3,
    title: "새내기 적응",
    summary: "오늘의 클릭 여유가 늘어납니다.",
    battlePowerBonus: 0,
    dailyClickBonus: 10,
    dropRateBonus: 0,
    cardGrowthBonus: 0
  },
  {
    level: 5,
    title: "캠퍼스 실전 배치",
    summary: "사냥 전투력이 추가로 오릅니다.",
    battlePowerBonus: 14,
    dailyClickBonus: 0,
    dropRateBonus: 0,
    cardGrowthBonus: 0
  },
  {
    level: 7,
    title: "파밍 감각 개화",
    summary: "재료와 소비 아이템 드랍 효율이 좋아집니다.",
    battlePowerBonus: 0,
    dailyClickBonus: 0,
    dropRateBonus: 0.04,
    cardGrowthBonus: 0
  },
  {
    level: 10,
    title: "동연 핵심 인력",
    summary: "전투력과 클릭 여유가 함께 강화됩니다.",
    battlePowerBonus: 18,
    dailyClickBonus: 20,
    dropRateBonus: 0,
    cardGrowthBonus: 0
  },
  {
    level: 12,
    title: "응원 루프 숙련",
    summary: "카드 성장 효율이 올라갑니다.",
    battlePowerBonus: 0,
    dailyClickBonus: 0,
    dropRateBonus: 0,
    cardGrowthBonus: 0.06
  },
  {
    level: 15,
    title: "사냥 베테랑",
    summary: "후반 지역용 전투/파밍 복합 보너스가 열립니다.",
    battlePowerBonus: 26,
    dailyClickBonus: 25,
    dropRateBonus: 0.05,
    cardGrowthBonus: 0
  },
  {
    level: 20,
    title: "동연 전설",
    summary: "최상위 구간용 종합 성장 보너스입니다.",
    battlePowerBonus: 36,
    dailyClickBonus: 40,
    dropRateBonus: 0.08,
    cardGrowthBonus: 0.1
  }
];

export const getHuntingLevelBenefits = (level: number) => {
  const unlocked = huntingLevelBenefitTiers.filter((tier) => level >= tier.level);
  const nextTier = huntingLevelBenefitTiers.find((tier) => level < tier.level) ?? null;
  return {
    unlocked,
    nextTier,
    battlePowerBonus: unlocked.reduce((sum, tier) => sum + tier.battlePowerBonus, 0),
    dailyClickBonus: unlocked.reduce((sum, tier) => sum + tier.dailyClickBonus, 0),
    dropRateBonus: unlocked.reduce((sum, tier) => sum + tier.dropRateBonus, 0),
    cardGrowthBonus: unlocked.reduce((sum, tier) => sum + tier.cardGrowthBonus, 0)
  };
};
