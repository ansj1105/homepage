import { useEffect, useMemo, useState } from "react";
import CommunityTopBar from "../components/CommunityTopBar";
import HuntingSubNav from "../components/HuntingSubNav";
import { apiClient } from "../api/client";
import { useUserAuth } from "../auth/UserAuthContext";
import { getHuntingLevelBenefits } from "../data/huntingLevelBenefits";
import { getRaidBossById, huntingRaidBosses } from "../data/huntingRaids";
import { MAX_ENDURANCE, type HuntingProgress } from "../features/huntingProgress";
import { useSyncedHuntingProgress } from "../features/hunting/useSyncedHuntingProgress";
import type { HuntingProfile } from "../types";

type RaidNotification = {
  id: string;
  title: string;
  body: string;
};

const computeRaidBossMaxHp = (battlePower: number, hpMultiplier: number, hpFlatBonus: number) =>
  Math.max(9000, Math.floor(battlePower * hpMultiplier + hpFlatBonus));

const HuntingRaidPage = () => {
  const { user } = useUserAuth();
  const { progress, setProgress, isHydrated } = useSyncedHuntingProgress(user?.id);
  const [profile, setProfile] = useState<HuntingProfile | null>(null);
  const [selectedRaidBossId, setSelectedRaidBossId] = useState(huntingRaidBosses[0].id);
  const [currentHp, setCurrentHp] = useState(0);
  const [raidLog, setRaidLog] = useState<string[]>([]);
  const [raidLine, setRaidLine] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notifications, setNotifications] = useState<RaidNotification[]>([]);

  const selectedBoss = useMemo(() => getRaidBossById(selectedRaidBossId) ?? huntingRaidBosses[0], [selectedRaidBossId]);
  const levelBenefits = useMemo(() => getHuntingLevelBenefits(progress?.level ?? 1), [progress?.level]);

  useEffect(() => {
    document.title = "보스 레이드";
  }, []);

  useEffect(() => {
    if (!user || !progress) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    apiClient
      .getHuntingProfile(progress.selectedCardTargetId || undefined, progress.selectedCardTargetId ? (progress.cardLevels[progress.selectedCardTargetId] ?? 1) : 1)
      .then((payload) => {
        setProfile(payload);
        setErrorMessage("");
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "레이드 정보를 불러오지 못했습니다.");
      })
      .finally(() => setIsLoading(false));
  }, [progress, user]);

  useEffect(() => {
    if (!profile) {
      return;
    }
    const nextHp = computeRaidBossMaxHp(profile.battlePower, selectedBoss.hpMultiplier, selectedBoss.hpFlatBonus);
    setCurrentHp(nextHp);
    setRaidLine(selectedBoss.introLine);
    setRaidLog([`${selectedBoss.name} 입장 · ${selectedBoss.title}`]);
  }, [profile, selectedBoss]);

  const pushNotification = (title: string, body: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setNotifications((current) => [...current, { id, title, body }].slice(-3));
    window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id));
    }, 2600);
  };

  const handleSelectBoss = (bossId: string) => {
    setSelectedRaidBossId(bossId);
  };

  const handleAttack = () => {
    if (!progress || !profile || isAttacking) {
      return;
    }
    setIsAttacking(true);
    const crit = Math.random() < Math.min(0.32, 0.08 + profile.recommendationCoefficient * 0.0015);
    const damageBase = Math.max(1, Math.floor(profile.battlePower * (crit ? 1.52 : 1.06) - selectedBoss.defense));
    const damage = Math.max(1, damageBase);
    const nextHp = Math.max(0, currentHp - damage);
    const maxHp = computeRaidBossMaxHp(profile.battlePower, selectedBoss.hpMultiplier, selectedBoss.hpFlatBonus);

    setCurrentHp(nextHp);
    setRaidLog((current) => [`${selectedBoss.name}에게 ${damage} 피해${crit ? " · 치명타" : ""}`, ...current].slice(0, 12));

    if (nextHp <= 0) {
      setRaidLine(selectedBoss.defeatLine);
      setProgress((current) => {
        if (!current) {
          return current;
        }
        const nextMaterials = { ...current.materials };
        const nextConsumables = { ...current.consumables };
        const nextMiscItems = { ...current.miscItems };
        selectedBoss.rewards.forEach((reward) => {
          if (reward.kind === "material") {
            nextMaterials[reward.code] += reward.amount;
          } else if (reward.kind === "consumable") {
            nextConsumables[reward.code] += reward.amount;
          } else {
            nextMiscItems[reward.code] += reward.amount;
          }
        });
        return {
          ...current,
          totalDefeated: current.totalDefeated + 1,
          totalBossDefeated: current.totalBossDefeated + 1,
          weeklyBossDefeatedCount: current.weeklyBossDefeatedCount + 1,
          materials: nextMaterials,
          consumables: nextConsumables,
          miscItems: nextMiscItems
        } as HuntingProgress;
      });
      pushNotification("레이드 보상 획득", `${selectedBoss.name} 토벌 완료 · 후한 보상이 인벤토리에 지급되었습니다.`);
      window.setTimeout(() => {
        setCurrentHp(maxHp);
        setRaidLine(selectedBoss.introLine);
        setRaidLog((current) => [`${selectedBoss.name}가 다시 전장에 등장했습니다.`, ...current].slice(0, 12));
      }, 400);
    } else if (nextHp < maxHp * 0.35) {
      setRaidLine(selectedBoss.tauntLines[2] ?? selectedBoss.tauntLines[0]);
    } else if (nextHp < maxHp * 0.7) {
      setRaidLine(selectedBoss.tauntLines[1] ?? selectedBoss.tauntLines[0]);
    } else {
      setRaidLine(selectedBoss.tauntLines[0] ?? selectedBoss.introLine);
    }

    window.setTimeout(() => setIsAttacking(false), 180);
  };

  const raidHpPercent = profile ? Math.max(0, Math.round((currentHp / computeRaidBossMaxHp(profile.battlePower, selectedBoss.hpMultiplier, selectedBoss.hpFlatBonus)) * 100)) : 0;

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <HuntingSubNav />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Boss Raid</p>
            <h1>보스 레이드</h1>
            <p className="powerRankingLead">레이드 보스는 자동사냥 없이 직접 클릭으로만 처치합니다. 대신 우리 서비스 기준으로 훨씬 후한 보상을 줍니다.</p>
          </div>

          <div className="powerRankingControlPanel">
            <div className="powerRankingStats">
              <div className="powerRankingStatCard">
                <span>현재 레벨</span>
                <strong>{progress?.level ?? 1}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>전투력</span>
                <strong>{profile?.battlePower ?? 0}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>레벨 혜택</span>
                <strong>+{levelBenefits.battlePowerBonus}</strong>
                <p>전투력 보너스</p>
              </div>
              <div className="powerRankingStatCard">
                <span>피로도</span>
                <strong>{progress?.endurance ?? 0} / {MAX_ENDURANCE}</strong>
              </div>
            </div>
          </div>
        </header>

        {notifications.length > 0 ? (
          <div className="powerRankingNotificationStack">
            {notifications.map((notification) => (
              <article key={notification.id} className="powerRankingNotificationCard isReward">
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
              </article>
            ))}
          </div>
        ) : null}

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
        {!user ? (
          <div className="powerRankingLoading">회원가입 이후 이용가능합니다.</div>
        ) : !isHydrated || isLoading || !progress || !profile ? (
          <div className="powerRankingLoading">레이드 정보를 불러오는 중입니다.</div>
        ) : (
          <>
            <section className="powerRankingBoardSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Raid Bosses</p>
                  <h2>레이드 보스 선택</h2>
                </div>
                <p className="powerRankingSectionHint">전투력 기준으로 체력이 크게 산정되며, 보스는 전부 수동 클릭으로만 잡을 수 있습니다.</p>
              </div>

              <div className="huntingRaidBossGrid">
                {huntingRaidBosses.map((boss) => {
                  const unlocked = progress.level >= boss.unlockLevel;
                  return (
                    <button
                      key={boss.id}
                      type="button"
                      className={`huntingRaidBossCard ${selectedBoss.id === boss.id ? "isActive" : ""}`.trim()}
                      disabled={!unlocked}
                      onClick={() => handleSelectBoss(boss.id)}
                    >
                      <img src={boss.imageUrl} alt={boss.name} className="huntingRaidBossImage" />
                      <strong>{boss.name}</strong>
                      <span>{boss.title}</span>
                      <small>{unlocked ? `권장 전투력 ${boss.recommendedPower}` : `Lv.${boss.unlockLevel} 필요`}</small>
                      <p>{boss.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="powerRankingBoardSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">{selectedBoss.title}</p>
                  <h2>{selectedBoss.name}</h2>
                </div>
                <p className="powerRankingSectionHint">{selectedBoss.flavor}</p>
              </div>

              <div className="huntingRaidArena">
                <article className="huntingRaidStage">
                  <div className="huntingRaidVisual">
                    <img src={selectedBoss.imageUrl} alt={selectedBoss.name} className="huntingRaidStageImage" />
                  </div>
                  <div className="huntingRaidSpeechBubble">
                    <strong>{selectedBoss.name}</strong>
                    <p>{raidLine}</p>
                  </div>
                  <div className="huntingMonsterHpBar isRaid">
                    <div className="huntingMonsterHpFill isRaid" style={{ width: `${raidHpPercent}%` }} />
                  </div>
                  <div className="huntingCombatMeta">
                    <span>HP {currentHp} / {computeRaidBossMaxHp(profile.battlePower, selectedBoss.hpMultiplier, selectedBoss.hpFlatBonus)}</span>
                    <span>방어력 {selectedBoss.defense}</span>
                    <span>권장 전투력 {selectedBoss.recommendedPower}</span>
                  </div>
                  <div className="huntingCombatActions">
                    <button type="button" className="powerRankingItemButton isPositive" disabled={isAttacking} onClick={handleAttack}>
                      {isAttacking ? "공격 중..." : "보스 직접 공격"}
                    </button>
                  </div>
                </article>

                <article className="huntingRaidRewardPanel">
                  <div className="powerRankingLogCard">
                    <strong>레이드 보상</strong>
                    <ul className="huntingDropTable">
                      {selectedBoss.rewards.map((reward) => (
                        <li key={`${selectedBoss.id}-${reward.code}`}>
                          <div>
                            <strong>{reward.label}</strong>
                            <p>{reward.kind === "material" ? "재화" : reward.kind === "consumable" ? "소비 아이템" : "기타"}</p>
                          </div>
                          <span>x{reward.amount}</span>
                          <em>확정 보상</em>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="powerRankingLogCard">
                    <strong>전투 로그</strong>
                    <ul className="powerRankingLogList">
                      {raidLog.map((log, index) => (
                        <li key={`${log}-${index}`}>
                          <p>{log}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HuntingRaidPage;
