import type { PowerRankingEquipmentCatalogEntry } from "../types";

export const powerRankingEquipmentCatalog: Record<string, PowerRankingEquipmentCatalogEntry> = {
  "crown-of-cheers": {
    code: "crown-of-cheers",
    slot: "head",
    name: "환호의 왕관",
    description: "추천 시 적용 수치가 2배가 됩니다.",
    imageUrl: "/assets/equipment/crown-of-cheers.svg",
    effectSummary: "추천량 2배"
  },
  "star-visor": {
    code: "star-visor",
    slot: "head",
    name: "별빛 바이저",
    description: "추천 또는 비추천 첫 반영 시 추가로 +5 보정을 받습니다.",
    imageUrl: "/assets/equipment/star-visor.svg",
    effectSummary: "하루 첫 반영 +5"
  },
  "mint-beret": {
    code: "mint-beret",
    slot: "head",
    name: "민트 베레모",
    description: "소비 아이템 드롭 확률이 증가합니다.",
    imageUrl: "/assets/equipment/mint-beret.svg",
    effectSummary: "소비 아이템 드롭률 +1.5%"
  },
  "commander-jacket": {
    code: "commander-jacket",
    slot: "top",
    name: "사령관 재킷",
    description: "추천 시 추가로 +1 수치를 더합니다.",
    imageUrl: "/assets/equipment/commander-jacket.svg",
    effectSummary: "추천량 +1"
  },
  "ribbon-cardigan": {
    code: "ribbon-cardigan",
    slot: "top",
    name: "리본 가디건",
    description: "소비 아이템과 장비 드롭 확률이 모두 조금씩 증가합니다.",
    imageUrl: "/assets/equipment/ribbon-cardigan.svg",
    effectSummary: "전체 드롭률 +1%"
  },
  "golden-harness": {
    code: "golden-harness",
    slot: "top",
    name: "골든 하네스",
    description: "아이템 사용 시 적용 수치가 추가됩니다.",
    imageUrl: "/assets/equipment/golden-harness.svg",
    effectSummary: "소비 아이템 위력 +20"
  },
  "midnight-slacks": {
    code: "midnight-slacks",
    slot: "bottom",
    name: "미드나잇 슬랙스",
    description: "비추천 시 적용 수치가 2배가 됩니다.",
    imageUrl: "/assets/equipment/midnight-slacks.svg",
    effectSummary: "인기도 내리기 2배"
  },
  "wave-denim": {
    code: "wave-denim",
    slot: "bottom",
    name: "웨이브 데님",
    description: "비추천 반영 시 추가로 -1 수치를 더합니다.",
    imageUrl: "/assets/equipment/wave-denim.svg",
    effectSummary: "인기도 내리기 -1 추가"
  },
  "aurora-skirt": {
    code: "aurora-skirt",
    slot: "bottom",
    name: "오로라 스커트",
    description: "장비 아이템 드롭 확률이 증가합니다.",
    imageUrl: "/assets/equipment/aurora-skirt.svg",
    effectSummary: "장비 드롭률 +1.5%"
  },
  "thunder-boots": {
    code: "thunder-boots",
    slot: "shoes",
    name: "썬더 부츠",
    description: "하루 첫 반영 시 추가로 +5 보정을 받습니다.",
    imageUrl: "/assets/equipment/thunder-boots.svg",
    effectSummary: "하루 첫 반영 +5"
  },
  "crystal-sneakers": {
    code: "crystal-sneakers",
    slot: "shoes",
    name: "크리스털 스니커즈",
    description: "소비 아이템 드롭 확률이 증가합니다.",
    imageUrl: "/assets/equipment/crystal-sneakers.svg",
    effectSummary: "소비 아이템 드롭률 +1%"
  },
  "ember-heels": {
    code: "ember-heels",
    slot: "shoes",
    name: "엠버 힐",
    description: "장비 아이템 드롭 확률이 증가합니다.",
    imageUrl: "/assets/equipment/ember-heels.svg",
    effectSummary: "장비 드롭률 +1%"
  },
  "titan-gauntlet": {
    code: "titan-gauntlet",
    slot: "gloves",
    name: "타이탄 건틀릿",
    description: "추천과 비추천 모두 기본 수치에 +1 보정을 더합니다.",
    imageUrl: "/assets/equipment/titan-gauntlet.svg",
    effectSummary: "모든 반영 수치 +1"
  },
  "silk-gloves": {
    code: "silk-gloves",
    slot: "gloves",
    name: "실크 글러브",
    description: "소비 아이템 사용 시 위력이 추가됩니다.",
    imageUrl: "/assets/equipment/silk-gloves.svg",
    effectSummary: "소비 아이템 위력 +10"
  },
  "pulse-gloves": {
    code: "pulse-gloves",
    slot: "gloves",
    name: "펄스 글러브",
    description: "추천 시 아이템 드롭을 노리기 좋습니다.",
    imageUrl: "/assets/equipment/pulse-gloves.svg",
    effectSummary: "전체 드롭률 +0.8%"
  }
};

export const powerRankingEquipmentCodes = Object.keys(powerRankingEquipmentCatalog);
