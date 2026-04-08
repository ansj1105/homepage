import type { PowerRankingItemCatalogEntry } from "../types";

export const powerRankingItemCatalog: Record<string, PowerRankingItemCatalogEntry> = {
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
  }
};

export const powerRankingItemCodes = Object.keys(powerRankingItemCatalog);
