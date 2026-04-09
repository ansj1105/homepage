export interface ShopCatalogItem {
  id: string;
  name: string;
  description: string;
  priceCurrency: "club-coin";
  priceAmount: number;
  itemType: "consumable" | "material";
  code: string;
}

export const shopCatalog: ShopCatalogItem[] = [
  {
    id: "shop-healing-potion",
    name: "회복 포션",
    description: "지구력 35를 회복하는 기본 소비 아이템입니다.",
    priceCurrency: "club-coin",
    priceAmount: 60,
    itemType: "consumable",
    code: "healing-potion"
  },
  {
    id: "shop-berserk-tonic",
    name: "광폭 토닉",
    description: "다음 8회 공격의 전투 효율을 끌어올립니다.",
    priceCurrency: "club-coin",
    priceAmount: 120,
    itemType: "consumable",
    code: "berserk-tonic"
  },
  {
    id: "shop-enhancement-stone",
    name: "강화석",
    description: "장비 강화의 기본 재료입니다.",
    priceCurrency: "club-coin",
    priceAmount: 90,
    itemType: "material",
    code: "enhancement-stone"
  },
  {
    id: "shop-refined-stone",
    name: "정제 강화석",
    description: "+8 이상 고강화 구간의 보조 재료입니다.",
    priceCurrency: "club-coin",
    priceAmount: 180,
    itemType: "material",
    code: "refined-stone"
  }
];
