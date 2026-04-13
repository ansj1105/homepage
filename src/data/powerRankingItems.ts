import type { PowerRankingItemCatalogEntry } from "../types";

export const powerRankingItemCatalog: Record<string, PowerRankingItemCatalogEntry> = {
  "ranking-up-ticket": {
    code: "ranking-up-ticket",
    name: "올리기권",
    description: "파워랭킹 올리기 1회를 보너스로 사용할 수 있습니다.",
    effectDelta: 1,
    imageUrl: "/assets/items/ranking-up-ticket.svg"
  },
  "ranking-down-ticket": {
    code: "ranking-down-ticket",
    name: "내리기권",
    description: "파워랭킹 내리기 1회를 보너스로 사용할 수 있습니다.",
    effectDelta: -1,
    imageUrl: "/assets/items/ranking-down-ticket.svg"
  },
  "byeokbangjun-blanket": {
    code: "byeokbangjun-blanket",
    name: "벽방준의 담요",
    description: "상대 인기도를 100 내립니다.",
    effectDelta: -100,
    imageUrl: "/assets/items/byeokbangjun-blanket.svg"
  },
  "seoeuntaek-love": {
    code: "seoeuntaek-love",
    name: "서은택의 사랑",
    description: "상대 인기도를 100 올립니다.",
    effectDelta: 100,
    imageUrl: "/assets/items/seoeuntaek-love.svg"
  },
  "kimdaseul-blessing": {
    code: "kimdaseul-blessing",
    name: "김다슬의 축복",
    description: "상대 인기도를 1000 내립니다.",
    effectDelta: -1000,
    imageUrl: "/assets/items/kimdaseul-blessing.svg"
  },
  "cheongeonho-momentum": {
    code: "cheongeonho-momentum",
    name: "천건호의 기세",
    description: "선택한 파워랭킹 대상의 현재 인기도를 0으로 만듭니다. 매주 월요일 오전 10시 기준 가입 유저 중 랜덤 2명에게 지급됩니다.",
    effectDelta: 0,
    effectLabel: "인기도 0으로 초기화",
    effectMode: "reset-to-zero",
    imageUrl: "/assets/items/cheongeonho-momentum.svg"
  },
  "blue-campus-badge": {
    code: "blue-campus-badge",
    name: "청량 응원 배지",
    description: "상대 인기도를 50 올립니다. 1번 진영 보너스 드랍입니다.",
    effectDelta: 50,
    imageUrl: "/assets/items/blue-campus-badge.svg"
  },
  "red-campus-flare": {
    code: "red-campus-flare",
    name: "적색 견제 플레어",
    description: "상대 인기도를 50 내립니다. 2번 진영 보너스 드랍입니다.",
    effectDelta: -50,
    imageUrl: "/assets/items/red-campus-flare.svg"
  }
};

export const powerRankingItemCodes = Object.keys(powerRankingItemCatalog);
