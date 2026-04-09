import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import { useUserAuth } from "../auth/UserAuthContext";
import CommunityTopBar from "../components/CommunityTopBar";
import {
  consumableMeta,
  createDefaultProgress,
  getExpToNextLevel,
  getHuntingStorageKey,
  loadHuntingProgress,
  materialMeta,
  MAX_ENDURANCE,
  saveHuntingProgress,
  type HuntingConsumableCode,
  type HuntingMaterialCode,
  type HuntingProgress
} from "../features/huntingProgress";
import type { HuntingProfile, PowerRankingPerson } from "../types";
type DropReward =
  | { kind: "material"; code: HuntingMaterialCode; quantity: number }
  | { kind: "consumable"; code: HuntingConsumableCode; quantity: number };

type StageMonster = {
  id: string;
  name: string;
  typeLabel: string;
  rarityLabel: string;
  patternLabel: string;
  maxHp: number;
  defense: number;
  isBoss: boolean;
  reward: string;
  flavor: string;
  expReward: number;
  dropTable: Array<
    | { kind: "material"; code: HuntingMaterialCode; rate: number; min: number; max: number }
    | { kind: "consumable"; code: HuntingConsumableCode; rate: number; min: number; max: number }
  >;
};

type StageDefinition = {
  id: string;
  name: string;
  badge: string;
  description: string;
  unlockLevel: number;
  recommendedPower: number;
  monsters: StageMonster[];
};

type StageMonsterState = StageMonster & {
  currentHp: number;
  defeatedCount: number;
};

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


