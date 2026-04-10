import type { CardEntry } from "../types";

export type GameCardStage = "child" | "growth" | "complete" | "ultimate";

export const gameCardStageMeta: Record<
  GameCardStage,
  { label: string; minLevel: number; maxLevel: number | null }
> = {
  child: { label: "유년기", minLevel: 1, maxLevel: 4 },
  growth: { label: "성장기", minLevel: 5, maxLevel: 9 },
  complete: { label: "완전체", minLevel: 10, maxLevel: 19 },
  ultimate: { label: "궁극체", minLevel: 20, maxLevel: null }
};

export const gameCardsCatalog: CardEntry[] = [
  {
    id: "flame-idol-ria",
    name: "불꽃 아이돌 리아",
    popularity: 0,
    rank: 1,
    imageUrl: "/assets/cards/flame-idol-ria.svg",
    grade: "legendary",
    typeLabel: "공격 카드",
    effectKind: "damage",
    effectValue: 0.03,
    bonusSummary: "데미지 +3%"
  },
  {
    id: "harvest-fairy-bell",
    name: "수확 요정 벨",
    popularity: 0,
    rank: 2,
    imageUrl: "/assets/cards/harvest-fairy-bell.svg",
    grade: "epic",
    typeLabel: "수확 카드",
    effectKind: "drop",
    effectValue: 0.04,
    bonusSummary: "재료 드랍 +4%"
  },
  {
    id: "runner-jet",
    name: "러너 제트",
    popularity: 0,
    rank: 3,
    imageUrl: "/assets/cards/runner-jet.svg",
    grade: "rare",
    typeLabel: "응원 카드",
    effectKind: "click",
    effectValue: 30,
    bonusSummary: "오늘의 클릭 +30"
  },
  {
    id: "star-erin",
    name: "스타 에린",
    popularity: 0,
    rank: 4,
    imageUrl: "/assets/cards/star-erin.svg",
    grade: "epic",
    typeLabel: "인기 카드",
    effectKind: "popularity",
    effectValue: 0.12,
    bonusSummary: "카드 인기도 성장 보정 +12%"
  }
];

export const getGameCardById = (cardId: string): CardEntry | undefined =>
  gameCardsCatalog.find((card) => card.id === cardId);

export const getCardStageByLevel = (level: number): GameCardStage => {
  if (level >= 20) {
    return "ultimate";
  }
  if (level >= 10) {
    return "complete";
  }
  if (level >= 5) {
    return "growth";
  }
  return "child";
};

export const getCardStageLabel = (level: number): string => gameCardStageMeta[getCardStageByLevel(level)].label;

export const getCardStageImageUrl = (cardId: string, level: number): string => {
  const stage = getCardStageByLevel(level);
  return stage === "child" ? `/assets/cards/${cardId}.svg` : `/assets/cards/${cardId}-${stage}.svg`;
};

export const getCardStageRangeLabel = (stage: GameCardStage): string => {
  const meta = gameCardStageMeta[stage];
  return meta.maxLevel ? `Lv.${meta.minLevel}-${meta.maxLevel}` : `Lv.${meta.minLevel}+`;
};

export const getCardBonusSummaryForLevel = (card: CardEntry, level: number): string => {
  const levelBonus = Math.max(0, level - 1);
  switch (card.effectKind) {
    case "damage":
      return `데미지 +${Math.round((card.effectValue + levelBonus * 0.01) * 100)}%`;
    case "drop":
      return `재료 드랍 +${Math.round((card.effectValue + levelBonus * 0.01) * 100)}%`;
    case "click":
      return `오늘의 클릭 +${Math.floor(card.effectValue + levelBonus * 5)}`;
    case "popularity":
      return `카드 인기도 성장 보정 +${Math.round((card.effectValue + levelBonus * 0.03) * 100)}%`;
    default:
      return card.bonusSummary;
  }
};
