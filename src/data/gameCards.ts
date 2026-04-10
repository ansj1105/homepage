import type { CardEntry } from "../types";

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
