import { useEffect } from "react";
import { Link } from "react-router-dom";
import CommunityTopBar from "../components/CommunityTopBar";
import { useHuntingGame } from "../features/hunting/useHuntingGame";

const HuntingZoneSelectPage = () => {
  const { user, progress, zones, zoneDetail, profile, isLoading, errorMessage, selectedZoneId, selectedMonsterId, selectZone, focusMonster } =
    useHuntingGame();

  useEffect(() => {
    document.title = "사냥터 선택";
  }, []);

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Zone Select</p>
            <h1>사냥터 선택</h1>
            <p className="powerRankingLead">지역, 권장 전투력, 몬스터 종류, 예상 드랍을 먼저 보고 전투로 넘어갑니다.</p>
          </div>

          <div className="powerRankingControlPanel">
            <div className="powerRankingStats">
              <div className="powerRankingStatCard">
                <span>사냥 레벨</span>
                <strong>{progress.level}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>전투력</span>
                <strong>{profile?.battlePower ?? 0}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>현재 지역</span>
                <strong>{zoneDetail?.name ?? "-"}</strong>
              </div>
            </div>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

        {!user ? (
          <div className="powerRankingLoading">회원가입 이후 이용가능합니다.</div>
        ) : isLoading ? (
          <div className="powerRankingLoading">사냥터 목록을 불러오는 중입니다.</div>
        ) : (
          <>
            <section className="powerRankingBoardSection huntingStageSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Zone Board</p>
                  <h2>지역 선택</h2>
                </div>
                <p className="powerRankingSectionHint">해금 조건과 예상 드랍을 보고 이동합니다.</p>
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
                      onClick={() => void selectZone(zone.id)}
                    >
                      <strong>{zone.badge}</strong>
                      <span>{zone.name}</span>
                      <small>{zone.zoneType === "normal" ? "일반 사냥터" : zone.zoneType === "elite" ? "정예 사냥터" : zone.zoneType === "boss" ? "보스 사냥터" : "이벤트 사냥터"}</small>
                      <small>{zone.chapterLabel}</small>
                      <small>{zone.roleSummary}</small>
                      <small>{isUnlocked ? `권장 전투력 ${zone.recommendedPower}` : `레벨 ${zone.unlockLevel} 필요`}</small>
                      <small>클릭 소모 {zone.clickCost}</small>
                      {zone.dailyEntryLimit ? <small>일일 입장 {zone.dailyEntryLimit}회</small> : null}
                      {zone.seasonLabel ? <small>{zone.seasonLabel} · {zone.isSeasonOpen ? "오픈 중" : "준비 중"}</small> : null}
                      <small>몬스터: {zone.monsterNames.join(", ")}</small>
                      <small>드랍: {zone.previewDrops.join(", ")}</small>
                    </button>
                  );
                })}
              </div>
            </section>

            {zoneDetail ? (
              <section className="powerRankingBoardSection">
                <div className="powerRankingSectionHead">
                  <div>
                    <p className="powerRankingSectionEyebrow">{zoneDetail.badge}</p>
                    <h2>{zoneDetail.name}</h2>
                  </div>
                  <p className="powerRankingSectionHint">
                    {zoneDetail.description} · {zoneDetail.roleSummary} · 클릭 소모 {zoneDetail.clickCost}
                    {zoneDetail.dailyEntryLimit ? ` · 일일 입장 ${zoneDetail.dailyEntryLimit}회` : ""}
                    {zoneDetail.seasonLabel ? ` · ${zoneDetail.seasonLabel}` : ""}
                  </p>
                </div>

                <div className="huntingMonsterGrid">
                  {zoneDetail.monsters.map((monster) => (
                    <article
                      key={monster.id}
                      className={`huntingMonsterCard ${monster.id === selectedMonsterId ? "isActive" : ""}`}
                    >
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
                        <button type="button" className="powerRankingItemButton" onClick={() => void focusMonster(monster.id)}>
                          대상 지정
                        </button>
                        <Link to="/dongyeon-hunting-combat" className="powerRankingItemButton isPositive">
                          전투 이동
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default HuntingZoneSelectPage;
