import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import { useUserAuth } from "../auth/UserAuthContext";
import CommunityTopBar from "../components/CommunityTopBar";
import { getPowerRankingEquipmentEnhancementPlan } from "../data/powerRankingEquipment";
import type { HuntingProfile, PowerRankingEquipmentCode, PowerRankingPerson } from "../types";
import { getOrCreateDeviceId } from "../utils/deviceId";

type HuntingMaterialCode = "club-coin" | "enhancement-stone" | "refined-stone" | "ancient-core";
type HuntingConsumableCode = "healing-potion" | "berserk-tonic" | "lucky-scroll" | "protection-scroll";
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

type HuntingProgress = {
  level: number;
  exp: number;
  endurance: number;
  selectedStageId: string;
  selectedMonsterId: string;
  autoAttackEnabled: boolean;
  materials: Record<HuntingMaterialCode, number>;
  consumables: Record<HuntingConsumableCode, number>;
  enhancementLevels: Partial<Record<PowerRankingEquipmentCode, number>>;
  totalDefeated: number;
  selectedCardTargetId: string;
  cardSupportPoints: number;
};

const MAX_ENDURANCE = 100;

const materialMeta: Record<HuntingMaterialCode, { name: string; description: string }> = {
  "club-coin": { name: "동연 코인", description: "사냥터 경제의 기본 화폐입니다." },
  "enhancement-stone": { name: "강화석", description: "장비 강화의 기본 재료입니다." },
  "refined-stone": { name: "정제 강화석", description: "+8 이상 강화 보조 재료로 사용됩니다." },
  "ancient-core": { name: "고대 코어", description: "상위 사냥터에서 얻는 희귀 성장 재료입니다." }
};

const consumableMeta: Record<HuntingConsumableCode, { name: string; description: string }> = {
  "healing-potion": { name: "회복 포션", description: "지구력 35를 회복합니다." },
  "berserk-tonic": { name: "광폭 토닉", description: "다음 8회 공격의 최종 공격력을 끌어올립니다." },
  "lucky-scroll": { name: "행운 스크롤", description: "다음 5회 처치 동안 드랍 효율이 증가합니다." },
  "protection-scroll": { name: "보호 주문서", description: "고강화 실패 시 추가 손실을 막아줍니다." }
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
  }
];

const createStageState = (stage: StageDefinition): StageMonsterState[] =>
  stage.monsters.map((monster) => ({
    ...monster,
    currentHp: monster.maxHp,
    defeatedCount: 0
  }));

const createDefaultProgress = (): HuntingProgress => ({
  level: 1,
  exp: 0,
  endurance: MAX_ENDURANCE,
  selectedStageId: stageDefinitions[0].id,
  selectedMonsterId: stageDefinitions[0].monsters[0].id,
  autoAttackEnabled: false,
  materials: {
    "club-coin": 0,
    "enhancement-stone": 0,
    "refined-stone": 0,
    "ancient-core": 0
  },
  consumables: {
    "healing-potion": 0,
    "berserk-tonic": 0,
    "lucky-scroll": 0,
    "protection-scroll": 0
  },
  enhancementLevels: {},
  totalDefeated: 0,
  selectedCardTargetId: "",
  cardSupportPoints: 0
});

const getExpToNextLevel = (level: number): number => 80 + (level - 1) * 45;

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const loadProgress = (storageKey: string): HuntingProgress => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return createDefaultProgress();
    }
    const parsed = JSON.parse(raw) as Partial<HuntingProgress>;
    return {
      ...createDefaultProgress(),
      ...parsed,
      materials: {
        ...createDefaultProgress().materials,
        ...(parsed.materials ?? {})
      },
      consumables: {
        ...createDefaultProgress().consumables,
        ...(parsed.consumables ?? {})
      },
      enhancementLevels: parsed.enhancementLevels ?? {}
    };
  } catch {
    return createDefaultProgress();
  }
};