const stageDefinitions: StageDefinition[] = [
  {
    id: "beginner-yard",
    name: "초급 사냥터",
    badge: "STAGE 1",
    description: "클릭 감각을 익히고 강화석과 포션을 모으는 구간입니다.",
    unlockLevel: 1,
    recommendedPower: 0,
    monsters: [
      {
        id: "slime-chairman",
        name: "슬라임 회장",
        typeLabel: "점액형 / 완충 탱커",
        rarityLabel: "Common",
        patternLabel: "맞아줄수록 강화석이 잘 떨어지는 입문 몬스터",
        maxHp: 180,
        defense: 8,
        isBoss: false,
        reward: "강화석, 동연 코인",
        flavor: "초반부에 가장 많이 맞아주는 연습용 몬스터입니다.",
        expReward: 18,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 18, max: 34 },
          { kind: "material", code: "enhancement-stone", rate: 0.72, min: 1, max: 2 },
          { kind: "consumable", code: "healing-potion", rate: 0.16, min: 1, max: 1 }
        ]
      },
      {
        id: "poster-goblin",
        name: "포스터 고블린",
        typeLabel: "교란형 / 도주형",
        rarityLabel: "Uncommon",
        patternLabel: "행운 스크롤과 정제 강화석을 섞어 떨어뜨립니다",
        maxHp: 260,
        defense: 14,
        isBoss: false,
        reward: "정제 강화석, 행운 스크롤",
        flavor: "게시판 어딘가에서 튀어나온 듯한 몬스터입니다.",
        expReward: 26,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 28, max: 45 },
          { kind: "material", code: "enhancement-stone", rate: 0.54, min: 1, max: 3 },
          { kind: "material", code: "refined-stone", rate: 0.18, min: 1, max: 1 },
          { kind: "consumable", code: "lucky-scroll", rate: 0.08, min: 1, max: 1 }
        ]
      },
      {
        id: "canteen-wolf",
        name: "학식 늑대",
        typeLabel: "보스 / 돌진형",
        rarityLabel: "Boss",
        patternLabel: "광폭 토닉과 강화 패키지 드랍에 특화된 보스",
        maxHp: 340,
        defense: 18,
        isBoss: true,
        reward: "강화 패키지",
        flavor: "스테이지 1 보스. 전투력이 낮으면 오래 걸립니다.",
        expReward: 34,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 40, max: 70 },
          { kind: "material", code: "enhancement-stone", rate: 0.78, min: 2, max: 4 },
          { kind: "material", code: "refined-stone", rate: 0.22, min: 1, max: 2 },
          { kind: "consumable", code: "berserk-tonic", rate: 0.12, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "midnight-campus",
    name: "야간 캠퍼스",
    badge: "STAGE 2",
    description: "강화 루프가 본격적으로 열리며 보호 주문서가 드랍되기 시작합니다.",
    unlockLevel: 3,
    recommendedPower: 130,
    monsters: [
      {
        id: "ledger-bat",
        name: "장부 박쥐",
        typeLabel: "흡혈형 / 누적 파밍",
        rarityLabel: "Rare",
        patternLabel: "코인 수급 효율이 좋아 자동 사냥 입문에 적합합니다",
        maxHp: 520,
        defense: 28,
        isBoss: false,
        reward: "정제 강화석, 동연 코인",
        flavor: "숫자를 빨아먹는 야간형 몬스터입니다.",
        expReward: 52,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 60, max: 95 },
          { kind: "material", code: "enhancement-stone", rate: 0.66, min: 2, max: 4 },
          { kind: "material", code: "refined-stone", rate: 0.3, min: 1, max: 2 }
        ]
      },
      {
        id: "seminar-golem",
        name: "세미나 골렘",
        typeLabel: "방어형 / 고정 패턴",
        rarityLabel: "Rare",
        patternLabel: "보호 주문서와 광폭 토닉을 노리기 좋은 중간 보스형",
        maxHp: 680,
        defense: 34,
        isBoss: false,
        reward: "보호 주문서, 광폭 토닉",
        flavor: "내구도가 높아 자동 사냥 효율을 시험하기 좋습니다.",
        expReward: 66,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 85, max: 120 },
          { kind: "material", code: "enhancement-stone", rate: 0.58, min: 2, max: 5 },
          { kind: "consumable", code: "protection-scroll", rate: 0.12, min: 1, max: 1 },
          { kind: "consumable", code: "berserk-tonic", rate: 0.08, min: 1, max: 1 }
        ]
      },
      {
        id: "hall-keeper",
        name: "백농관 수문장",
        typeLabel: "보스 / 체크포인트",
        rarityLabel: "Boss",
        patternLabel: "상위 스테이지 입장 전에 강화 재료를 압축 공급합니다",
        maxHp: 860,
        defense: 40,
        isBoss: true,
        reward: "보호 주문서, 고급 강화 재료",
        flavor: "상위 스테이지로 넘어가기 전에 장비 성장을 요구합니다.",
        expReward: 82,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 100, max: 150 },
          { kind: "material", code: "enhancement-stone", rate: 0.72, min: 3, max: 5 },
          { kind: "material", code: "refined-stone", rate: 0.34, min: 1, max: 2 },
          { kind: "consumable", code: "protection-scroll", rate: 0.18, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "council-vault",
    name: "집행부 금고",
    badge: "STAGE 3",
    description: "희귀 재료와 장기 성장 재화를 모으는 방치형 핵심 구간입니다.",
    unlockLevel: 6,
    recommendedPower: 260,
    monsters: [
      {
        id: "vault-mimic",
        name: "금고 미믹",
        typeLabel: "함정형 / 희귀 재료",
        rarityLabel: "Epic",
        patternLabel: "고대 코어를 가장 먼저 안정적으로 공급하는 몬스터",
        maxHp: 1240,
        defense: 58,
        isBoss: false,
        reward: "고대 코어, 강화석",
        flavor: "드랍은 좋지만 방심하면 시간이 오래 걸립니다.",
        expReward: 108,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 140, max: 200 },
          { kind: "material", code: "enhancement-stone", rate: 0.82, min: 4, max: 7 },
          { kind: "material", code: "ancient-core", rate: 0.14, min: 1, max: 1 }
        ]
      },
      {
        id: "executive-specter",
        name: "집행 유령",
        typeLabel: "유틸형 / 드랍 특화",
        rarityLabel: "Epic",
        patternLabel: "행운 스크롤과 보호 주문서 드랍을 동시에 노릴 수 있습니다",
        maxHp: 1480,
        defense: 66,
        isBoss: false,
        reward: "행운 스크롤, 보호 주문서",
        flavor: "드랍 최적화 세팅을 만들기 좋은 몬스터입니다.",
        expReward: 124,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 170, max: 240 },
          { kind: "material", code: "refined-stone", rate: 0.44, min: 1, max: 3 },
          { kind: "consumable", code: "lucky-scroll", rate: 0.2, min: 1, max: 1 },
          { kind: "consumable", code: "protection-scroll", rate: 0.16, min: 1, max: 1 }
        ]
      },
      {
        id: "council-dragon",
        name: "동연 드래곤",
        typeLabel: "최종 보스 / 장기 파밍",
        rarityLabel: "Legendary Boss",
        patternLabel: "고대 코어와 대량 재화를 동시에 뿌리는 최종 반복 보스",
        maxHp: 1820,
        defense: 74,
        isBoss: true,
        reward: "고대 코어, 대량 재화",
        flavor: "현재 빌드의 최종 반복 파밍 보스입니다.",
        expReward: 150,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 220, max: 320 },
          { kind: "material", code: "enhancement-stone", rate: 0.88, min: 5, max: 8 },
          { kind: "material", code: "refined-stone", rate: 0.5, min: 2, max: 3 },
          { kind: "material", code: "ancient-core", rate: 0.22, min: 1, max: 2 },
          { kind: "consumable", code: "protection-scroll", rate: 0.2, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "festival-street",
    name: "축제 거리",
    badge: "STAGE 4",
    description: "몬스터 종류가 늘어나고 자동 사냥과 클릭 화력을 모두 요구하는 구간입니다.",
    unlockLevel: 9,
    recommendedPower: 420,
    monsters: [
      {
        id: "booth-spirit",
        name: "부스 정령",
        typeLabel: "지원형 / 재화 분산",
        rarityLabel: "Elite",
        patternLabel: "코인과 포션을 고르게 공급하는 축제형 몬스터",
        maxHp: 2240,
        defense: 88,
        isBoss: false,
        reward: "코인, 포션, 강화석",
        flavor: "축제 부스 사이를 떠다니며 소모품을 흘립니다.",
        expReward: 178,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 260, max: 360 },
          { kind: "material", code: "enhancement-stone", rate: 0.92, min: 5, max: 9 },
          { kind: "consumable", code: "healing-potion", rate: 0.24, min: 1, max: 2 }
        ]
      },
      {
        id: "cheer-lion",
        name: "응원 사자",
        typeLabel: "돌격형 / 카드 지원",
        rarityLabel: "Elite",
        patternLabel: "응원 포인트 파밍과 광폭 토닉 확보에 특화",
        maxHp: 2480,
        defense: 96,
        isBoss: false,
        reward: "광폭 토닉, 보호 주문서",
        flavor: "응원단의 열기를 끌어모은 야수형 몬스터입니다.",
        expReward: 192,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 280, max: 390 },
          { kind: "material", code: "refined-stone", rate: 0.52, min: 2, max: 3 },
          { kind: "consumable", code: "berserk-tonic", rate: 0.18, min: 1, max: 1 },
          { kind: "consumable", code: "protection-scroll", rate: 0.18, min: 1, max: 1 }
        ]
      },
      {
        id: "night-parade-queen",
        name: "야행 퍼레이드 퀸",
        typeLabel: "보스 / 드랍 혼합형",
        rarityLabel: "Festival Boss",
        patternLabel: "소비 아이템과 희귀 재료를 동시에 뿌리는 축제 보스",
        maxHp: 2860,
        defense: 108,
        isBoss: true,
        reward: "희귀 재료, 보호 주문서",
        flavor: "패턴은 화려하지만 순수 전투력 검사를 강하게 요구합니다.",
        expReward: 220,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 340, max: 460 },
          { kind: "material", code: "enhancement-stone", rate: 0.95, min: 6, max: 10 },
          { kind: "material", code: "ancient-core", rate: 0.28, min: 1, max: 2 },
          { kind: "consumable", code: "lucky-scroll", rate: 0.22, min: 1, max: 1 },
          { kind: "consumable", code: "protection-scroll", rate: 0.24, min: 1, max: 1 }
        ]
      }
    ]
  },
  {
    id: "archive-labyrinth",
    name: "기록 보관 미궁",
    badge: "STAGE 5",
    description: "현재 빌드의 최고 난도 구간입니다. 공격력과 장기 파밍 효율을 동시에 봅니다.",
    unlockLevel: 12,
    recommendedPower: 620,
    monsters: [
      {
        id: "index-wraith",
        name: "목차 망령",
        typeLabel: "추적형 / 희귀 재화",
        rarityLabel: "Mythic",
        patternLabel: "고대 코어와 정제 강화석을 안정적으로 공급",
        maxHp: 3380,
        defense: 122,
        isBoss: false,
        reward: "고대 코어, 정제 강화석",
        flavor: "기록 깊은 곳에서 정밀 재료만 골라 떨어뜨립니다.",
        expReward: 256,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 420, max: 560 },
          { kind: "material", code: "refined-stone", rate: 0.64, min: 2, max: 4 },
          { kind: "material", code: "ancient-core", rate: 0.32, min: 1, max: 2 }
        ]
      },
      {
        id: "ledger-hydra",
        name: "장부 히드라",
        typeLabel: "다중두 / 클릭 압박",
        rarityLabel: "Mythic",
        patternLabel: "클릭 누적과 자동 사냥 효율을 동시에 시험",
        maxHp: 3720,
        defense: 136,
        isBoss: false,
        reward: "대량 코인, 스크롤류",
        flavor: "머리가 늘어날수록 화력이 부족하면 체감 난도가 급상승합니다.",
        expReward: 274,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 460, max: 620 },
          { kind: "material", code: "enhancement-stone", rate: 0.98, min: 7, max: 11 },
          { kind: "consumable", code: "berserk-tonic", rate: 0.24, min: 1, max: 1 },
          { kind: "consumable", code: "lucky-scroll", rate: 0.24, min: 1, max: 1 }
        ]
      },
      {
        id: "grand-archive-core",
        name: "대기록 핵심체",
        typeLabel: "최종 보스 / 전투력 검사",
        rarityLabel: "Final Boss",
        patternLabel: "최고 난도 장기 파밍 보스. 장비와 강화 연동 확인용",
        maxHp: 4280,
        defense: 152,
        isBoss: true,
        reward: "최고급 재료 패키지",
        flavor: "현재 구조에서 가장 높은 전투력과 장비 성장을 요구합니다.",
        expReward: 320,
        dropTable: [
          { kind: "material", code: "club-coin", rate: 1, min: 520, max: 720 },
          { kind: "material", code: "enhancement-stone", rate: 1, min: 8, max: 12 },
          { kind: "material", code: "refined-stone", rate: 0.72, min: 3, max: 5 },
          { kind: "material", code: "ancient-core", rate: 0.38, min: 1, max: 3 },
          { kind: "consumable", code: "protection-scroll", rate: 0.28, min: 1, max: 1 }
        ]
      }
    ]
  }
];

