import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import { useUserAuth } from "../auth/UserAuthContext";
import CommunityTopBar from "../components/CommunityTopBar";
import type { HuntingProfile, PowerRankingEquipmentCode } from "../types";

type StageMonster = {
  id: string;
  name: string;
  maxHp: number;
  reward: string;
  flavor: string;
};

type StageMonsterState = StageMonster & {
  currentHp: number;
  defeatedCount: number;
};

const stageOneMonsters: StageMonster[] = [
  {
    id: "slime-chairman",
    name: "슬라임 회장",
    maxHp: 180,
    reward: "동연 코인 조각",
    flavor: "초반부에 가장 많이 맞아주는 연습용 몬스터입니다."
  },
  {
    id: "poster-goblin",
    name: "포스터 고블린",
    maxHp: 260,
    reward: "홍보 전단 묶음",
    flavor: "게시판 어딘가에서 튀어나온 듯한 몬스터입니다."
  },
  {
    id: "canteen-wolf",
    name: "학식 늑대",
    maxHp: 340,
    reward: "야식 교환권",
    flavor: "스테이지 1 보스. 전투력이 낮으면 오래 걸립니다."
  }
];

const createStageState = (): StageMonsterState[] =>
  stageOneMonsters.map((monster) => ({
    ...monster,
    currentHp: monster.maxHp,
    defeatedCount: 0
  }));

const HuntingGroundPage = () => {
  const { user } = useUserAuth();
  const [profile, setProfile] = useState<HuntingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [stageMonsters, setStageMonsters] = useState<StageMonsterState[]>(() => createStageState());
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [equipSubmittingCode, setEquipSubmittingCode] = useState<string | null>(null);

  useEffect(() => {
    document.title = "동아리연합회 사냥터";
  }, []);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const nextProfile = await apiClient.getHuntingProfile();
      setProfile(nextProfile);
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

  const totalDefeated = useMemo(
    () => stageMonsters.reduce((sum, monster) => sum + monster.defeatedCount, 0),
    [stageMonsters]
  );

  const handleAttackMonster = (monsterId: string) => {
    if (!profile) {
      setErrorMessage("회원가입 이후 이용가능합니다.");
      return;
    }

    setStageMonsters((current) =>
      current.map((monster) => {
        if (monster.id !== monsterId) {
          return monster;
        }

        const damage = Math.max(
          1,
          Math.floor(profile.battlePower * (0.9 + Math.random() * 0.2))
        );
        const nextHp = monster.currentHp - damage;

        if (nextHp <= 0) {
          setCombatLog((logs) => [
            `${monster.name} 처치! ${monster.reward} 획득 가능`,
            `${monster.name}에게 ${damage} 데미지`,
            ...logs
          ].slice(0, 8));

          return {
            ...monster,
            currentHp: monster.maxHp,
            defeatedCount: monster.defeatedCount + 1
          };
        }

        setCombatLog((logs) => [`${monster.name}에게 ${damage} 데미지`, ...logs].slice(0, 8));

        return {
          ...monster,
          currentHp: nextHp
        };
      })
    );
  };

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
            <p className="powerRankingEyebrow">Hunting Ground</p>
            <h1>사냥터</h1>
            <p className="powerRankingLead">
              스테이지 1 몬스터를 클릭해 사냥할 수 있습니다. 추천 누적 계수와 장비 세트 효과로 전투력이 계산됩니다.
            </p>
          </div>

          <div className="powerRankingControlPanel huntingPowerPanel">
            <div className="powerRankingStats huntingPowerStats">
              <div className="powerRankingStatCard">
                <span>추천 계수</span>
                <strong>{profile?.recommendationCoefficient ?? 0}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>전투력</span>
                <strong>{profile?.battlePower ?? 0}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>누적 처치</span>
                <strong>{totalDefeated}</strong>
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
            <section className="powerRankingBoardSection huntingStageSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Stage 1</p>
                  <h2>초급 사냥터</h2>
                </div>
                <p className="powerRankingSectionHint">
                  몬스터 카드를 클릭하면 현재 전투력 기준으로 즉시 공격합니다.
                </p>
              </div>

              <div className="huntingMonsterGrid">
                {stageMonsters.map((monster) => {
                  const hpPercent = Math.max(0, (monster.currentHp / monster.maxHp) * 100);
                  return (
                    <button
                      key={monster.id}
                      type="button"
                      className="huntingMonsterCard"
                      onClick={() => handleAttackMonster(monster.id)}
                    >
                      <span className="huntingMonsterBadge">STAGE 1</span>
                      <strong>{monster.name}</strong>
                      <p>{monster.flavor}</p>
                      <div className="huntingMonsterStat">
                        <span>HP {monster.currentHp} / {monster.maxHp}</span>
                        <span>처치 {monster.defeatedCount}</span>
                      </div>
                      <div className="huntingMonsterHpBar">
                        <div className="huntingMonsterHpFill" style={{ width: `${hpPercent}%` }} />
                      </div>
                      <small>드롭: {monster.reward}</small>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="powerRankingInventorySection huntingInfoSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Battle Formula</p>
                  <h2>전투력 계산</h2>
                </div>
                <p className="powerRankingSectionHint">
                  추천 계수 x 장비 세트 배수 x 장비 효과 배수 + 고정 보너스
                </p>
              </div>

              <div className="huntingInfoGrid">
                <article className="powerRankingDashboardCard">
                  <span>세트 배수</span>
                  <strong>x{profile?.setMultiplier.toFixed(2) ?? "1.00"}</strong>
                  <p>장착 부위 수에 따라 배수가 적용됩니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>효과 배수</span>
                  <strong>x{profile?.effectMultiplier.toFixed(2) ?? "1.00"}</strong>
                  <p>착용 장비 효과를 전부 합산한 전투 배수입니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>고정 보너스</span>
                  <strong>+{profile?.flatBonus ?? 0}</strong>
                  <p>장비에서 직접 더해지는 추가 전투력입니다.</p>
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
                  {combatLog.length > 0 ? combatLog.map((log, index) => <li key={`${log}-${index}`}><p>{log}</p></li>) : <li><p>첫 공격을 시작해 보세요.</p></li>}
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
