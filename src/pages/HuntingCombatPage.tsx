import { useEffect } from "react";
import { Link } from "react-router-dom";
import CommunityTopBar from "../components/CommunityTopBar";
import { consumableMeta, getExpToNextLevel, materialMeta, MAX_ENDURANCE, type HuntingConsumableCode, type HuntingMaterialCode } from "../features/huntingProgress";
import { useHuntingGame } from "../features/hunting/useHuntingGame";

const HuntingCombatPage = () => {
  const {
    user,
    progress,
    profile,
    combatState,
    notifications,
    currentZone,
    zoneDetail,
    selectedMonsterId,
    isLoading,
    isAttacking,
    errorMessage,
    autoAttackEnabled,
    remainingClicks,
    zoneDropPreview,
    focusMonster,
    setAutoAttackEnabled,
    attack,
    useConsumable
  } = useHuntingGame();

  useEffect(() => {
    document.title = "전투 화면";
  }, []);

  const expToNextLevel = getExpToNextLevel(progress.level);
  const expProgressPercent = Math.min(100, Math.round((progress.exp / expToNextLevel) * 100));

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Combat Screen</p>
            <h1>전투 화면</h1>
            <p className="powerRankingLead">클릭 전투, 소비 아이템 사용, 실시간 드랍 로그를 전투 전용 화면으로 분리했습니다.</p>
          </div>

          <div className="powerRankingControlPanel">
            <div className="powerRankingStats">
              <div className="powerRankingStatCard">
                <span>사냥 레벨</span>
                <strong>Lv. {progress.level}</strong>
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
                <span>피로도</span>
                <strong>{progress.endurance} / {MAX_ENDURANCE}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>현재 지역</span>
                <strong>{currentZone?.name ?? "-"}</strong>
              </div>
            </div>
          </div>
        </header>

        {notifications.length > 0 ? (
          <div className="powerRankingNotificationStack">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`powerRankingNotificationCard ${notification.tone === "reward" ? "isReward" : "isInfo"}`}
              >
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
              </article>
            ))}
          </div>
        ) : null}

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

        {!user ? (
          <div className="powerRankingLoading">회원가입 이후 이용가능합니다.</div>
        ) : isLoading ? (
          <div className="powerRankingLoading">전투 정보를 불러오는 중입니다.</div>
        ) : !combatState ? (
          <div className="powerRankingLoading">전투 대상이 없습니다. <Link to="/dongyeon-hunting-zones">사냥터 선택</Link>으로 이동하세요.</div>
        ) : (
          <>
            <section className="powerRankingBoardSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">{combatState.zoneName}</p>
                  <h2>{combatState.monster.name}</h2>
                </div>
                <p className="powerRankingSectionHint">클릭 1회 = 행동 1회입니다. 몬스터 변경도 이 화면에서 바로 할 수 있게 정리했습니다.</p>
              </div>

              <div className="huntingCombatLayout">
                <article className="huntingCombatPanel">
                  <div className="huntingCombatVisual">
                    <img src={combatState.monster.imageUrl} alt={combatState.monster.name} className="huntingMonsterDetailImage" />
                  </div>
                  <div className="huntingCombatInfo">
                    <p>{combatState.monster.patternLabel}</p>
                    <div className="huntingCombatMiniStats">
                      <div className="huntingCombatMiniStat">
                        <span>현재 레벨</span>
                        <strong>Lv. {progress.level}</strong>
                      </div>
                      <div className="huntingCombatMiniStat">
                        <span>처치 경험치</span>
                        <strong>+{combatState.monster.expReward}</strong>
                      </div>
                      <div className="huntingCombatMiniStat">
                        <span>남은 클릭</span>
                        <strong>{remainingClicks}</strong>
                      </div>
                    </div>
                    <div className="huntingCombatProgress">
                      <div className="huntingCombatProgressHead">
                        <strong>경험치</strong>
                        <span>{progress.exp} / {expToNextLevel}</span>
                      </div>
                      <div className="huntingCombatProgressBar">
                        <div className="huntingCombatProgressFill" style={{ width: `${expProgressPercent}%` }} />
                      </div>
                    </div>
                    <div className="huntingMonsterHpBar">
                      <div
                        className="huntingMonsterHpFill"
                        style={{ width: `${Math.max(0, (combatState.monster.currentHp / combatState.monster.maxHp) * 100)}%` }}
                      />
                    </div>
                      <div className="huntingCombatMeta">
                        <span>HP {combatState.monster.currentHp} / {combatState.monster.maxHp}</span>
                        <span>예상 데미지 {combatState.estimatedDamage}</span>
                        <span>치명타 {Math.round(combatState.critRate * 100)}%</span>
                        <span>클릭 소모 {combatState.clickCost}</span>
                        <span>피로도 소모 {combatState.clickCost}</span>
                        {combatState.remainingBossEntries !== undefined ? (
                          <span>보스 입장 잔여 {combatState.remainingBossEntries}</span>
                        ) : null}
                      </div>
                    <div className="huntingCombatActions">
                      <button type="button" className="powerRankingItemButton isPositive" disabled={isAttacking} onClick={() => void attack()}>
                        {isAttacking ? "공격 중..." : "클릭 공격"}
                      </button>
                      <button
                        type="button"
                        className="powerRankingItemButton"
                        disabled={combatState.monster.isBoss}
                        onClick={() => setAutoAttackEnabled(!autoAttackEnabled)}
                      >
                        {combatState.monster.isBoss ? "보스는 수동 전투 전용" : autoAttackEnabled ? "자동 사냥 중지" : "자동 사냥 시작"}
                      </button>
                      <Link to="/dongyeon-hunting-zones" className="powerRankingItemButton">
                        사냥터 변경
                      </Link>
                    </div>
                    {zoneDetail ? (
                      <div className="huntingMonsterSwitchGrid">
                        {zoneDetail.monsters.map((monster) => (
                          <button
                            key={monster.id}
                            type="button"
                            className={`huntingMonsterSwitchButton ${monster.id === selectedMonsterId ? "isActive" : ""}`.trim()}
                            onClick={() => void focusMonster(monster.id)}
                          >
                            <strong>{monster.name}</strong>
                            <span>{monster.typeLabel}</span>
                            <small>처치 경험치 +{monster.expReward}</small>
                          </button>
                        ))}
                      </div>
                    ) : null}
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
                              onClick={() => void useConsumable(code)}
                            >
                              사용
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="powerRankingLogCard">
                    <strong>최근 드랍</strong>
                    <ul className="powerRankingLogList">
                      {combatState.recentDrops.length > 0 ? (
                        combatState.recentDrops.map((reward, index) => (
                          <li key={`${reward.code}-${index}`}>
                            <p>{reward.label} x{reward.quantity}</p>
                          </li>
                        ))
                      ) : (
                        <li><p>최근 드랍이 아직 없습니다.</p></li>
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
                      <li><p>첫 공격을 시작해 보세요.</p></li>
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

export default HuntingCombatPage;