const createStageState = (stage: StageDefinition): StageMonsterState[] =>
  stage.monsters.map((monster) => ({
    ...monster,
    currentHp: monster.maxHp,
    defeatedCount: 0
  }));

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const HuntingGroundPage = () => {
  const { user } = useUserAuth();
  const [profile, setProfile] = useState<HuntingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [progress, setProgress] = useState<HuntingProgress>(() => createDefaultProgress());
  const [stageMonsters, setStageMonsters] = useState<StageMonsterState[]>(() => createStageState(stageDefinitions[0]));
  const [rankingPeople, setRankingPeople] = useState<PowerRankingPerson[]>([]);
  const [attackBuffCharges, setAttackBuffCharges] = useState(0);
  const [dropBuffKills, setDropBuffKills] = useState(0);

  useEffect(() => {
    document.title = "동아리연합회 사냥터";
  }, []);

  const storageKey = useMemo(() => (user ? getHuntingStorageKey(user.id) : ""), [user]);

  useEffect(() => {
    if (!user || !storageKey) {
      setProgress(createDefaultProgress());
      setStageMonsters(createStageState(stageDefinitions[0]));
      setAttackBuffCharges(0);
      setDropBuffKills(0);
      return;
    }

    const nextProgress = loadHuntingProgress(storageKey);
    const selectedStage =
      stageDefinitions.find((stage) => stage.id === nextProgress.selectedStageId) ?? stageDefinitions[0];

    setProgress(nextProgress);
    setStageMonsters(createStageState(selectedStage));
  }, [storageKey, user]);

  useEffect(() => {
    if (!user || !storageKey) {
      return;
    }
    saveHuntingProgress(storageKey, progress);
  }, [progress, storageKey, user]);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [nextProfile, people] = await Promise.all([
        apiClient.getHuntingProfile(),
        apiClient.getPowerRanking("all")
      ]);
      setProfile(nextProfile);
      setRankingPeople(people);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "사냥터 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshProfile();
  }, [user]);

  useEffect(() => {
    if (!rankingPeople.length) {
      return;
    }
    setProgress((current) =>
      current.selectedCardTargetId
        ? current
        : {
            ...current,
            selectedCardTargetId: rankingPeople[0].id
          }
    );
  }, [rankingPeople]);

  const activeStage = useMemo(
    () => stageDefinitions.find((stage) => stage.id === progress.selectedStageId) ?? stageDefinitions[0],
    [progress.selectedStageId]
  );
  const selectedMonster = useMemo(
    () => stageMonsters.find((monster) => monster.id === progress.selectedMonsterId) ?? stageMonsters[0] ?? null,
    [progress.selectedMonsterId, stageMonsters]
  );
  const selectedCardTarget = useMemo(
    () => rankingPeople.find((person) => person.id === progress.selectedCardTargetId) ?? null,
    [progress.selectedCardTargetId, rankingPeople]
  );
  const equippedList = useMemo(
    () => Object.values(profile?.equippedItems ?? {}),
    [profile?.equippedItems]
  );

  const enhancementBonus = useMemo(
    () =>
      equippedList.reduce((sum, item) => {
        const level = progress.enhancementLevels[item.code] ?? 0;
        return sum + level * 8 + (level >= 8 ? 10 : 0);
      }, 0),
    [equippedList, progress.enhancementLevels]
  );

  const playerLevelAttackBonus = Math.max(0, (progress.level - 1) * 12);
  const attackBuffMultiplier = attackBuffCharges > 0 ? 1.28 : 1;
  const autoGrowthMultiplier = profile?.autoGrowthMultiplier ?? 1;
  const fatigueDropMultiplier =
    progress.endurance >= 60 ? 1 : progress.endurance >= 30 ? 0.88 : 0.74;
  const dropRateMultiplier =
    (profile?.dropRateMultiplier ?? 1) * (dropBuffKills > 0 ? 1.35 : 1) * fatigueDropMultiplier;
  const critRate = Math.min(0.38, 0.05 + (progress.level - 1) * 0.012 + (attackBuffCharges > 0 ? 0.05 : 0));
  const effectiveBattlePower = Math.max(
    1,
    Math.floor(((profile?.battlePower ?? 0) + playerLevelAttackBonus + enhancementBonus) * attackBuffMultiplier)
  );

  const appendLog = (message: string) => {
    setCombatLog((current) => [message, ...current].slice(0, 12));
  };

  const applyMonsterDrops = (monster: StageMonster): DropReward[] => {
    const rewards: DropReward[] = [];

    const rollTable = (ratePenaltyMultiplier: number) => {
      monster.dropTable.forEach((entry) => {
        const appliedRate = Math.min(0.9, entry.rate * dropRateMultiplier * ratePenaltyMultiplier);
        if (Math.random() <= appliedRate) {
          rewards.push({
            kind: entry.kind,
            code: entry.code,
            quantity: getRandomInt(entry.min, entry.max)
          } as DropReward);
        }
      });
    };

    rollTable(monster.isBoss ? 0.82 : 1);

    if (monster.isBoss && Math.random() < (profile?.bossBonusRollRate ?? 0)) {
      rollTable(0.42);
    } else if (!monster.isBoss && Math.random() < (profile?.bossBonusRollRate ?? 0) * 0.25) {
      rollTable(0.2);
    }

    return rewards;
  };

  const selectedMonsterName = stageMonsters.find((monster) => monster.id === progress.selectedMonsterId)?.name ?? "-";
  const grantRewards = (monster: StageMonster, rewards: DropReward[]) => {
    setProgress((current) => {
      let nextLevel = current.level;
      let nextExp = current.exp + monster.expReward;
      const nextMaterials = { ...current.materials };
      const nextConsumables = { ...current.consumables };

      rewards.forEach((reward) => {
        if (reward.kind === "material") {
          nextMaterials[reward.code] += reward.quantity;
        } else {
          nextConsumables[reward.code] += reward.quantity;
        }
      });

      while (nextExp >= getExpToNextLevel(nextLevel)) {
        nextExp -= getExpToNextLevel(nextLevel);
        nextLevel += 1;
      }

      return {
        ...current,
        level: nextLevel,
        exp: nextExp,
        materials: nextMaterials,
        consumables: nextConsumables,
        totalDefeated: current.totalDefeated + 1,
        cardSupportPoints:
          current.selectedCardTargetId && equippedHeadItem
            ? Math.min(60, current.cardSupportPoints + (monster.isBoss ? 3 : Math.max(1, Math.floor(cardGrowthMultiplier))))
            : current.cardSupportPoints
      };
    });
  };

  const handleAttackMonster = (monsterId: string, source: "click" | "auto" = "click") => {
    if (!profile) {
      setErrorMessage("회원가입 이후 이용가능합니다.");
      return;
    }

    const enduranceCost = source === "click" ? 4 : 2;
    if (progress.endurance < enduranceCost) {
      setErrorMessage("지구력이 부족합니다. 포션을 사용하거나 잠시 회복을 기다리세요.");
      return;
    }

    setProgress((current) => ({
      ...current,
      endurance: Math.max(0, current.endurance - enduranceCost),
      selectedMonsterId: monsterId
    }));

    setStageMonsters((current) =>
      current.map((monster) => {
        if (monster.id !== monsterId) {
          return monster;
        }

        const skillMultiplier = source === "click" ? 0.94 + Math.random() * 0.24 : 0.38 + Math.random() * 0.1;
        const isCritical = Math.random() < critRate;
        const sourceMultiplier = source === "click" ? 1 : autoGrowthMultiplier;
        const damage = Math.max(
          1,
          Math.floor(effectiveBattlePower * sourceMultiplier * skillMultiplier * (isCritical ? 1.75 : 1) - monster.defense)
        );
        const nextHp = monster.currentHp - damage;

        setAttackBuffCharges((currentCharges) => Math.max(0, currentCharges - 1));

        if (nextHp <= 0) {
          const rewards = applyMonsterDrops(monster);
          const rewardSummary =
            rewards.length > 0
              ? rewards
                  .map((reward) =>
                    reward.kind === "material"
                      ? `${materialMeta[reward.code].name} x${reward.quantity}`
                      : `${consumableMeta[reward.code].name} x${reward.quantity}`
                  )
                  .join(", ")
              : "드랍 없음";

          appendLog(
            `${source === "auto" ? "[자동]" : "[클릭]"} ${monster.name} 처치! ${damage} 데미지 · ${rewardSummary}`
          );

          if (dropBuffKills > 0) {
            setDropBuffKills((currentKills) => Math.max(0, currentKills - 1));
          }

          grantRewards(monster, rewards);

          return {
            ...monster,
            currentHp: monster.maxHp,
            defeatedCount: monster.defeatedCount + 1
          };
        }

        appendLog(
          `${source === "auto" ? "[자동]" : "[클릭]"} ${monster.name}에게 ${damage}${isCritical ? " 치명타" : ""} 데미지`
        );

        return {
          ...monster,
          currentHp: nextHp
        };
      })
    );
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const recoveryTimer = window.setInterval(() => {
      setProgress((current) => ({
        ...current,
        endurance: Math.min(MAX_ENDURANCE, current.endurance + 2)
      }));
    }, 3000);

    return () => window.clearInterval(recoveryTimer);
  }, [user]);

  useEffect(() => {
    if (!user || !progress.autoAttackEnabled || !profile) {
      return;
    }

    const autoTimer = window.setInterval(() => {
      void handleAttackMonster(progress.selectedMonsterId, "auto");
    }, Math.max(1200, Math.floor(2400 / autoGrowthMultiplier)));

    return () => window.clearInterval(autoTimer);
  }, [profile, progress.autoAttackEnabled, progress.selectedMonsterId, user, progress.endurance, effectiveBattlePower, critRate, autoGrowthMultiplier]);

  const handleStageSelect = (stageId: string) => {
    const stage = stageDefinitions.find((item) => item.id === stageId);
    if (!stage) {
      return;
    }
    if (progress.level < stage.unlockLevel) {
      setErrorMessage(`${stage.name}은 레벨 ${stage.unlockLevel}부터 입장할 수 있습니다.`);
      return;
    }

    setErrorMessage("");
    setProgress((current) => ({
      ...current,
      selectedStageId: stage.id,
      selectedMonsterId: stage.monsters[0].id
    }));
    setStageMonsters(createStageState(stage));
    appendLog(`${stage.name}으로 이동했습니다.`);
  };

  const handleMonsterFocus = (monsterId: string) => {
    setProgress((current) => ({
      ...current,
      selectedMonsterId: monsterId
    }));
    const monsterName = stageMonsters.find((monster) => monster.id === monsterId)?.name;
    if (monsterName) {
      appendLog(`${monsterName}을(를) 현재 자동 사냥 대상으로 지정했습니다.`);
    }
  };

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Idle Hunting Loop</p>
            <h1>사냥터</h1>
            <p className="powerRankingLead">
              클릭으로 몬스터를 처치하고, 자동 사냥으로 재화를 모으고, 강화와 소비 아이템으로 더 높은 사냥터를 여는 구조를 넣었습니다.
            </p>
          </div>

          <div className="powerRankingControlPanel huntingPowerPanel">
            <div className="powerRankingStats huntingPowerStats">
              <div className="powerRankingStatCard">
                <span>사냥 레벨</span>
                <strong>{progress.level}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>전투력</span>
                <strong>{effectiveBattlePower}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>누적 처치</span>
                <strong>{progress.totalDefeated}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>지구력</span>
                <strong>{progress.endurance} / {MAX_ENDURANCE}</strong>
              </div>
            </div>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

        {!user ? (
          <div className="powerRankingLoading">회원가입 이후 이용가능합니다.</div>
        ) : isLoading ? (
          <div className="powerRankingLoading">사냥터 정보를 불러오는 중입니다.</div>
        ) : (
          <>
            <section className="powerRankingDashboardSection huntingOverviewSection" id="hunting-my-info">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">My Hunting Hub</p>
                  <h2>내 정보</h2>
                </div>
                <p className="powerRankingSectionHint">
                  사냥터에서 필요한 개인 정보만 먼저 보고, 아래 `sub-nav`로 원하는 영역만 바로 확인할 수 있게 정리했습니다.
                </p>
              </div>

              <div className="powerRankingDashboardGrid huntingOverviewGrid">
                <article className="powerRankingDashboardCard">
                  <span>내 상태</span>
                  <strong>Lv.{progress.level}</strong>
                  <p>전투력 {effectiveBattlePower} · 지구력 {progress.endurance}/{MAX_ENDURANCE}</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>내 장비</span>
                  <strong>{equippedList.length} / 5</strong>
                  <p>장착 장비와 강화는 내 장비 페이지에서 관리합니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>내 프로필</span>
                  <strong>{selectedCardTarget?.name ?? user.nickname}</strong>
                  <p>현재 응원 카드 대상과 파워랭킹 연동 상태를 확인할 수 있습니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>내 소개</span>
                  <strong>{activeStage.name}</strong>
                  <p>지금 입장한 사냥터와 추천 전투력 {activeStage.recommendedPower}를 기준으로 진행합니다.</p>
                </article>
              </div>
            </section>

            <nav className="huntingSubNav" aria-label="사냥터 내 정보 이동">
              <a href="#hunting-my-info" className="huntingSubNavLink">내 정보</a>
              <a href="#hunting-status" className="huntingSubNavLink">내 상태</a>
              <a href="#hunting-stage" className="huntingSubNavLink">사냥터</a>
              <a href="#hunting-log" className="huntingSubNavLink">전투 로그</a>
            </nav>

            <section className="powerRankingDashboardSection huntingLoopSection" id="hunting-status">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">My Status</p>
                  <h2>내 상태</h2>
                </div>
                <p className="powerRankingSectionHint">
                  전투력, 성장 보너스, 치명타, 자동 성장처럼 지금 전투에 바로 영향을 주는 값만 모았습니다.
                </p>
              </div>

              <div className="powerRankingDashboardGrid">
                <article className="powerRankingDashboardCard">
                  <span>무기 고정 공격력</span>
                  <strong>{profile?.weaponAttack ?? 0}</strong>
                  <p>의상 퍼센트와 세트 효과보다 먼저 깔리는 핵심 공격력입니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>성장 보너스</span>
                  <strong>+{playerLevelAttackBonus + enhancementBonus}</strong>
                  <p>사냥 레벨과 장비 강화에서 추가된 공격 보너스입니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>치명타 확률</span>
                  <strong>{Math.round(critRate * 100)}%</strong>
                  <p>레벨과 광폭 토닉 상태가 반영됩니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>자동 성장</span>
                  <strong>x{autoGrowthMultiplier.toFixed(2)}</strong>
                  <p>신발 계열은 자동 사냥 효율 중심이고, 클릭 데미지 직접 상승은 낮게 제한했습니다.</p>
                </article>
              </div>
            </section>

            <section className="powerRankingBoardSection huntingStageSection" id="hunting-stage">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Stage Progression</p>
                  <h2>사냥터 이동</h2>
                </div>
                <p className="powerRankingSectionHint">
                  높은 스테이지일수록 재화와 희귀 소비 아이템이 좋아집니다.
                </p>
              </div>

              <div className="huntingStageSelector">
                {stageDefinitions.map((stage) => {
                  const isUnlocked = progress.level >= stage.unlockLevel;
                  const isActive = stage.id === activeStage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      className={`huntingStageChip ${isActive ? "isActive" : ""}`}
                      disabled={!isUnlocked}
                      onClick={() => handleStageSelect(stage.id)}
                    >
                      <strong>{stage.badge}</strong>
                      <span>{stage.name}</span>
                      <small>{isUnlocked ? `권장 전투력 ${stage.recommendedPower}` : `레벨 ${stage.unlockLevel} 필요`}</small>
                    </button>
                  );
                })}
              </div>

              <div className="huntingStageToolbar">
                <div className="huntingStageMeta">
                  <strong>{activeStage.name}</strong>
                  <p>{activeStage.description}</p>
                </div>

                <div className="huntingStageActions">
                  <button
                    type="button"
                    className="powerRankingItemButton"
                    onClick={() =>
                      setProgress((current) => ({
                        ...current,
                        autoAttackEnabled: !current.autoAttackEnabled
                      }))
                    }
                  >
                    {progress.autoAttackEnabled ? "자동 사냥 중지" : "자동 사냥 시작"}
                  </button>
                  <span className="powerRankingInventoryPill isMuted">
                    현재 대상 {selectedMonsterName}
                  </span>
                </div>
              </div>

              <div className="huntingMonsterGrid">
                {stageMonsters.map((monster) => {
                  const hpPercent = Math.max(0, (monster.currentHp / monster.maxHp) * 100);
                  return (
                    <article
                      key={monster.id}
                      className={`huntingMonsterCard ${progress.selectedMonsterId === monster.id ? "isActive" : ""}`}
                    >
                      <div className="huntingMonsterVisual">
                        <img
                          src={monsterImageUrls[monster.id]}
                          alt={monster.name}
                          className="huntingMonsterImage"
                        />
                      </div>
                      <span className="huntingMonsterBadge">{activeStage.badge}</span>
                      <strong>{monster.name}</strong>
                      <p>{monster.flavor}</p>
                      <div className="huntingMonsterStat">
                        <span>HP {monster.currentHp} / {monster.maxHp}</span>
                        <span>DEF {monster.defense}</span>
                      </div>
                      <div className="huntingMonsterHpBar">
                        <div className="huntingMonsterHpFill" style={{ width: `${hpPercent}%` }} />
                      </div>
                      <small>드롭: {monster.reward} · 처치 {monster.defeatedCount}</small>
                      <div className="huntingMonsterActions">
                        <button
                          type="button"
                          className="powerRankingItemButton"
                          onClick={() => handleAttackMonster(monster.id)}
                        >
                          공격
                        </button>
                        <button
                          type="button"
                          className={`powerRankingBackLink ${progress.selectedMonsterId === monster.id ? "isActiveTarget" : ""}`}
                          onClick={() => handleMonsterFocus(monster.id)}
                        >
                          {progress.autoAttackEnabled ? "자동 대상 지정" : "대상 지정"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {selectedMonster ? (
                <div className="huntingMonsterDetailPanel">
                  <div className="huntingMonsterDetailHead">
                    <div className="huntingMonsterDetailVisual">
                      <img
                        src={monsterImageUrls[selectedMonster.id]}
                        alt={selectedMonster.name}
                        className="huntingMonsterDetailImage"
                      />
                    </div>
                    <div>
                      <p className="powerRankingEyebrow">{selectedMonster.rarityLabel}</p>
                      <h3>{selectedMonster.name}</h3>
                      <p className="huntingMonsterDetailFlavor">{selectedMonster.flavor}</p>
                    </div>
                    <div className="powerRankingInventoryTags">
                      <span className="powerRankingInventoryPill">{selectedMonster.typeLabel}</span>
                      <span className="powerRankingInventoryPill isMuted">{selectedMonster.patternLabel}</span>
                    </div>
                  </div>

                  <div className="huntingMonsterDetailGrid">
                    <article className="powerRankingLogCard">
                      <strong>몬스터 정보</strong>
                      <ul className="huntingResourceList">
                        <li>
                          <div>
                            <strong>추천 전투력</strong>
                            <p>{activeStage.name} 기준 적정 파밍 구간입니다.</p>
                          </div>
                          <span>{activeStage.recommendedPower}</span>
                        </li>
                        <li>
                          <div>
                            <strong>기본 방어력</strong>
                            <p>높을수록 클릭보다 공격력 세팅이 더 중요합니다.</p>
                          </div>
                          <span>{selectedMonster.defense}</span>
                        </li>
                        <li>
                          <div>
                            <strong>보스 여부</strong>
                            <p>보스는 추가 롤 기반으로만 희귀 드랍이 늘어납니다.</p>
                          </div>
                          <span>{selectedMonster.isBoss ? "Boss" : "Normal"}</span>
                        </li>
                      </ul>
                    </article>

                    <article className="powerRankingLogCard">
                      <strong>드랍 테이블</strong>
                      <ul className="huntingDropTable">
                        {selectedMonster.dropTable.map((entry, index) => {
                          const entryName =
                            entry.kind === "material" ? materialMeta[entry.code].name : consumableMeta[entry.code].name;
                          return (
                            <li key={`${selectedMonster.id}-${entry.code}-${index}`}>
                              <div>
                                <strong>{entryName}</strong>
                                <p>{entry.kind === "material" ? "재료" : "소비 아이템"}</p>
                              </div>
                              <span>{Math.round(entry.rate * 100)}%</span>
                              <em>{entry.min}~{entry.max}개</em>
                            </li>
                          );
                        })}
                      </ul>
                    </article>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="powerRankingLogSection" id="hunting-log">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Combat Log</p>
                  <h2>전투 로그</h2>
                </div>
              </div>
              <div className="powerRankingLogCard">
                <ul className="powerRankingLogList">
                  {combatLog.length > 0 ? (
                    combatLog.map((log, index) => (
                      <li key={`${log}-${index}`}>
                        <p>{log}</p>
                      </li>
                    ))
                  ) : (
                    <li>
                      <p>첫 공격을 시작해 보세요.</p>
                    </li>
                  )}
                </ul>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HuntingGroundPage;
