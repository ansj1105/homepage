import type { HuntingConsumableCode, HuntingMaterialCode, HuntingMiscCode } from "../features/huntingProgress";

export type HuntingRaidReward =
  | { kind: "material"; code: HuntingMaterialCode; label: string; amount: number }
  | { kind: "consumable"; code: HuntingConsumableCode; label: string; amount: number }
  | { kind: "misc"; code: HuntingMiscCode; label: string; amount: number };

export type HuntingRaidBossDefinition = {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  unlockLevel: number;
  recommendedPower: number;
  description: string;
  flavor: string;
  introLine: string;
  tauntLines: string[];
  defeatLine: string;
  hpMultiplier: number;
  hpFlatBonus: number;
  defense: number;
  rewards: HuntingRaidReward[];
};

export const huntingRaidBosses: HuntingRaidBossDefinition[] = [
  {
    id: "yonsei-throne-warden",
    name: "연세 왕좌 수문장",
    title: "명예 회관 최심부",
    imageUrl: "/assets/raids/yonsei-throne-warden.svg",
    unlockLevel: 8,
    recommendedPower: 180,
    description: "동아리 회관의 권위를 지키는 초중반 레이드 보스입니다.",
    flavor: "수많은 회의록과 결재 문서를 두른 채, 부원의 발길을 막아섭니다.",
    introLine: "정식 승인 없이 이 안으로 들어올 수 있을 것 같나?",
    tauntLines: [
      "서류 한 장 넘기는 속도보다 느리군.",
      "그 정도 전투력으로 회관을 흔들 수 있을까?",
      "좋다, 어디까지 버티는지 보자."
    ],
    defeatLine: "이번 만큼은 통과시키지... 다음 회의에서 다시 보자.",
    hpMultiplier: 28,
    hpFlatBonus: 4800,
    defense: 110,
    rewards: [
      { kind: "material", code: "club-coin", label: "동연 코인", amount: 1400 },
      { kind: "material", code: "refined-stone", label: "고급 강화석", amount: 10 },
      { kind: "material", code: "ancient-core", label: "고대 코어", amount: 5 },
      { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", amount: 2 },
      { kind: "consumable", code: "protection-scroll", label: "보호 주문서", amount: 1 }
    ]
  },
  {
    id: "starlight-headliner",
    name: "별빛 헤드라이너 에린",
    title: "축제 메인 스테이지",
    imageUrl: "/assets/raids/starlight-headliner.svg",
    unlockLevel: 12,
    recommendedPower: 320,
    description: "카드 성장과 응원 아이템 보상을 후하게 주는 공연형 레이드입니다.",
    flavor: "응원봉 파도와 조명 속에서, 무대 전체를 장악한 채 관객을 압도합니다.",
    introLine: "응원할 준비 됐지? 그럼 무대 위에서 실력으로 증명해 봐.",
    tauntLines: [
      "리듬도 못 타면서 여기까지 온 거야?",
      "더 크게! 아직 객석 끝까지 안 들려.",
      "좋아, 이제야 조금 재밌어지네."
    ],
    defeatLine: "오늘 앙코르는 네가 가져가. 꽤 인상 깊었어.",
    hpMultiplier: 34,
    hpFlatBonus: 8200,
    defense: 165,
    rewards: [
      { kind: "material", code: "club-coin", label: "동연 코인", amount: 2200 },
      { kind: "material", code: "card-shard", label: "카드 조각", amount: 14 },
      { kind: "material", code: "event-token", label: "이벤트 토큰", amount: 8 },
      { kind: "consumable", code: "fan-letter", label: "팬레터", amount: 4 },
      { kind: "consumable", code: "cheering-stick", label: "응원봉", amount: 2 },
      { kind: "consumable", code: "viral-ticket", label: "바이럴 티켓", amount: 1 }
    ]
  },
  {
    id: "midnight-archive-dragon",
    name: "심야 기록룡 아카이브",
    title: "중앙도서관 봉인층",
    imageUrl: "/assets/raids/midnight-archive-dragon.svg",
    unlockLevel: 16,
    recommendedPower: 520,
    description: "후반 파밍과 강화 재료를 크게 퍼주는 최고난도 레이드 보스입니다.",
    flavor: "백 년치 기록을 품은 거대한 용이 심야 열람실 위로 내려앉았습니다.",
    introLine: "지식을 탐하는 자여, 대가를 치를 준비는 되었느냐.",
    tauntLines: [
      "이 정도 화력으로는 책장 하나도 넘기지 못한다.",
      "기록 앞에서는 누구나 겸손해진다.",
      "좋다. 이 정도면 이름은 남기겠군."
    ],
    defeatLine: "기록해 두겠다. 오늘의 승자는... 너다.",
    hpMultiplier: 42,
    hpFlatBonus: 14000,
    defense: 240,
    rewards: [
      { kind: "material", code: "club-coin", label: "동연 코인", amount: 3600 },
      { kind: "material", code: "refined-stone", label: "고급 강화석", amount: 18 },
      { kind: "material", code: "ancient-core", label: "고대 코어", amount: 10 },
      { kind: "material", code: "event-token", label: "이벤트 토큰", amount: 10 },
      { kind: "misc", code: "night-snack-ticket", label: "야식 교환권", amount: 6 },
      { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", amount: 4 },
      { kind: "consumable", code: "protection-scroll", label: "보호 주문서", amount: 2 }
    ]
  }
];

export const getRaidBossById = (raidBossId: string) =>
  huntingRaidBosses.find((boss) => boss.id === raidBossId) ?? null;
