export type HuntingDropKind = "material" | "consumable";

export type HuntingDropCode =
  | "club-coin"
  | "enhancement-stone"
  | "refined-stone"
  | "ancient-core"
  | "healing-potion"
  | "berserk-tonic"
  | "lucky-scroll"
  | "protection-scroll";

export interface HuntingDropTableEntry {
  kind: HuntingDropKind;
  code: HuntingDropCode;
  label: string;
  rate: number;
  min: number;
  max: number;
}

export interface HuntingMonsterDefinition {
  id: string;
  name: string;
  imageUrl: string;
  typeLabel: string;
  rarityLabel: string;
  patternLabel: string;
  flavor: string;
  maxHp: number;
  defense: number;
  expReward: number;
  isBoss: boolean;
  rewardSummary: string;
  dropTable: HuntingDropTableEntry[];
}

export interface HuntingZoneDefinition {
  id: string;
  badge: string;
  chapterLabel: string;
  zoneType: "normal" | "elite" | "boss" | "event";
  roleSummary: string;
  name: string;
  description: string;
  unlockLevel: number;
  recommendedPower: number;
  clickCost: number;
  dailyEntryLimit?: number;
  seasonLabel?: string;
  isSeasonOpen?: boolean;
  monsters: HuntingMonsterDefinition[];
}

const monsterImageUrls: Record<string, string> = {
  "slime-chairman": "/assets/monsters/slime-chairman.svg",
  "poster-goblin": "/assets/monsters/poster-goblin.svg",
  "canteen-wolf": "/assets/monsters/canteen-wolf.svg",
  "ledger-bat": "/assets/monsters/ledger-bat.svg",
  "seminar-golem": "/assets/monsters/seminar-golem.svg",
  "hall-keeper": "/assets/monsters/hall-keeper.svg",
  "vault-mimic": "/assets/monsters/vault-mimic.svg",
  "executive-specter": "/assets/monsters/executive-specter.svg",
  "council-dragon": "/assets/monsters/council-dragon.svg",
  "booth-spirit": "/assets/monsters/booth-spirit.svg",
  "cheer-lion": "/assets/monsters/cheer-lion.svg",
  "night-parade-queen": "/assets/monsters/night-parade-queen.svg",
  "index-wraith": "/assets/monsters/index-wraith.svg",
  "ledger-hydra": "/assets/monsters/ledger-hydra.svg",
  "grand-archive-core": "/assets/monsters/grand-archive-core.svg"
};