const HuntingGroundPage = () => {
  const { user } = useUserAuth();
  const [profile, setProfile] = useState<HuntingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [equipSubmittingCode, setEquipSubmittingCode] = useState<string | null>(null);
  const [progress, setProgress] = useState<HuntingProgress>(() => createDefaultProgress());
  const [stageMonsters, setStageMonsters] = useState<StageMonsterState[]>(() => createStageState(stageDefinitions[0]));
  const [rankingPeople, setRankingPeople] = useState<PowerRankingPerson[]>([]);
  const [attackBuffCharges, setAttackBuffCharges] = useState(0);
  const [dropBuffKills, setDropBuffKills] = useState(0);
  const [protectionReady, setProtectionReady] = useState(true);

  useEffect(() => {
    document.title = "동아리연합회 사냥터";
  }, []);

  const storageKey = useMemo(() => (user ? `dongyeon-hunting:${user.id}` : ""), [user]);

  useEffect(() => {
    if (!user || !storageKey) {
      setProgress(createDefaultProgress());
      setStageMonsters(createStageState(stageDefinitions[0]));
      setAttackBuffCharges(0);
      setDropBuffKills(0);
      return;
    }

    const nextProgress = loadProgress(storageKey);
    const selectedStage =
      stageDefinitions.find((stage) => stage.id === nextProgress.selectedStageId) ?? stageDefinitions[0];

    setProgress(nextProgress);
    setStageMonsters(createStageState(selectedStage));
  }, [storageKey, user]);

  useEffect(() => {
    if (!user || !storageKey) {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(progress));
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

  const handleEquipEquipment = async (equipmentCode: PowerRankingEquipmentCode) => {
    setEquipSubmittingCode(equipmentCode);
    try {
      await apiClient.equipPowerRankingEquipment({ equipmentCode });
      await refreshProfile();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "장비를 착용하지 못했습니다.");
    } finally {
      setEquipSubmittingCode(null);
    }
  };

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
  const equippedHeadItem = profile?.equippedItems.head ?? null;

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
  const cardGrowthMultiplier = profile?.cardGrowthMultiplier ?? 1;
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

  const handleUseConsumable = (code: HuntingConsumableCode) => {
    if (progress.consumables[code] < 1) {
      setErrorMessage("보유한 소비 아이템이 없습니다.");
      return;
    }

    setErrorMessage("");
    setProgress((current) => ({
      ...current,
      consumables: {
        ...current.consumables,
        [code]: Math.max(0, current.consumables[code] - 1)
      },
      endurance: code === "healing-potion" ? Math.min(MAX_ENDURANCE, current.endurance + 35) : current.endurance
    }));

    if (code === "berserk-tonic") {
      setAttackBuffCharges(8);
      appendLog("광폭 토닉 사용. 다음 8회 공격의 화력이 증가합니다.");
      return;
    }
    if (code === "lucky-scroll") {
      setDropBuffKills(5);
      appendLog("행운 스크롤 사용. 다음 5회 처치 드랍률이 상승합니다.");
      return;
    }
    if (code === "protection-scroll") {
      setProtectionReady(true);
      appendLog("보호 주문서를 준비했습니다. 다음 고강화 시도에서 손실을 막습니다.");
      return;
    }

    appendLog("회복 포션 사용. 지구력을 회복했습니다.");
  };

  const handleSendCardSupport = async () => {
    if (!selectedCardTarget) {
      setErrorMessage("응원할 카드를 먼저 선택하세요.");
      return;
    }
    if (!equippedHeadItem) {
      setErrorMessage("모자를 착용해야 응원 카드를 성장시킬 수 있습니다.");
      return;
    }
    if (progress.cardSupportPoints < 5) {
      setErrorMessage("응원 포인트가 부족합니다. 몬스터를 더 처치하세요.");
      return;
    }

    setErrorMessage("");
    try {
      await apiClient.submitPowerRankingVote(selectedCardTarget.id, {
        deviceId: getOrCreateDeviceId(),
        delta: 1,
        period: "all"
      });
      setProgress((current) => ({
        ...current,
        cardSupportPoints: Math.max(0, current.cardSupportPoints - 5)
      }));
      const refreshedPeople = await apiClient.getPowerRanking("all");
      setRankingPeople(refreshedPeople);
      appendLog(`${selectedCardTarget.name} 카드에 모자 응원을 보내 인기도를 올렸습니다.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "응원 카드를 적용하지 못했습니다.");
    }
  };

  const handleEnhanceEquipment = (equipmentCode: PowerRankingEquipmentCode) => {
    const currentLevel = progress.enhancementLevels[equipmentCode] ?? 0;
    if (currentLevel >= 10) {
      setErrorMessage("이미 최대 강화 단계입니다.");
      return;
    }

    const targetTier = getPowerRankingEquipmentEnhancementPlan(equipmentCode).find(
      (tier) => tier.level === currentLevel + 1
    );
    if (!targetTier) {
      return;
    }

    if (progress.materials["enhancement-stone"] < targetTier.stoneCost) {
      setErrorMessage("강화석이 부족합니다.");
      return;
    }

    const useProtection = protectionReady && progress.consumables["protection-scroll"] > 0 && targetTier.level >= 8;
    const isSuccess = Math.random() < targetTier.successRate;

    setProgress((current) => {
      const nextMaterials = { ...current.materials };
      const nextConsumables = { ...current.consumables };
      const nextEnhancementLevels = { ...current.enhancementLevels };

      nextMaterials["enhancement-stone"] = Math.max(0, nextMaterials["enhancement-stone"] - targetTier.stoneCost);

      if (useProtection) {
        nextConsumables["protection-scroll"] = Math.max(0, nextConsumables["protection-scroll"] - 1);
      }

      if (isSuccess) {
        nextEnhancementLevels[equipmentCode] = currentLevel + 1;
      } else if (targetTier.failurePenalty === "강화석 추가 소모" && !useProtection) {
        nextMaterials["refined-stone"] = Math.max(0, nextMaterials["refined-stone"] - 1);
      }

      return {
        ...current,
        materials: nextMaterials,
        consumables: nextConsumables,
        enhancementLevels: nextEnhancementLevels
      };
    });

    if (useProtection) {
      setProtectionReady(false);
    }

    if (isSuccess) {
      appendLog(`${equipmentCode} 강화 성공! +${currentLevel + 1} 달성`);
      return;
    }

    appendLog(
      `${equipmentCode} 강화 실패. ${
        useProtection ? "보호 주문서가 손실을 막았습니다." : `패널티: ${targetTier.failurePenalty}`
      }`
    );
  };

  const nextExpRequired = getExpToNextLevel(progress.level);

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar
          equipmentInventory={profile?.equipmentInventory ?? []}
          equippedItems={profile?.equippedItems ?? {}}
          onEquipEquipment={handleEquipEquipment}
          equipSubmittingCode={equipSubmittingCode}
        />

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
            <section className="powerRankingDashboardSection huntingLoopSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Core Loop</p>
                  <h2>클릭 + 방치형 성장 루프</h2>
                </div>
                <p className="powerRankingSectionHint">
                  공격 → 처치 → 드랍 → 소비/강화 → 더 높은 사냥터 이동 구조입니다.
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

            <section className="powerRankingBoardSection huntingStageSection">
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
                    <button
                      key={monster.id}
                      type="button"
                      className={`huntingMonsterCard ${progress.selectedMonsterId === monster.id ? "isActive" : ""}`}
                      onClick={() => handleAttackMonster(monster.id)}
                    >
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
                    </button>
                  );
                })}
              </div>

              {selectedMonster ? (
                <div className="huntingMonsterDetailPanel">
                  <div className="huntingMonsterDetailHead">
                    <div>
                      <p className="powerRankingEyebrow">{selectedMonster.rarityLabel}</p>
                      <h3>{selectedMonster.name}</h3>
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

            <section className="powerRankingInventorySection huntingCardSupportSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Hat Card Support</p>
                  <h2>모자 응원 카드 선택</h2>
                </div>
                <p className="powerRankingSectionHint">
                  머리 장비는 전투 배수보다 카드 성장 효율에 집중됩니다. 응원 포인트 5를 모으면 선택한 카드의 인기도를 올릴 수 있습니다.
                </p>
              </div>

              <div className="huntingCardSupportPanel">
                <div className="huntingCardSupportMeta">
                  <span className="powerRankingInventoryPill">착용 모자 {equippedHeadItem ? equippedHeadItem.name : "없음"}</span>
                  <span className="powerRankingInventoryPill isMuted">카드 성장 x{cardGrowthMultiplier.toFixed(2)}</span>
                  <span className="powerRankingInventoryPill">응원 포인트 {progress.cardSupportPoints} / 5</span>
                </div>

                <div className="huntingCardTargetGrid">
                  {rankingPeople.slice(0, 8).map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      className={`huntingCardTarget ${progress.selectedCardTargetId === person.id ? "isActive" : ""}`}
                      onClick={() =>
                        setProgress((current) => ({
                          ...current,
                          selectedCardTargetId: person.id
                        }))
                      }
                    >
                      <strong>{person.name}</strong>
                      <span>현재 인기도 {person.score}</span>
                    </button>
                  ))}
                </div>

                <div className="huntingCardSupportActions">
                  <p>
                    현재 선택: <strong>{selectedCardTarget?.name ?? "-"}</strong>
                  </p>
                  <button
                    type="button"
                    className="powerRankingItemButton isPositive"
                    disabled={!equippedHeadItem || progress.cardSupportPoints < 5 || !selectedCardTarget}
                    onClick={() => void handleSendCardSupport()}
                  >
                    선택 카드 인기도 올리기
                  </button>
                </div>
              </div>
            </section>

            <section className="powerRankingInventorySection huntingResourceSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Inventory & Economy</p>
                  <h2>재료 / 소비 아이템</h2>
                </div>
                <p className="powerRankingSectionHint">
                  강화석과 재화를 모으고, 소비 아이템으로 효율을 끌어올릴 수 있습니다.
                </p>
              </div>

              <div className="huntingResourceGrid">
                <article className="powerRankingLogCard">
                  <strong>재료 인벤토리</strong>
                  <ul className="huntingResourceList">
                    {(Object.keys(materialMeta) as HuntingMaterialCode[]).map((code) => (
                      <li key={code}>
                        <div>
                          <strong>{materialMeta[code].name}</strong>
                          <p>{materialMeta[code].description}</p>
                        </div>
                        <span>x{progress.materials[code]}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="powerRankingLogCard">
                  <strong>소비 아이템</strong>
                  <ul className="huntingResourceList">
                    {(Object.keys(consumableMeta) as HuntingConsumableCode[]).map((code) => (
                      <li key={code}>
                        <div>
                          <strong>{consumableMeta[code].name}</strong>
                          <p>{consumableMeta[code].description}</p>
                        </div>
                        <div className="huntingConsumableAction">
                          <span>x{progress.consumables[code]}</span>
                          <button
                            type="button"
                            className="powerRankingBackLink"
                            disabled={progress.consumables[code] < 1}
                            onClick={() => handleUseConsumable(code)}
                          >
                            사용
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </section>

            <section className="powerRankingInventorySection huntingEnhancementSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Equipment Growth</p>
                  <h2>장비 강화</h2>
                </div>
                <p className="powerRankingSectionHint">
                  현재 장착 중인 장비만 강화하며, 강화 효과는 사냥터 전투력에 즉시 반영됩니다.
                </p>
              </div>

              <div className="huntingEnhancementSummary">
                <span className="powerRankingInventoryPill">강화 보너스 +{enhancementBonus}</span>
                <span className="powerRankingInventoryPill isMuted">
                  보호 주문서 준비 {protectionReady ? "ON" : "OFF"}
                </span>
              </div>

              <div className="huntingEnhancementGrid">
                {equippedList.length === 0 ? (
                  <article className="powerRankingInventoryEmpty">장착한 장비가 없어 강화할 수 없습니다.</article>
                ) : (
                  equippedList.map((item) => {
                    const currentLevel = progress.enhancementLevels[item.code] ?? 0;
                    const nextTier = getPowerRankingEquipmentEnhancementPlan(item.code).find(
                      (tier) => tier.level === currentLevel + 1
                    );

                    return (
                      <article key={item.code} className="powerRankingInventoryCard huntingEnhancementCard">
                        <div className="powerRankingInventoryVisual">
                          <img src={item.imageUrl} alt={item.name} className="powerRankingInventoryImage" />
                          <span className="powerRankingInventoryBadge">+{currentLevel}</span>
                        </div>
                        <div className="powerRankingInventoryBody">
                          <div className="powerRankingInventoryHeading">
                            <strong>{item.name}</strong>
                            <span>{item.effectSummary}</span>
                          </div>
                          <p>{item.description}</p>
                          {nextTier ? (
                            <div className="powerRankingInventoryTags">
                              <span className="powerRankingInventoryPill">다음 성공률 {Math.round(nextTier.successRate * 100)}%</span>
                              <span className="powerRankingInventoryPill">강화석 {nextTier.stoneCost}개</span>
                              <span className="powerRankingInventoryPill isMuted">실패 {nextTier.failurePenalty}</span>
                            </div>
                          ) : (
                            <div className="powerRankingInventoryTags">
                              <span className="powerRankingInventoryPill">최대 강화</span>
                            </div>
                          )}
                          <button
                            type="button"
                            className="powerRankingItemButton isPositive"
                            disabled={!nextTier}
                            onClick={() => handleEnhanceEquipment(item.code)}
                          >
                            {nextTier ? `+${nextTier.level} 강화 시도` : "강화 완료"}
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>

            <section className="powerRankingInventorySection huntingInfoSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Battle Formula</p>
                  <h2>전투력 계산</h2>
                </div>
                <p className="powerRankingSectionHint">
                  무기 고정 공격력을 기준으로 상의/하의는 합산 퍼센트 1회만 적용하고, 세트 효과는 별도 배수로 분리합니다.
                </p>
              </div>

              <div className="huntingInfoGrid">
                <article className="powerRankingDashboardCard">
                  <span>무기 공격력</span>
                  <strong>{profile?.weaponAttack ?? 0}</strong>
                  <p>무기 고정값을 크게 두어 의상 퍼센트가 전부를 먹지 않게 조정했습니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>의상 배수</span>
                  <strong>x{profile?.apparelMultiplier.toFixed(2) ?? "1.00"}</strong>
                  <p>상의/하의 퍼센트는 합산 후 한 번만 곱연산합니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>세트 배수</span>
                  <strong>x{profile?.setMultiplier.toFixed(2) ?? "1.00"}</strong>
                  <p>장착 부위 수에 따라 배수가 적용됩니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>기타 효과 배수</span>
                  <strong>x{profile?.effectMultiplier.toFixed(2) ?? "1.00"}</strong>
                  <p>머리/신발 유틸은 직접 전투보다 낮게 두고, 순수 전투 계열만 별도 반영합니다.</p>
                </article>
              </div>

              <div className="huntingInfoGrid">
                <article className="powerRankingDashboardCard">
                  <span>고정 보너스</span>
                  <strong>+{profile?.flatBonus ?? 0}</strong>
                  <p>장비와 강화에서 직접 더해지는 추가 전투력입니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>드랍 배수</span>
                  <strong>x{(profile?.dropRateMultiplier ?? 1).toFixed(2)}</strong>
                  <p>장갑 드랍 증가는 상한을 두고 압축 적용됩니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>카드 성장 배수</span>
                  <strong>x{cardGrowthMultiplier.toFixed(2)}</strong>
                  <p>머리 장비는 카드/자동 성장 효율 역할만 맡고 전투 기여는 상한으로 제한합니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>보스 추가 롤</span>
                  <strong>{Math.round((profile?.bossBonusRollRate ?? 0) * 100)}%</strong>
                  <p>보스 드랍은 확률 기반 추가 롤로 제한해 경제 붕괴를 막습니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>성장 진행도</span>
                  <strong>{progress.exp} / {nextExpRequired}</strong>
                  <p>처치 경험치가 누적되면 사냥 레벨이 오르고 공격력이 상승합니다.</p>
                </article>
              </div>

              <div className="huntingBreakdownCard">
                <strong>적용 효과</strong>
                <ul className="powerRankingDashboardList">
                  {(profile?.effectBreakdown.length ?? 0) > 0 ? (
                    profile?.effectBreakdown.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li>착용 장비가 없어 기본 전투력만 적용 중입니다.</li>
                  )}
                  <li>사냥 레벨 보너스 +{playerLevelAttackBonus}</li>
                  <li>장비 강화 보너스 +{enhancementBonus}</li>
                  <li>자동 성장 배수 x{autoGrowthMultiplier.toFixed(2)}</li>
                  <li>카드 성장 배수 x{cardGrowthMultiplier.toFixed(2)}</li>
                  <li>현재 총 드랍 배수 x{dropRateMultiplier.toFixed(2)}</li>
                  <li>현재 피로도 배수 x{fatigueDropMultiplier.toFixed(2)}</li>
                  <li>행운 스크롤 남은 처치 수 {dropBuffKills}</li>
                  <li>광폭 토닉 남은 공격 수 {attackBuffCharges}</li>
                </ul>
              </div>
            </section>

            <section className="powerRankingLogSection">
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
