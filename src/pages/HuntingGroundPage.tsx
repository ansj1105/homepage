import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../api/client";
import { useUserAuth } from "../auth/UserAuthContext";
import CommunityTopBar from "../components/CommunityTopBar";
import { getHuntingZone } from "../data/huntingZones";
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
import type {
  HuntingCombatClickResponse,
  HuntingCombatState,
  HuntingProfile,
  HuntingZoneDetail,
  HuntingZoneSummary
} from "../types";

const DAILY_CLICK_LIMIT = 300;

const updateProgressFromCombat = (
  current: HuntingProgress,
  result: HuntingCombatClickResponse
): HuntingProgress => {
  let nextLevel = current.level;
  let nextExp = current.exp + result.expGained;
  const nextMaterials = { ...current.materials };
  const nextConsumables = { ...current.consumables };

  result.rewards.forEach((reward) => {
    if (reward.kind === "material") {
      nextMaterials[reward.code as HuntingMaterialCode] += reward.quantity;
    } else {
      nextConsumables[reward.code as HuntingConsumableCode] += reward.quantity;
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
    selectedStageId: result.state.zoneId,
    selectedMonsterId: result.state.monster.id,
    todayClickCount: Math.min(DAILY_CLICK_LIMIT, current.todayClickCount + 1),
    totalDefeated: current.totalDefeated + (result.defeated ? 1 : 0),
    todayDefeatedCount: current.todayDefeatedCount + (result.defeated ? 1 : 0)
  };
};

const HuntingGroundPage = () => {
  const { user } = useUserAuth();
  const autoTimerRef = useRef<number | null>(null);
  const [progress, setProgress] = useState<HuntingProgress>(() => createDefaultProgress());
  const [profile, setProfile] = useState<HuntingProfile | null>(null);
  const [zones, setZones] = useState<HuntingZoneSummary[]>([]);
  const [zoneDetail, setZoneDetail] = useState<HuntingZoneDetail | null>(null);
  const [combatState, setCombatState] = useState<HuntingCombatState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [autoAttackEnabled, setAutoAttackEnabled] = useState(false);

  useEffect(() => {
    document.title = "동아리연합회 사냥터";
  }, []);

  const storageKey = useMemo(() => (user ? getHuntingStorageKey(user.id) : ""), [user]);

  useEffect(() => {
    if (!user || !storageKey) {
      setProgress(createDefaultProgress());
      return;
    }
    setProgress(loadHuntingProgress(storageKey));
  }, [storageKey, user]);

  useEffect(() => {
    if (!user || !storageKey) {
      return;
    }
    saveHuntingProgress(storageKey, progress);
  }, [progress, storageKey, user]);

  const selectedZoneId = zoneDetail?.id ?? progress.selectedStageId;
  const selectedMonsterId = combatState?.monster.id ?? progress.selectedMonsterId;

  const loadZoneBundle = async (zoneId: string, monsterId?: string) => {
    const [detail, state] = await Promise.all([
      apiClient.getHuntingZone(zoneId),
      apiClient.getCombatState(zoneId, monsterId)
    ]);
    setZoneDetail(detail);
    setCombatState(state);
  };

  const refreshPage = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const savedProgress = storageKey ? loadHuntingProgress(storageKey) : progress;
      const [nextProfile, nextZones] = await Promise.all([
        apiClient.getHuntingProfile(),
        apiClient.getHuntingZones()
      ]);
      setProfile(nextProfile);
      setZones(nextZones);
      setProgress(savedProgress);
      await loadZoneBundle(savedProgress.selectedStageId, savedProgress.selectedMonsterId);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "사냥터 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshPage();
  }, [storageKey, user]);

  const currentZone = useMemo(
    () => zones.find((zone) => zone.id === selectedZoneId) ?? getHuntingZone(selectedZoneId),
    [selectedZoneId, zones]
  );
  const selectedMonster = combatState?.monster ?? null;
  const remainingClicks = combatState?.remainingClicks ?? Math.max(0, DAILY_CLICK_LIMIT - progress.todayClickCount);
  const estimatedDamage = combatState?.estimatedDamage ?? Math.max(1, Math.floor((profile?.battlePower ?? 0) * 0.98));

  const syncZone = async (zoneId: string, monsterId?: string) => {
    try {
      await loadZoneBundle(zoneId, monsterId);
      setProgress((current) => ({
        ...current,
        selectedStageId: zoneId,
        selectedMonsterId: monsterId ?? getHuntingZone(zoneId)?.monsters[0]?.id ?? current.selectedMonsterId
      }));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "사냥터를 이동하지 못했습니다.");
    }
  };

  const handleStageSelect = async (zoneId: string) => {
    const stage = zones.find((zone) => zone.id === zoneId);
    if (!stage) {
      return;
    }
    if (progress.level < stage.unlockLevel) {
      setErrorMessage(`${stage.name}은 레벨 ${stage.unlockLevel}부터 입장할 수 있습니다.`);
      return;
    }
    await syncZone(zoneId);
  };

  const handleMonsterFocus = async (monsterId: string) => {
    await syncZone(selectedZoneId, monsterId);
  };

  const handleAttack = async () => {
    if (!selectedZoneId || !selectedMonsterId || isAttacking) {
      return;
    }
    if (progress.endurance < 1) {
      setErrorMessage("지구력이 부족합니다. 포션을 사용하거나 잠시 회복을 기다리세요.");
      return;
    }

    setIsAttacking(true);
    try {
      const result = await apiClient.clickCombat({
        zoneId: selectedZoneId,
        monsterId: selectedMonsterId
      });
      setCombatState(result.state);
      setProgress((current) => ({
        ...updateProgressFromCombat(current, result),
        endurance: Math.max(0, current.endurance - 1)
      }));
      if (result.rewards.length > 0) {
        window.alert(
          result.rewards.map((reward) => `${reward.label} x${reward.quantity}`).join(", ")
        );
      }
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "전투를 진행하지 못했습니다.");
      if (autoAttackEnabled) {
        setAutoAttackEnabled(false);
      }
    } finally {
      setIsAttacking(false);
    }
  };

  const handleUseConsumable = async (code: HuntingConsumableCode) => {
    if (progress.consumables[code] <= 0) {
      setErrorMessage("보유한 소비 아이템이 없습니다.");
      return;
    }

    try {
      const nextState = await apiClient.useCombatConsumable({ consumableCode: code });
      setCombatState(nextState);
      setProgress((current) => ({
        ...current,
        endurance:
          code === "healing-potion"
            ? Math.min(MAX_ENDURANCE, current.endurance + 35)
            : current.endurance,
        consumables: {
          ...current.consumables,
          [code]: Math.max(0, current.consumables[code] - 1)
        }
      }));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "소비 아이템을 사용하지 못했습니다.");
    }
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
    if (autoTimerRef.current) {
      window.clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    if (!autoAttackEnabled || !selectedMonster || !user) {
      return;
    }

    autoTimerRef.current = window.setInterval(() => {
      void handleAttack();
    }, 1600);

    return () => {
      if (autoTimerRef.current) {
        window.clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [autoAttackEnabled, selectedMonsterId, user, progress.endurance, isAttacking]);

  const zoneDropPreview = useMemo(() => {
    if (!zoneDetail) {
      return [];
    }
    return Array.from(
      new Map(
        zoneDetail.monsters
          .flatMap((monster) => monster.dropTable)
          .map((drop) => [drop.code, drop])
      ).values()
    );
  }, [zoneDetail]);

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Hunting Flow</p>
            <h1>사냥터</h1>
            <p className="powerRankingLead">
              지역 선택에서 권장 전투력과 드랍을 보고, 전투 화면에서 클릭 전투와 소비 아이템을 바로 이어서 쓰는 구조로 정리했습니다.
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
                <strong>{profile?.battlePower ?? 0}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>남은 클릭</span>
                <strong>{remainingClicks}</strong>
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
            <section className="powerRankingDashboardSection huntingOverviewSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">My Status</p>
                  <h2>내 정보</h2>
                </div>
                <p className="powerRankingSectionHint">현재 캐릭터 상태와 즉시 전투에 들어가는 값을 먼저 보여줍니다.</p>
              </div>

              <div className="powerRankingDashboardGrid huntingOverviewGrid">
                <article className="powerRankingDashboardCard">
                  <span>현재 지역</span>
                  <strong>{currentZone?.name ?? "-"}</strong>
                  <p>{currentZone?.chapterLabel ?? "사냥터 미선택"}</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>현재 대상</span>
                  <strong>{selectedMonster?.name ?? "-"}</strong>
                  <p>{selectedMonster?.rarityLabel ?? "대상 없음"}</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>예상 클릭 데미지</span>
                  <strong>{estimatedDamage}</strong>
                  <p>현재 서버 전투 계산 기준 예상값입니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>치명타 확률</span>
                  <strong>{Math.round((combatState?.critRate ?? 0) * 100)}%</strong>
                  <p>장비 전투력과 추천 누적 수치가 반영됩니다.</p>
                </article>
              </div>
            </section>

            <section className="powerRankingBoardSection huntingStageSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Zone Select</p>
                  <h2>사냥터 선택</h2>
                </div>
                <p className="powerRankingSectionHint">지역, 권장 전투력, 몬스터 종류, 드랍 예상 아이템을 먼저 보고 진입합니다.</p>
              </div>

              <div className="huntingStageSelector">
                {zones.map((zone) => {
                  const isUnlocked = progress.level >= zone.unlockLevel;
                  const isActive = zone.id === selectedZoneId;
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      className={`huntingStageChip ${isActive ? "isActive" : ""}`}
                      disabled={!isUnlocked}
                      onClick={() => void handleStageSelect(zone.id)}
                    >
                      <strong>{zone.badge}</strong>
                      <span>{zone.name}</span>
                      <small>{zone.chapterLabel}</small>
                      <small>권장 전투력 {zone.recommendedPower}</small>
                      <small>몬스터: {zone.monsterNames.join(", ")}</small>
                      <small>드랍: {zone.previewDrops.join(", ")}</small>
                    </button>
                  );
                })}
              </div>

              {zoneDetail ? (
                <div className="huntingMonsterDetailPanel">
                  <div className="huntingMonsterDetailHead">
                    <div>
                      <p className="powerRankingEyebrow">{zoneDetail.badge}</p>
                      <h3>{zoneDetail.name}</h3>
                      <p className="huntingMonsterDetailFlavor">{zoneDetail.description}</p>
                    </div>
                    <div className="powerRankingInventoryTags">
                      <span className="powerRankingInventoryPill">권장 {zoneDetail.recommendedPower}</span>
                      <span className="powerRankingInventoryPill isMuted">클릭 {zoneDetail.clickCost} 소모</span>
                    </div>
                  </div>

                  <div className="huntingMonsterGrid">
                    {zoneDetail.monsters.map((monster) => {
                      const isSelected = monster.id === selectedMonsterId;
                      return (
                        <article key={monster.id} className={`huntingMonsterCard ${isSelected ? "isActive" : ""}`}>
                          <div className="huntingMonsterVisual">
                            <img src={monster.imageUrl} alt={monster.name} className="huntingMonsterImage" />
                          </div>
                          <span className="huntingMonsterBadge">{monster.rarityLabel}</span>
                          <strong>{monster.name}</strong>
                          <p>{monster.flavor}</p>
                          <div className="huntingMonsterStat">
                            <span>HP {monster.maxHp}</span>
                            <span>DEF {monster.defense}</span>
                          </div>
                          <small>{monster.rewardSummary}</small>
                          <div className="huntingMonsterActions">
                            <button
                              type="button"
                              className="powerRankingItemButton"
                              onClick={() => void handleMonsterFocus(monster.id)}
                            >
                              전투 대상 지정
                            </button>
                            <button
                              type="button"
                              className="powerRankingItemButton isPositive"
                              onClick={() => void syncZone(zoneDetail.id, monster.id)}
                            >
                              전투 화면 열기
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </section>

            {combatState ? (
              <section className="powerRankingBoardSection">
                <div className="powerRankingSectionHead">
                  <div>
                    <p className="powerRankingSectionEyebrow">Combat Screen</p>
                    <h2>전투 화면</h2>
                  </div>
                  <p className="powerRankingSectionHint">클릭 1회가 행동 1회입니다. 남은 클릭과 실시간 드랍 로그를 같이 확인할 수 있습니다.</p>
                </div>

                <div className="huntingCombatLayout">
                  <article className="huntingCombatPanel">
                    <div className="huntingCombatVisual">
                      <img src={combatState.monster.imageUrl} alt={combatState.monster.name} className="huntingMonsterDetailImage" />
                    </div>
                    <div className="huntingCombatInfo">
                      <p className="powerRankingEyebrow">{combatState.zoneName}</p>
                      <h3>{combatState.monster.name}</h3>
                      <p>{combatState.monster.patternLabel}</p>
                      <div className="huntingMonsterHpBar">
                        <div
                          className="huntingMonsterHpFill"
                          style={{ width: `${Math.max(0, (combatState.monster.currentHp / combatState.monster.maxHp) * 100)}%` }}
                        />
                      </div>
                      <div className="huntingCombatMeta">
                        <span>HP {combatState.monster.currentHp} / {combatState.monster.maxHp}</span>
                        <span>예상 데미지 {combatState.estimatedDamage}</span>
                        <span>남은 클릭 {combatState.remainingClicks}</span>
                      </div>
                      <div className="huntingCombatActions">
                        <button type="button" className="powerRankingItemButton isPositive" disabled={isAttacking} onClick={() => void handleAttack()}>
                          {isAttacking ? "공격 중..." : "클릭 공격"}
                        </button>
                        <button
                          type="button"
                          className="powerRankingItemButton"
                          onClick={() => setAutoAttackEnabled((current) => !current)}
                        >
                          {autoAttackEnabled ? "자동 사냥 중지" : "자동 사냥 시작"}
                        </button>
                      </div>
                    </div>
                  </article>

                  <article className="huntingCombatSide">
                    <div className="powerRankingLogCard">
                      <strong>소비 아이템</strong>
                      <ul className="huntingResourceList">
                        {(Object.keys(consumableMeta) as HuntingConsumableCode[]).map((code) => (
                          <li key={code}>
                            <div>
                              <strong>{consumableMeta[code].name}</strong>
                              <p>{consumableMeta[code].description}</p>
                            </div>
                            <div className="huntingConsumableAction">
                              <span>{progress.consumables[code]}개</span>
                              <button
                                type="button"
                                className="powerRankingItemButton"
                                disabled={progress.consumables[code] <= 0}
                                onClick={() => void handleUseConsumable(code)}
                              >
                                사용
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="powerRankingLogCard">
                      <strong>드랍 로그</strong>
                      <ul className="powerRankingLogList">
                        {combatState.recentDrops.length > 0 ? (
                          combatState.recentDrops.map((reward, index) => (
                            <li key={`${reward.code}-${index}`}>
                              <p>{reward.label} x{reward.quantity}</p>
                            </li>
                          ))
                        ) : (
                          <li>
                            <p>최근 드랍이 아직 없습니다.</p>
                          </li>
                        )}
                      </ul>
                    </div>
                  </article>
                </div>

                <div className="huntingMonsterDetailGrid">
                  <article className="powerRankingLogCard">
                    <strong>전투 로그</strong>
                    <ul className="powerRankingLogList">
                      {combatState.logs.length > 0 ? (
                        combatState.logs.map((log, index) => (
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
                  </article>

                  <article className="powerRankingLogCard">
                    <strong>현재 지역 드랍 테이블</strong>
                    <ul className="huntingDropTable">
                      {zoneDropPreview.map((drop) => (
                        <li key={`${drop.code}-${drop.kind}`}>
                          <div>
                            <strong>{drop.label}</strong>
                            <p>{drop.kind === "material" ? "재료" : "소비 아이템"}</p>
                          </div>
                          <span>{Math.round(drop.rate * 100)}%</span>
                          <em>{drop.min}~{drop.max}개</em>
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
              </section>
            ) : null}

            <section className="powerRankingLogSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Local Inventory</p>
                  <h2>사냥 보유 재화</h2>
                </div>
              </div>
              <div className="huntingResourceGrid">
                {(Object.keys(materialMeta) as HuntingMaterialCode[]).map((code) => (
                  <article key={code} className="powerRankingLogCard">
                    <strong>{materialMeta[code].name}</strong>
                    <p>{materialMeta[code].description}</p>
                    <span className="powerRankingInventoryPill">{progress.materials[code]}개</span>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HuntingGroundPage;