export const huntingZones: HuntingZoneDefinition[] = [
  {
    id: "beginner-yard",
    badge: "CH 1",
    chapterLabel: "입문 구역",
    zoneType: "normal",
    roleSummary: "기본 장비, 골드, 재료 드랍",
    name: "초급 사냥터",
    description: "클릭 감각을 익히고 강화석과 포션을 모으는 기본 진입 구간입니다.",
    unlockLevel: 1,
    recommendedPower: 0,
    clickCost: 1,
    monsters: [
      {
        id: "slime-chairman",
        name: "슬라임 회장",
        imageUrl: monsterImageUrls["slime-chairman"],
        typeLabel: "점액형 / 완충 탱커",
        rarityLabel: "Common",
        patternLabel: "맞아줄수록 강화석이 잘 떨어지는 입문 몬스터",
        flavor: "초반부에 가장 많이 맞아주는 연습용 몬스터입니다.",
        maxHp: 180,
        defense: 8,
        expReward: 18,
        isBoss: false,
        rewardSummary: "강화석, 동연 코인",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 18, max: 34 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.72, min: 1, max: 2 },
          { kind: "consumable", code: "healing-potion", label: "회복 포션", rate: 0.16, min: 1, max: 1 }
        ]
      },
      {
        id: "poster-goblin",
        name: "포스터 고블린",
        imageUrl: monsterImageUrls["poster-goblin"],
        typeLabel: "교란형 / 도주형",
        rarityLabel: "Uncommon",
        patternLabel: "행운 스크롤과 정제 강화석을 섞어 떨어뜨립니다",
        flavor: "게시판 어딘가에서 튀어나온 듯한 몬스터입니다.",
        maxHp: 260,
        defense: 14,
        expReward: 26,
        isBoss: false,
        rewardSummary: "정제 강화석, 행운 스크롤",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 28, max: 45 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.54, min: 1, max: 3 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.18, min: 1, max: 1 },
          { kind: "consumable", code: "lucky-scroll", label: "행운 스크롤", rate: 0.08, min: 1, max: 1 }
        ]
      },
      {
        id: "canteen-wolf",
        name: "학식 늑대",
        imageUrl: monsterImageUrls["canteen-wolf"],
        typeLabel: "보스 / 돌진형",
        rarityLabel: "Boss",
        patternLabel: "광폭 토닉과 강화 패키지 드랍에 특화된 보스",
        flavor: "스테이지 1 보스. 전투력이 낮으면 오래 걸립니다.",
        maxHp: 340,
        defense: 18,
        expReward: 34,
        isBoss: true,
        rewardSummary: "강화 패키지",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 40, max: 70 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.78, min: 2, max: 4 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.22, min: 1, max: 2 },
          { kind: "consumable", code: "berserk-tonic", label: "광폭 토닉", rate: 0.12, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "midnight-campus",
    badge: "CH 2",
    chapterLabel: "중급 구역",
    zoneType: "elite",
    roleSummary: "희귀 장비, 강화석 드랍 강화",
    name: "야간 캠퍼스",
    description: "강화 루프가 본격적으로 열리며 보호 주문서가 드랍되기 시작합니다.",
    unlockLevel: 3,
    recommendedPower: 130,
    clickCost: 2,
    monsters: [
      {
        id: "ledger-bat",
        name: "장부 박쥐",
        imageUrl: monsterImageUrls["ledger-bat"],
        typeLabel: "흡혈형 / 누적 파밍",
        rarityLabel: "Rare",
        patternLabel: "코인 수급 효율이 좋아 자동 사냥 입문에 적합합니다",
        flavor: "숫자를 빨아먹는 야간형 몬스터입니다.",
        maxHp: 520,
        defense: 28,
        expReward: 52,
        isBoss: false,
        rewardSummary: "정제 강화석, 동연 코인",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 60, max: 95 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.66, min: 2, max: 4 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.3, min: 1, max: 2 }
        ]
      },
      {
        id: "seminar-golem",
        name: "세미나 골렘",
        imageUrl: monsterImageUrls["seminar-golem"],
        typeLabel: "방어형 / 고정 패턴",
        rarityLabel: "Rare",
        patternLabel: "보호 주문서와 광폭 토닉을 노리기 좋은 중간 보스형",
        flavor: "내구도가 높아 자동 사냥 효율을 시험하기 좋습니다.",
        maxHp: 680,
        defense: 34,
        expReward: 66,
        isBoss: false,
        rewardSummary: "보호 주문서, 광폭 토닉",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 85, max: 120 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.58, min: 2, max: 5 },
          { kind: "consumable", code: "protection-scroll", label: "보호 주문서", rate: 0.12, min: 1, max: 1 },
          { kind: "consumable", code: "berserk-tonic", label: "광폭 토닉", rate: 0.08, min: 1, max: 1 }
        ]
      },
      {
        id: "hall-keeper",
        name: "백농관 수문장",
        imageUrl: monsterImageUrls["hall-keeper"],
        typeLabel: "보스 / 체크포인트",
        rarityLabel: "Boss",
        patternLabel: "상위 스테이지 입장 전에 강화 재료를 압축 공급합니다",
        flavor: "상위 스테이지로 넘어가기 전에 장비 성장을 요구합니다.",
        maxHp: 860,
        defense: 40,
        expReward: 82,
        isBoss: true,
        rewardSummary: "보호 주문서, 고급 강화 재료",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 100, max: 150 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.72, min: 3, max: 5 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.34, min: 1, max: 2 },
          { kind: "consumable", code: "protection-scroll", label: "보호 주문서", rate: 0.18, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "council-vault",
    badge: "CH 3",
    chapterLabel: "심화 구역",
    zoneType: "boss",
    roleSummary: "세트 장비 조각, 카드 관련 아이템",
    name: "집행부 금고",
    description: "희귀 재료와 장기 성장 재화를 모으는 방치형 핵심 구간입니다.",
    unlockLevel: 6,
    recommendedPower: 260,
    clickCost: 3,
    dailyEntryLimit: 3,
    monsters: [
      {
        id: "vault-mimic",
        name: "금고 미믹",
        imageUrl: monsterImageUrls["vault-mimic"],
        typeLabel: "함정형 / 희귀 재료",
        rarityLabel: "Epic",
        patternLabel: "고대 코어를 가장 먼저 안정적으로 공급하는 몬스터",
        flavor: "드랍은 좋지만 방심하면 시간이 오래 걸립니다.",
        maxHp: 1240,
        defense: 58,
        expReward: 108,
        isBoss: false,
        rewardSummary: "고대 코어, 강화석",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 140, max: 200 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.82, min: 4, max: 7 },
          { kind: "material", code: "ancient-core", label: "고대 코어", rate: 0.14, min: 1, max: 1 }
        ]
      },
      {
        id: "executive-specter",
        name: "집행 유령",
        imageUrl: monsterImageUrls["executive-specter"],
        typeLabel: "유틸형 / 드랍 특화",
        rarityLabel: "Epic",
        patternLabel: "행운 스크롤과 보호 주문서 드랍을 동시에 노릴 수 있습니다",
        flavor: "드랍 최적화 세팅을 만들기 좋은 몬스터입니다.",
        maxHp: 1480,
        defense: 66,
        expReward: 124,
        isBoss: false,
        rewardSummary: "행운 스크롤, 보호 주문서",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 170, max: 240 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.44, min: 1, max: 3 },
          { kind: "consumable", code: "lucky-scroll", label: "행운 스크롤", rate: 0.2, min: 1, max: 1 },
          { kind: "consumable", code: "protection-scroll", label: "보호 주문서", rate: 0.16, min: 1, max: 1 }
        ]
      },
      {
        id: "council-dragon",
        name: "동연 드래곤",
        imageUrl: monsterImageUrls["council-dragon"],
        typeLabel: "최종 보스 / 장기 파밍",
        rarityLabel: "Legendary Boss",
        patternLabel: "고대 코어와 대량 재화를 동시에 뿌리는 최종 반복 보스",
        flavor: "현재 빌드의 최종 반복 파밍 보스입니다.",
        maxHp: 1820,
        defense: 74,
        expReward: 150,
        isBoss: true,
        rewardSummary: "고대 코어, 대량 재화",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 220, max: 320 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.88, min: 5, max: 8 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.5, min: 2, max: 3 },
          { kind: "material", code: "ancient-core", label: "고대 코어", rate: 0.22, min: 1, max: 2 },
          { kind: "consumable", code: "protection-scroll", label: "보호 주문서", rate: 0.2, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "festival-street",
    badge: "CH 4",
    chapterLabel: "축제 구역",
    zoneType: "event",
    roleSummary: "시즌 토큰, 한정 장비, 기간 한정 오픈",
    name: "축제 거리",
    description: "몬스터 종류가 늘어나고 자동 사냥과 클릭 화력을 모두 요구하는 구간입니다.",
    unlockLevel: 9,
    recommendedPower: 420,
    clickCost: 1,
    seasonLabel: "봄 축제 시즌",
    isSeasonOpen: true,
    monsters: [
      {
        id: "booth-spirit",
        name: "부스 정령",
        imageUrl: monsterImageUrls["booth-spirit"],
        typeLabel: "지원형 / 재화 분산",
        rarityLabel: "Elite",
        patternLabel: "코인과 포션을 고르게 공급하는 축제형 몬스터",
        flavor: "축제 부스 사이를 떠다니며 소모품을 흘립니다.",
        maxHp: 2240,
        defense: 88,
        expReward: 178,
        isBoss: false,
        rewardSummary: "코인, 포션, 강화석",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 260, max: 360 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.92, min: 5, max: 9 },
          { kind: "consumable", code: "healing-potion", label: "회복 포션", rate: 0.24, min: 1, max: 2 }
        ]
      },
      {
        id: "cheer-lion",
        name: "응원 사자",
        imageUrl: monsterImageUrls["cheer-lion"],
        typeLabel: "돌격형 / 카드 지원",
        rarityLabel: "Elite",
        patternLabel: "응원 포인트 파밍과 광폭 토닉 확보에 특화",
        flavor: "응원단의 열기를 끌어모은 야수형 몬스터입니다.",
        maxHp: 2480,
        defense: 96,
        expReward: 192,
        isBoss: false,
        rewardSummary: "광폭 토닉, 보호 주문서",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 280, max: 390 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.52, min: 2, max: 3 },
          { kind: "consumable", code: "berserk-tonic", label: "광폭 토닉", rate: 0.18, min: 1, max: 1 },
          { kind: "consumable", code: "protection-scroll", label: "보호 주문서", rate: 0.18, min: 1, max: 1 }
        ]
      },
      {
        id: "night-parade-queen",
        name: "야행 퍼레이드 퀸",
        imageUrl: monsterImageUrls["night-parade-queen"],
        typeLabel: "보스 / 드랍 혼합형",
        rarityLabel: "Festival Boss",
        patternLabel: "소비 아이템과 희귀 재료를 동시에 뿌리는 축제 보스",
        flavor: "패턴은 화려하지만 순수 전투력 검사를 강하게 요구합니다.",
        maxHp: 2860,
        defense: 108,
        expReward: 220,
        isBoss: true,
        rewardSummary: "희귀 재료, 보호 주문서",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 340, max: 460 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.95, min: 6, max: 10 },
          { kind: "material", code: "ancient-core", label: "고대 코어", rate: 0.28, min: 1, max: 2 },
          { kind: "consumable", code: "lucky-scroll", label: "행운 스크롤", rate: 0.22, min: 1, max: 1 },
          { kind: "consumable", code: "protection-scroll", label: "보호 주문서", rate: 0.24, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "archive-labyrinth",
    badge: "CH 5",
    chapterLabel: "최종 구역",
    zoneType: "elite",
    roleSummary: "최상위 희귀 재료와 장기 파밍 구간",
    name: "기록 보관 미궁",
    description: "현재 빌드의 최고 난도 구간입니다. 공격력과 장기 파밍 효율을 동시에 봅니다.",
    unlockLevel: 12,
    recommendedPower: 620,
    clickCost: 3,
    monsters: [
      {
        id: "index-wraith",
        name: "목차 망령",
        imageUrl: monsterImageUrls["index-wraith"],
        typeLabel: "추적형 / 희귀 재화",
        rarityLabel: "Mythic",
        patternLabel: "고대 코어와 정제 강화석을 안정적으로 공급",
        flavor: "기록 깊은 곳에서 정밀 재료만 골라 떨어뜨립니다.",
        maxHp: 3380,
        defense: 122,
        expReward: 256,
        isBoss: false,
        rewardSummary: "고대 코어, 정제 강화석",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 420, max: 560 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.64, min: 2, max: 4 },
          { kind: "material", code: "ancient-core", label: "고대 코어", rate: 0.32, min: 1, max: 2 }
        ]
      },
      {
        id: "ledger-hydra",
        name: "장부 히드라",
        imageUrl: monsterImageUrls["ledger-hydra"],
        typeLabel: "다중두 / 클릭 압박",
        rarityLabel: "Mythic",
        patternLabel: "클릭 누적과 자동 사냥 효율을 동시에 시험",
        flavor: "머리가 늘어날수록 화력이 부족하면 체감 난도가 급상승합니다.",
        maxHp: 3720,
        defense: 136,
        expReward: 274,
        isBoss: false,
        rewardSummary: "대량 코인, 스크롤류",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 460, max: 620 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.98, min: 7, max: 11 },
          { kind: "consumable", code: "berserk-tonic", label: "광폭 토닉", rate: 0.24, min: 1, max: 1 },
          { kind: "consumable", code: "lucky-scroll", label: "행운 스크롤", rate: 0.24, min: 1, max: 1 }
        ]
      },
      {
        id: "grand-archive-core",
        name: "대기록 핵심체",
        imageUrl: monsterImageUrls["grand-archive-core"],
        typeLabel: "최종 보스 / 전투력 검사",
        rarityLabel: "Final Boss",
        patternLabel: "최고 난도 장기 파밍 보스. 장비와 강화 연동 확인용",
        flavor: "현재 구조에서 가장 높은 전투력과 장비 성장을 요구합니다.",
        maxHp: 4280,
        defense: 152,
        expReward: 320,
        isBoss: true,
        rewardSummary: "최고급 재료 패키지",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 520, max: 720 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 1, min: 8, max: 12 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.72, min: 3, max: 5 },
          { kind: "material", code: "ancient-core", label: "고대 코어", rate: 0.38, min: 1, max: 3 },
          { kind: "consumable", code: "protection-scroll", label: "보호 주문서", rate: 0.28, min: 1, max: 1 }
        ]
      }
    ]
  }
];

export const getHuntingZone = (zoneId: string): HuntingZoneDefinition | undefined =>
  huntingZones.find((zone) => zone.id === zoneId);

export const getHuntingMonster = (
  zoneId: string,
  monsterId: string
): HuntingMonsterDefinition | undefined =>
  getHuntingZone(zoneId)?.monsters.find((monster) => monster.id === monsterId);
