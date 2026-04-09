import type { CardEntry } from "../types";

export const gameCardsCatalog: CardEntry[] = [
  {
    id: "flame-idol-ria",
    name: "불꽃 아이돌 리아",
    popularity: 0,
    rank: 1,
    imageUrl: "/assets/sub/baeknong-hall-sign-banner-photo.jpg",
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
    imageUrl: "/assets/sub/baeknong-hall-sign-banner-photo.jpg",
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
    imageUrl: "/assets/sub/baeknong-hall-sign-banner-photo.jpg",
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
    imageUrl: "/assets/sub/baeknong-hall-sign-banner-photo.jpg",
    grade: "epic",
    typeLabel: "인기 카드",
    effectKind: "popularity",
    effectValue: 0.12,
    bonusSummary: "카드 인기도 성장 보정 +12%"
  }
];

export const getGameCardById = (cardId: string): CardEntry | undefined =>
  gameCardsCatalog.find((card) => card.id === cardId);
