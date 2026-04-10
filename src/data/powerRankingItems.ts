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
  }
};

export const powerRankingItemCodes = Object.keys(powerRankingItemCatalog);
