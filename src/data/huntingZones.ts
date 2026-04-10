export type HuntingDropKind = "material" | "consumable";

export type HuntingDropCode =
  | "club-coin"
  | "enhancement-stone"
  | "refined-stone"
  | "ancient-core"
  | "healing-potion"
  | "energy-bar"
  | "energy-drink"
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
  "grand-archive-core": "/assets/monsters/grand-archive-core.svg",
  "dawn-avenue-runner": "/assets/monsters/cheer-lion.svg",
  "archive-keeper-prime": "/assets/monsters/index-wraith.svg",
  "belfry-stag": "/assets/monsters/council-dragon.svg",
  "festival-merch-fox": "/assets/monsters/booth-spirit.svg",
  "stage-marshall": "/assets/monsters/night-parade-queen.svg",
  "neon-herald": "/assets/monsters/grand-archive-core.svg"
};

export const huntingZones: HuntingZoneDefinition[] = [
  {
    id: "beginner-yard",
    badge: "CH 1",
    chapterLabel: "초보 지역",
    zoneType: "normal",
    roleSummary: "기본 장비, 골드, 회복 물약을 모으는 입문 사냥터",
    name: "초보 숲",
    description: "초반 장비와 작은 회복 물약을 모으며 기본 전투 루프를 익히는 지역입니다.",
    unlockLevel: 1,
    recommendedPower: 10,
    clickCost: 1,
    monsters: [
      {
        id: "slime-chairman",
        name: "브로슈어 슬라임",
        imageUrl: monsterImageUrls["slime-chairman"],
        typeLabel: "일반형",
        rarityLabel: "Common",
        patternLabel: "평균 스탯으로 초반 파밍을 담당하는 기본형 몬스터",
        flavor: "새내기에게 뿌려진 브로슈어 더미 사이를 미끄러지듯 떠다닙니다.",
        maxHp: 180,
        defense: 8,
        expReward: 18,
        isBoss: false,
        rewardSummary: "골드, 낡은 모자",
        dropTable: [
          { kind: "material", code: "club-coin", label: "골드", rate: 1, min: 18, max: 34 },
          { kind: "material", code: "enhancement-stone", label: "낡은 모자", rate: 0.32, min: 1, max: 1 },
          { kind: "consumable", code: "healing-potion", label: "작은 회복 물약", rate: 0.16, min: 1, max: 1 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.44, min: 1, max: 1 }
        ]
      },
      {
        id: "poster-goblin",
        name: "캠퍼스 가이드 정령",
        imageUrl: monsterImageUrls["poster-goblin"],
        typeLabel: "탱커형",
        rarityLabel: "Uncommon",
        patternLabel: "HP가 높아 초보 화력을 시험하는 숲의 탱커형 몬스터",
        flavor: "건물과 길을 외우고 다니는 듯 길목을 지키며 오래 버팁니다.",
        maxHp: 320,
        defense: 16,
        expReward: 24,
        isBoss: false,
        rewardSummary: "낡은 모자, 작은 회복 물약",
        dropTable: [
          { kind: "material", code: "club-coin", label: "골드", rate: 1, min: 22, max: 38 },
          { kind: "material", code: "enhancement-stone", label: "낡은 모자", rate: 0.22, min: 1, max: 1 },
          { kind: "consumable", code: "healing-potion", label: "작은 회복 물약", rate: 0.2, min: 1, max: 1 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.36, min: 1, max: 1 }
        ]
      },
      {
        id: "ledger-bat",
        name: "분실물 도둑",
        imageUrl: monsterImageUrls["ledger-bat"],
        typeLabel: "유리몸형",
        rarityLabel: "Uncommon",
        patternLabel: "HP는 낮지만 골드를 많이 주는 몬스터",
        flavor: "교내 분실물 게시판에 올라올 법한 물건들을 잔뜩 훔쳐 달아납니다.",
        maxHp: 260,
        defense: 14,
        expReward: 26,
        isBoss: false,
        rewardSummary: "골드, 초보 장갑",
        dropTable: [
          { kind: "material", code: "club-coin", label: "골드", rate: 1, min: 28, max: 45 },
          { kind: "material", code: "enhancement-stone", label: "초보 장갑", rate: 0.28, min: 1, max: 1 },
          { kind: "consumable", code: "healing-potion", label: "작은 회복 물약", rate: 0.12, min: 1, max: 1 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.34, min: 1, max: 1 }
        ]
      },
      {
        id: "canteen-wolf",
        name: "정기 견학 늑대왕",
        imageUrl: monsterImageUrls["canteen-wolf"],
        typeLabel: "보스형",
        rarityLabel: "Boss",
        patternLabel: "초반 장비와 골드 드랍을 담당하는 입문 보스",
        flavor: "견학 동선을 어지럽히며 초보 숲의 깊은 곳을 지키는 우두머리입니다.",
        maxHp: 340,
        defense: 18,
        expReward: 34,
        isBoss: true,
        rewardSummary: "낡은 모자, 초보 장갑",
        dropTable: [
          { kind: "material", code: "club-coin", label: "골드", rate: 1, min: 40, max: 70 },
          { kind: "material", code: "enhancement-stone", label: "낡은 모자", rate: 0.4, min: 1, max: 1 },
          { kind: "material", code: "refined-stone", label: "초보 장갑", rate: 0.22, min: 1, max: 1 },
          { kind: "consumable", code: "healing-potion", label: "작은 회복 물약", rate: 0.2, min: 1, max: 1 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.52, min: 1, max: 2 }
        ]
      }
    ]
  },
  {
    id: "midnight-campus",
    badge: "CH 2",
    chapterLabel: "광산 지역",
    zoneType: "elite",
    roleSummary: "철광석, 강화석, 장화 계열 장비를 모으는 정예 사냥터",
    name: "돌언덕 광산",
    description: "정예 몬스터를 상대하며 철광석과 강화석, 채광 장비를 파밍하는 지역입니다.",
    unlockLevel: 3,
    recommendedPower: 35,
    clickCost: 2,
    monsters: [
      {
        id: "ledger-bat",
        name: "연구성과 박쥐",
        imageUrl: monsterImageUrls["ledger-bat"],
        typeLabel: "보상형",
        rarityLabel: "Rare",
        patternLabel: "드랍률이 높아 광산 재료를 빠르게 공급하는 보상형",
        flavor: "연구성과 통계표를 뜯어 모은 듯 반짝이는 재료를 쏟아냅니다.",
        maxHp: 520,
        defense: 28,
        expReward: 52,
        isBoss: false,
        rewardSummary: "철광석, 강화석",
        dropTable: [
          { kind: "material", code: "club-coin", label: "철광석", rate: 1, min: 60, max: 95 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.66, min: 2, max: 4 },
          { kind: "material", code: "refined-stone", label: "중급 강화석", rate: 0.3, min: 1, max: 2 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.34, min: 1, max: 1 }
        ]
      },
      {
        id: "seminar-golem",
        name: "양자사업단 골렘",
        imageUrl: monsterImageUrls["seminar-golem"],
        typeLabel: "탱커형",
        rarityLabel: "Rare",
        patternLabel: "HP가 높아 화력을 시험하는 광산 탱커형 몬스터",
        flavor: "양자과학기술 허브의 문지기처럼 묵직하게 버티는 골렘입니다.",
        maxHp: 680,
        defense: 34,
        expReward: 66,
        isBoss: false,
        rewardSummary: "두꺼운 장화, 강화석",
        dropTable: [
          { kind: "material", code: "club-coin", label: "철광석", rate: 1, min: 85, max: 120 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.58, min: 2, max: 5 },
          { kind: "consumable", code: "protection-scroll", label: "두꺼운 장화", rate: 0.12, min: 1, max: 1 },
          { kind: "consumable", code: "berserk-tonic", label: "광부 장갑", rate: 0.08, min: 1, max: 1 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.28, min: 1, max: 2 }
        ]
      },
      {
        id: "hall-keeper",
        name: "리서치 매거진 감독관",
        imageUrl: monsterImageUrls["hall-keeper"],
        typeLabel: "보스형",
        rarityLabel: "Boss",
        patternLabel: "희귀 장비와 강화 재료를 압축 공급하는 정예 보스",
        flavor: "광산 출구를 지키며 연구 자료와 채굴 장비를 함께 거둬 갑니다.",
        maxHp: 860,
        defense: 40,
        expReward: 82,
        isBoss: true,
        rewardSummary: "광부 장갑, 두꺼운 장화",
        dropTable: [
          { kind: "material", code: "club-coin", label: "철광석", rate: 1, min: 100, max: 150 },
          { kind: "material", code: "enhancement-stone", label: "강화석", rate: 0.72, min: 3, max: 5 },
          { kind: "material", code: "refined-stone", label: "중급 강화석", rate: 0.34, min: 1, max: 2 },
          { kind: "consumable", code: "protection-scroll", label: "광부 장갑", rate: 0.18, min: 1, max: 1 },
          { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", rate: 0.22, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "council-vault",
    badge: "CH 3",
    chapterLabel: "성채 지역",
    zoneType: "boss",
    roleSummary: "기사단 세트와 보스 카드 조각을 노리는 보스 사냥터",
    name: "폐허 기사단 성채",
    description: "보스형 몬스터를 공략해 기사단 세트와 카드 관련 아이템을 모으는 지역입니다.",
    unlockLevel: 6,
    recommendedPower: 80,
    clickCost: 3,
    dailyEntryLimit: 3,
    monsters: [
      {
        id: "vault-mimic",
        name: "헤리티지 기사",
        imageUrl: monsterImageUrls["vault-mimic"],
        typeLabel: "일반형",
        rarityLabel: "Epic",
        patternLabel: "세트 장비 조각과 중급 강화석을 자주 뿌리는 보상형",
        flavor: "오래된 전통의 갑옷을 두른 채 성채 통로를 배회합니다.",
        maxHp: 1240,
        defense: 58,
        expReward: 108,
        isBoss: false,
        rewardSummary: "기사단 세트, 중급 강화석",
        dropTable: [
          { kind: "material", code: "club-coin", label: "기사단 세트 조각", rate: 1, min: 140, max: 200 },
          { kind: "material", code: "enhancement-stone", label: "중급 강화석", rate: 0.82, min: 4, max: 7 },
          { kind: "material", code: "ancient-core", label: "보스 카드 조각", rate: 0.14, min: 1, max: 1 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.26, min: 1, max: 1 }
        ]
      },
      {
        id: "executive-specter",
        name: "연세포커스 궁수",
        imageUrl: monsterImageUrls["executive-specter"],
        typeLabel: "유리몸형",
        rarityLabel: "Epic",
        patternLabel: "HP가 높고 세트 조각 드랍을 안정적으로 주는 탱커형",
        flavor: "성채 상층에서 시선을 끌며 빠르게 화살을 흩뿌리는 망령입니다.",
        maxHp: 1480,
        defense: 66,
        expReward: 124,
        isBoss: false,
        rewardSummary: "기사단 세트, 보스 카드 조각",
        dropTable: [
          { kind: "material", code: "club-coin", label: "기사단 세트 조각", rate: 1, min: 170, max: 240 },
          { kind: "material", code: "refined-stone", label: "중급 강화석", rate: 0.44, min: 1, max: 3 },
          { kind: "consumable", code: "lucky-scroll", label: "보스 카드 조각", rate: 0.2, min: 1, max: 1 },
          { kind: "consumable", code: "protection-scroll", label: "기사단 문장", rate: 0.16, min: 1, max: 1 },
          { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", rate: 0.18, min: 1, max: 1 }
        ]
      },
      {
        id: "hall-keeper",
        name: "리서치 수호자",
        imageUrl: monsterImageUrls["hall-keeper"],
        typeLabel: "탱커형",
        rarityLabel: "Legendary Boss",
        patternLabel: "세트 장비 조각과 카드 관련 아이템을 주는 철갑 보스형",
        flavor: "연구기관 금고를 지키듯 성채 핵심부를 버티는 중장갑 수호자입니다.",
        maxHp: 1820,
        defense: 74,
        expReward: 150,
        isBoss: true,
        rewardSummary: "기사단 세트, 보스 카드 조각",
        dropTable: [
          { kind: "material", code: "club-coin", label: "기사단 세트 조각", rate: 1, min: 220, max: 320 },
          { kind: "material", code: "enhancement-stone", label: "중급 강화석", rate: 0.88, min: 5, max: 8 },
          { kind: "material", code: "refined-stone", label: "기사단 휘장", rate: 0.5, min: 2, max: 3 },
          { kind: "material", code: "ancient-core", label: "보스 카드 조각", rate: 0.22, min: 1, max: 2 },
          { kind: "consumable", code: "protection-scroll", label: "기사단 봉인서", rate: 0.2, min: 1, max: 1 },
          { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", rate: 0.24, min: 1, max: 1 }
        ]
      },
      {
        id: "council-dragon",
        name: "넥스트 노벨 기사단장",
        imageUrl: monsterImageUrls["council-dragon"],
        typeLabel: "보스형",
        rarityLabel: "Final Boss",
        patternLabel: "성채 최심부에서 세트와 카드 조각을 집중 드랍하는 최종 보스",
        flavor: "성채 최심부에서 거대한 명예와 욕망을 둘러쓴 최종 우두머리입니다.",
        maxHp: 2140,
        defense: 84,
        expReward: 168,
        isBoss: true,
        rewardSummary: "기사단 세트, 보스 카드 조각",
        dropTable: [
          { kind: "material", code: "club-coin", label: "기사단 세트 조각", rate: 1, min: 240, max: 340 },
          { kind: "material", code: "enhancement-stone", label: "중급 강화석", rate: 0.92, min: 5, max: 8 },
          { kind: "material", code: "refined-stone", label: "기사단 휘장", rate: 0.52, min: 2, max: 3 },
          { kind: "material", code: "ancient-core", label: "보스 카드 조각", rate: 0.28, min: 1, max: 2 },
          { kind: "consumable", code: "protection-scroll", label: "기사단 봉인서", rate: 0.2, min: 1, max: 1 },
          { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", rate: 0.28, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "festival-street",
    badge: "CH 4",
    chapterLabel: "수확 지역",
    zoneType: "normal",
    roleSummary: "수확자 세트, 골드 주머니, 희귀 재료를 노리는 고급 일반 사냥터",
    name: "황금 수확 평원",
    description: "골드와 희귀 재료를 안정적으로 모으며 중후반 성장에 쓰는 고급 일반 사냥터입니다.",
    unlockLevel: 9,
    recommendedPower: 130,
    clickCost: 1,
    monsters: [
      {
        id: "booth-spirit",
        name: "행사 정령",
        imageUrl: monsterImageUrls["booth-spirit"],
        typeLabel: "일반형",
        rarityLabel: "Elite",
        patternLabel: "평균 스탯으로 골드와 희귀 재료를 고르게 드랍",
        flavor: "행사 공지판 근처를 맴돌며 토큰과 재료를 쏟아내는 정령입니다.",
        maxHp: 2240,
        defense: 88,
        expReward: 178,
        isBoss: false,
        rewardSummary: "골드 주머니, 희귀 재료",
        dropTable: [
          { kind: "material", code: "club-coin", label: "골드 주머니", rate: 1, min: 260, max: 360 },
          { kind: "material", code: "enhancement-stone", label: "희귀 재료", rate: 0.92, min: 5, max: 9 },
          { kind: "consumable", code: "healing-potion", label: "수확 물약", rate: 0.24, min: 1, max: 2 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.42, min: 1, max: 2 }
        ]
      },
      {
        id: "cheer-lion",
        name: "학생언론 사자",
        imageUrl: monsterImageUrls["cheer-lion"],
        typeLabel: "유리몸형",
        rarityLabel: "Elite",
        patternLabel: "HP는 낮지만 골드 주머니를 많이 주는 유리몸형",
        flavor: "학생언론의 속보처럼 빠르게 움직이며 골드 주머니를 흘립니다.",
        maxHp: 2480,
        defense: 96,
        expReward: 192,
        isBoss: false,
        rewardSummary: "수확자 세트, 골드 주머니",
        dropTable: [
          { kind: "material", code: "club-coin", label: "골드 주머니", rate: 1, min: 280, max: 390 },
          { kind: "material", code: "refined-stone", label: "수확자 세트 조각", rate: 0.52, min: 2, max: 3 },
          { kind: "consumable", code: "berserk-tonic", label: "희귀 재료", rate: 0.18, min: 1, max: 1 },
          { kind: "consumable", code: "protection-scroll", label: "황금 밀 이삭", rate: 0.18, min: 1, max: 1 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.34, min: 1, max: 2 }
        ]
      },
      {
        id: "night-parade-queen",
        name: "행사일정 여왕",
        imageUrl: monsterImageUrls["night-parade-queen"],
        typeLabel: "보스형",
        rarityLabel: "Festival Boss",
        patternLabel: "수확자 세트와 희귀 재료를 압축해서 주는 평원 보스",
        flavor: "평원 중앙에서 행사 흐름을 장악하며 세트 재료를 움켜쥡니다.",
        maxHp: 2860,
        defense: 108,
        expReward: 220,
        isBoss: true,
        rewardSummary: "수확자 세트, 골드 주머니",
        dropTable: [
          { kind: "material", code: "club-coin", label: "골드 주머니", rate: 1, min: 340, max: 460 },
          { kind: "material", code: "enhancement-stone", label: "희귀 재료", rate: 0.95, min: 6, max: 10 },
          { kind: "material", code: "ancient-core", label: "수확자 세트 조각", rate: 0.28, min: 1, max: 2 },
          { kind: "consumable", code: "lucky-scroll", label: "황금 깃발", rate: 0.22, min: 1, max: 1 },
          { kind: "consumable", code: "protection-scroll", label: "곡물 인장", rate: 0.24, min: 1, max: 1 },
          { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", rate: 0.3, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "archive-labyrinth",
    badge: "CH 5",
    chapterLabel: "무대 도시",
    zoneType: "event",
    roleSummary: "아이돌 세트, 팬레터, 바이럴 티켓을 파밍하는 이벤트 사냥터",
    name: "별빛 무대 도시",
    description: "특정 시즌에 열리는 공연 도시로 팬레터와 아이돌 세트를 노리는 이벤트 사냥터입니다.",
    unlockLevel: 12,
    recommendedPower: 200,
    clickCost: 2,
    seasonLabel: "스타라이트 페스티벌",
    isSeasonOpen: true,
    monsters: [
      {
        id: "index-wraith",
        name: "소셜미디어 망령",
        imageUrl: monsterImageUrls["index-wraith"],
        typeLabel: "보상형",
        rarityLabel: "Mythic",
        patternLabel: "드랍률이 높아 팬레터와 바이럴 티켓을 자주 공급",
        flavor: "좋아요와 공유를 모으듯 팬레터와 바이럴 티켓을 퍼뜨립니다.",
        maxHp: 3380,
        defense: 122,
        expReward: 256,
        isBoss: false,
        rewardSummary: "팬레터, 바이럴 티켓",
        dropTable: [
          { kind: "material", code: "club-coin", label: "팬레터", rate: 1, min: 420, max: 560 },
          { kind: "material", code: "refined-stone", label: "바이럴 티켓", rate: 0.64, min: 2, max: 4 },
          { kind: "material", code: "ancient-core", label: "아이돌 세트 조각", rate: 0.32, min: 1, max: 2 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.38, min: 1, max: 2 }
        ]
      },
      {
        id: "ledger-hydra",
        name: "홍보영상 히드라",
        imageUrl: monsterImageUrls["ledger-hydra"],
        typeLabel: "탱커형",
        rarityLabel: "Mythic",
        patternLabel: "HP가 높고 아이돌 세트 조각을 오래 걸쳐 주는 탱커형",
        flavor: "무대 뒤편 스크린을 뒤덮으며 긴 전투를 끌고 가는 거대 몬스터입니다.",
        maxHp: 3720,
        defense: 136,
        expReward: 274,
        isBoss: false,
        rewardSummary: "아이돌 세트, 팬레터",
        dropTable: [
          { kind: "material", code: "club-coin", label: "팬레터", rate: 1, min: 460, max: 620 },
          { kind: "material", code: "enhancement-stone", label: "아이돌 세트 조각", rate: 0.98, min: 7, max: 11 },
          { kind: "consumable", code: "berserk-tonic", label: "바이럴 티켓", rate: 0.24, min: 1, max: 1 },
          { kind: "consumable", code: "lucky-scroll", label: "응원봉 배지", rate: 0.24, min: 1, max: 1 },
          { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", rate: 0.26, min: 1, max: 1 }
        ]
      },
      {
        id: "grand-archive-core",
        name: "연세다움 디바",
        imageUrl: monsterImageUrls["grand-archive-core"],
        typeLabel: "보스형",
        rarityLabel: "Final Boss",
        patternLabel: "아이돌 세트와 한정 이벤트 아이템을 드랍하는 최종 보스형",
        flavor: "도시 중심 무대에서 가장 강한 존재감을 뽐내는 이벤트 보스입니다.",
        maxHp: 4280,
        defense: 152,
        expReward: 320,
        isBoss: true,
        rewardSummary: "아이돌 세트, 팬레터, 바이럴 티켓",
        dropTable: [
          { kind: "material", code: "club-coin", label: "팬레터", rate: 1, min: 520, max: 720 },
          { kind: "material", code: "enhancement-stone", label: "아이돌 세트 조각", rate: 1, min: 8, max: 12 },
          { kind: "material", code: "refined-stone", label: "바이럴 티켓", rate: 0.72, min: 3, max: 5 },
          { kind: "material", code: "ancient-core", label: "한정 포토카드", rate: 0.38, min: 1, max: 3 },
          { kind: "consumable", code: "protection-scroll", label: "무대 출입 패스", rate: 0.28, min: 1, max: 1 },
          { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", rate: 0.34, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "baekyang-avenue",
    badge: "CH 6",
    chapterLabel: "심화 지역",
    zoneType: "elite",
    roleSummary: "고급 강화 재료와 클릭 회복 아이템을 집중적으로 모으는 후반 파밍 사냥터",
    name: "백양로 새벽 회랑",
    description: "새벽 백양로를 질주하며 고급 강화 재료, 세트 조각, 클릭 회복 아이템을 빠르게 모으는 지역입니다.",
    unlockLevel: 13,
    recommendedPower: 260,
    clickCost: 3,
    monsters: [
      {
        id: "dawn-avenue-runner",
        name: "백양로 질주자",
        imageUrl: monsterImageUrls["dawn-avenue-runner"],
        typeLabel: "유리몸형",
        rarityLabel: "Legendary",
        patternLabel: "HP는 낮지만 코인과 클릭 회복 아이템을 자주 떨구는 후반 파밍형",
        flavor: "백양로를 끝없이 뛰며 새벽 공기를 휘저어 재료와 코인을 흩뿌립니다.",
        maxHp: 4480,
        defense: 158,
        expReward: 336,
        isBoss: false,
        rewardSummary: "동연 코인, 에너지 바, 강화석",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 560, max: 760 },
          { kind: "material", code: "enhancement-stone", label: "고급 세트 조각", rate: 0.92, min: 7, max: 12 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.46, min: 2, max: 4 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.56, min: 1, max: 2 },
          { kind: "consumable", code: "lucky-scroll", label: "행운의 가루", rate: 0.22, min: 1, max: 1 }
        ]
      },
      {
        id: "archive-keeper-prime",
        name: "연세 기록 보관관",
        imageUrl: monsterImageUrls["archive-keeper-prime"],
        typeLabel: "탱커형",
        rarityLabel: "Legendary",
        patternLabel: "높은 HP로 버티며 고급 강화 재료와 카드 조각을 공급하는 탱커형",
        flavor: "보관된 아카이브를 지키며 오래 버티는 대신 희귀한 재료를 많이 남깁니다.",
        maxHp: 5260,
        defense: 172,
        expReward: 364,
        isBoss: false,
        rewardSummary: "정제 강화석, 카드 조각",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 520, max: 700 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.58, min: 2, max: 5 },
          { kind: "material", code: "ancient-core", label: "카드 조각 뭉치", rate: 0.34, min: 1, max: 2 },
          { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", rate: 0.26, min: 1, max: 1 },
          { kind: "consumable", code: "protection-scroll", label: "보호 주문서", rate: 0.18, min: 1, max: 1 }
        ]
      },
      {
        id: "belfry-stag",
        name: "연세종탑 흰사슴",
        imageUrl: monsterImageUrls["belfry-stag"],
        typeLabel: "보스형",
        rarityLabel: "Boss",
        patternLabel: "정제 강화석과 희귀 코어를 함께 주는 후반 정예 보스",
        flavor: "종탑 아래 나타나 새벽 회랑을 지배하는 신비한 사슴입니다.",
        maxHp: 6120,
        defense: 188,
        expReward: 420,
        isBoss: true,
        rewardSummary: "고급 강화석, 고대 코어, 고농축 에너지 드링크",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 680, max: 900 },
          { kind: "material", code: "refined-stone", label: "정제 강화석", rate: 0.78, min: 3, max: 6 },
          { kind: "material", code: "ancient-core", label: "고대 코어", rate: 0.4, min: 1, max: 3 },
          { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", rate: 0.34, min: 1, max: 1 },
          { kind: "consumable", code: "protection-scroll", label: "보호 주문서", rate: 0.24, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "daedongje-street",
    badge: "EVT 2",
    chapterLabel: "시즌 지역",
    zoneType: "event",
    roleSummary: "시즌 토큰과 카드 성장 소비템을 노리는 한정 이벤트 사냥터",
    name: "대동제 환호 거리",
    description: "축제 기간에만 열리는 거리형 이벤트 사냥터로, 응원 굿즈와 카드 성장 아이템을 집중적으로 획득합니다.",
    unlockLevel: 15,
    recommendedPower: 340,
    clickCost: 4,
    seasonLabel: "대동제 시즌",
    isSeasonOpen: true,
    monsters: [
      {
        id: "festival-merch-fox",
        name: "굿즈 여우 상인",
        imageUrl: monsterImageUrls["festival-merch-fox"],
        typeLabel: "보상형",
        rarityLabel: "Event",
        patternLabel: "이벤트 토큰과 응원 소비템을 잘 주는 시즌 보상형",
        flavor: "부스를 오가며 굿즈와 토큰을 쉴 새 없이 뿌리는 축제 전문 상인입니다.",
        maxHp: 5820,
        defense: 182,
        expReward: 408,
        isBoss: false,
        rewardSummary: "팬레터, 응원봉, 이벤트 토큰",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 620, max: 860 },
          { kind: "material", code: "ancient-core", label: "이벤트 토큰", rate: 0.42, min: 1, max: 2 },
          { kind: "consumable", code: "energy-bar", label: "에너지 바", rate: 0.24, min: 1, max: 1 },
          { kind: "consumable", code: "berserk-tonic", label: "팬레터 꾸러미", rate: 0.28, min: 1, max: 1 },
          { kind: "consumable", code: "lucky-scroll", label: "응원 굿즈", rate: 0.26, min: 1, max: 1 }
        ]
      },
      {
        id: "stage-marshall",
        name: "축제 무대 집행관",
        imageUrl: monsterImageUrls["stage-marshall"],
        typeLabel: "탱커형",
        rarityLabel: "Event Boss",
        patternLabel: "무대 운영 자원을 지키며 버티는 고HP 시즌 탱커형",
        flavor: "축제 동선을 통제하며 응원 아이템과 이벤트 자원을 보호합니다.",
        maxHp: 6640,
        defense: 198,
        expReward: 452,
        isBoss: false,
        rewardSummary: "응원봉, 바이럴 티켓, 보호 주문서",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 720, max: 960 },
          { kind: "material", code: "refined-stone", label: "이벤트 토큰", rate: 0.48, min: 2, max: 4 },
          { kind: "consumable", code: "berserk-tonic", label: "응원봉", rate: 0.34, min: 1, max: 2 },
          { kind: "consumable", code: "protection-scroll", label: "보호 주문서", rate: 0.18, min: 1, max: 1 },
          { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", rate: 0.18, min: 1, max: 1 }
        ]
      },
      {
        id: "neon-herald",
        name: "네온 헤럴드",
        imageUrl: monsterImageUrls["neon-herald"],
        typeLabel: "보스형",
        rarityLabel: "Festival Boss",
        patternLabel: "이벤트 토큰과 카드 성장 소비템을 다량 드랍하는 시즌 보스형",
        flavor: "축제의 중심에서 가장 많은 응원과 자원을 끌어모으는 네온 빛 지배자입니다.",
        maxHp: 7420,
        defense: 216,
        expReward: 520,
        isBoss: true,
        rewardSummary: "바이럴 티켓, 보호 주문서, 고농축 에너지 드링크",
        dropTable: [
          { kind: "material", code: "club-coin", label: "동연 코인", rate: 1, min: 880, max: 1180 },
          { kind: "material", code: "ancient-core", label: "이벤트 토큰", rate: 0.56, min: 2, max: 4 },
          { kind: "consumable", code: "berserk-tonic", label: "바이럴 티켓", rate: 0.28, min: 1, max: 2 },
          { kind: "consumable", code: "protection-scroll", label: "보호 주문서", rate: 0.24, min: 1, max: 1 },
          { kind: "consumable", code: "energy-drink", label: "고농축 에너지 드링크", rate: 0.3, min: 1, max: 1 }
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
