export interface ShopCatalogItem {
  id: string;
  name: string;
  description: string;
  priceCurrency: "club-coin";
  priceAmount: number;
  itemType: "consumable" | "material";
  code: string;
  category?: string;
}

export const shopCatalog: ShopCatalogItem[] = [
  {
    id: "shop-healing-potion",
    name: "작은 회복 물약",
    description: "지구력 35를 회복하는 기본 회복형 소비 아이템입니다.",
    priceCurrency: "club-coin",
    priceAmount: 60,
    itemType: "consumable",
    code: "healing-potion",
    category: "회복형"
  },
  {
    id: "shop-medium-healing-potion",
    name: "중형 회복 물약",
    description: "지구력 60을 회복하는 상위 회복형 소비 아이템입니다.",
    priceCurrency: "club-coin",
    priceAmount: 110,
    itemType: "consumable",
    code: "medium-healing-potion",
    category: "회복형"
  },
  {
    id: "shop-power-potion",
    name: "힘의 물약",
    description: "다음 6회 공격의 기본 위력을 끌어올립니다.",
    priceCurrency: "club-coin",
    priceAmount: 95,
    itemType: "consumable",
    code: "power-potion",
    category: "공격 버프형"
  },
  {
    id: "shop-berserk-tonic",
    name: "광폭 스크롤",
    description: "다음 8회 공격의 전투 효율을 크게 끌어올립니다.",
    priceCurrency: "club-coin",
    priceAmount: 120,
    itemType: "consumable",
    code: "berserk-tonic",
    category: "공격 버프형"
  },
  {
    id: "shop-lucky-scroll",
    name: "행운의 가루",
    description: "다음 5회 처치 동안 드랍 효율을 높입니다.",
    priceCurrency: "club-coin",
    priceAmount: 100,
    itemType: "consumable",
    code: "lucky-scroll",
    category: "드랍 버프형"
  },
  {
    id: "shop-harvest-booster",
    name: "채집 증폭제",
    description: "다음 7회 처치 동안 재료 드랍 수량을 높입니다.",
    priceCurrency: "club-coin",
    priceAmount: 140,
    itemType: "consumable",
    code: "harvest-booster",
    category: "드랍 버프형"
  },
  {
    id: "shop-energy-bar",
    name: "에너지 바",
    description: "오늘의 클릭 여유를 12 회복합니다.",
    priceCurrency: "club-coin",
    priceAmount: 75,
    itemType: "consumable",
    code: "energy-bar",
    category: "클릭 회복형"
  },
  {
    id: "shop-energy-drink",
    name: "고농축 에너지 드링크",
    description: "오늘의 클릭 여유를 24 회복합니다.",
    priceCurrency: "club-coin",
    priceAmount: 135,
    itemType: "consumable",
    code: "energy-drink",
    category: "클릭 회복형"
  },
  {
    id: "shop-fan-letter",
    name: "팬레터",
    description: "선택한 카드의 성장 포인트를 올립니다.",
    priceCurrency: "club-coin",
    priceAmount: 90,
    itemType: "consumable",
    code: "fan-letter",
    category: "카드 성장형"
  },
  {
    id: "shop-cheering-stick",
    name: "응원봉",
    description: "선택한 카드의 성장 포인트를 더 크게 올립니다.",
    priceCurrency: "club-coin",
    priceAmount: 140,
    itemType: "consumable",
    code: "cheering-stick",
    category: "카드 성장형"
  },
  {
    id: "shop-viral-ticket",
    name: "바이럴 티켓",
    description: "선택한 카드의 성장 포인트를 크게 밀어주는 상위 성장 소비템입니다.",
    priceCurrency: "club-coin",
    priceAmount: 210,
    itemType: "consumable",
    code: "viral-ticket",
    category: "카드 성장형"
  },
  {
    id: "shop-enhancement-stone",
    name: "강화석",
    description: "장비 강화의 기본 재료입니다.",
    priceCurrency: "club-coin",
    priceAmount: 90,
    itemType: "material",
    code: "enhancement-stone",
    category: "강화 재료"
  },
  {
    id: "shop-refined-stone",
    name: "정제 강화석",
    description: "+8 이상 고강화 구간의 보조 재료입니다.",
    priceCurrency: "club-coin",
    priceAmount: 180,
    itemType: "material",
    code: "refined-stone",
    category: "강화 재료"
  }
];
