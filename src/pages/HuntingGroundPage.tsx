import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import CommunityTopBar from "../components/CommunityTopBar";
import HuntingSubNav from "../components/HuntingSubNav";
import { MAX_ENDURANCE, materialMeta } from "../features/huntingProgress";
import { useHuntingGame } from "../features/hunting/useHuntingGame";
import type { HuntingZoneSummary } from "../types";

const isHuntingZoneSummary = (zone: unknown): zone is HuntingZoneSummary =>
  typeof zone === "object" && zone !== null && "previewDrops" in zone;

const HuntingGroundPage = () => {
  const { user, progress, profile, currentZone, remainingClicks, isLoading, errorMessage, zones, selectedMonster } = useHuntingGame();

  const featuredZones = useMemo(() => zones.slice(0, 3), [zones]);
  const currentZoneDrops = useMemo(() => {
    if (!currentZone || !isHuntingZoneSummary(currentZone)) {
      return [];
    }
    return currentZone.previewDrops.slice(0, 4);
  }, [currentZone]);

  useEffect(() => {
    document.title = "사냥 내 정보";
  }, []);

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <HuntingSubNav />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Hunting Hub</p>
            <h1>사냥 허브</h1>
            <p className="powerRankingLead">현재 상태를 보고 바로 사냥터를 고르거나, 현재 지역 전투로 바로 진입할 수 있게 정리했습니다.</p>
          </div>

          <div className="huntingHubHeroCard">
            <div className="huntingHubHeroVisual">
              <img
                src={selectedMonster?.imageUrl ?? "/assets/monsters/canteen-wolf.svg"}
                alt={selectedMonster?.name ?? currentZone?.name ?? "현재 사냥터"}
                className="huntingHubHeroImage"
              />
            </div>
            <div className="huntingHubHeroBody">
              <span className="huntingHubHeroBadge">{currentZone?.badge ?? "HUB"}</span>
              <strong>{currentZone?.name ?? "사냥터 선택 대기"}</strong>
              <p>{selectedMonster?.name ?? currentZone?.description ?? "원하는 사냥터를 고른 뒤 전투를 시작하세요."}</p>
              <div className="huntingHubHeroMeta">
                <span>권장 전투력 {currentZone?.recommendedPower ?? "-"}</span>
                <span>클릭 소모 {currentZone?.clickCost ?? "-"}</span>
              </div>
            </div>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

        {!user ? (
          <div className="powerRankingLoading">회원가입 이후 이용가능합니다.</div>
        ) : isLoading ? (
          <div className="powerRankingLoading">사냥 정보를 불러오는 중입니다.</div>
        ) : (
          <section className="powerRankingDashboardSection">
            <div className="powerRankingSectionHead">
              <div>
                <p className="powerRankingSectionEyebrow">Overview</p>
                <h2>현재 진행 정보</h2>
              </div>
            </div>

            <div className="powerRankingDashboardGrid huntingOverviewGrid">
              <article className="powerRankingDashboardCard">
                <span>사냥 레벨</span>
                <strong>{progress.level}</strong>
                <p>현재 경험치 {progress.exp}</p>
              </article>
              <article className="powerRankingDashboardCard">
                <span>전투력</span>
                <strong>{profile?.battlePower ?? 0}</strong>
                <p>현재 장비와 카드 보정 기준</p>
              </article>
              <article className="powerRankingDashboardCard">
                <span>남은 클릭</span>
                <strong>{remainingClicks}</strong>
                <p>오늘 클릭 {progress.todayClickCount}회 사용</p>
              </article>
              <article className="powerRankingDashboardCard">
                <span>피로도</span>
                <strong>{progress.endurance} / {MAX_ENDURANCE}</strong>
                <p>20초마다 1 회복</p>
              </article>
              <article className="powerRankingDashboardCard">
                <span>현재 지역</span>
                <strong>{currentZone?.name ?? "-"}</strong>
                <p>{currentZone?.chapterLabel ?? "미선택"}</p>
              </article>
              <article className="powerRankingDashboardCard">
                <span>동연 코인</span>
                <strong>{progress.materials["club-coin"]}</strong>
                <p>{materialMeta["club-coin"].description}</p>
              </article>
            </div>

            <section className="powerRankingBoardSection huntingHubEntrySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Quick Entry</p>
                  <h2>바로 이동</h2>
                </div>
                <p className="powerRankingSectionHint">지금 필요한 화면으로 바로 들어갑니다.</p>
              </div>

              <div className="huntingHubQuickGrid">
                <Link to="/dongyeon-hunting-zones" className="huntingHubQuickCard">
                  <strong>사냥터 선택</strong>
                  <p>지역, 드랍, 권장 전투력을 보고 다음 사냥터를 고릅니다.</p>
                  <span>지역 목록 보기</span>
                </Link>
                <Link to="/dongyeon-hunting-combat" className="huntingHubQuickCard isPrimary">
                  <strong>현재 지역 전투</strong>
                  <p>{currentZone ? `${currentZone.name}에서 바로 전투를 이어갑니다.` : "선택된 지역으로 바로 전투를 시작합니다."}</p>
                  <span>전투 화면 이동</span>
                </Link>
                <Link to="/dongyeon-hunting-raid" className="huntingHubQuickCard">
                  <strong>보스 레이드</strong>
                  <p>자동사냥 없이 직접 클릭으로만 잡는 후한 보상 레이드입니다.</p>
                  <span>레이드 입장</span>
                </Link>
                <Link to="/dongyeon-hunting-status" className="huntingHubQuickCard">
                  <strong>내 상태</strong>
                  <p>레벨, 재화, 장비 성장 상태를 한 번에 확인합니다.</p>
                  <span>상태 확인</span>
                </Link>
              </div>
            </section>

            <section className="powerRankingBoardSection huntingHubZoneSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Current Hunt</p>
                  <h2>현재 사냥 지역</h2>
                </div>
                <p className="powerRankingSectionHint">지금 들어가 있는 지역과 대표 드랍을 빠르게 확인합니다.</p>
              </div>

              <div className="huntingHubCurrentGrid">
                <article className="huntingHubCurrentCard">
                  <div className="huntingHubCurrentVisual">
                    <img
                      src={selectedMonster?.imageUrl ?? "/assets/monsters/canteen-wolf.svg"}
                      alt={currentZone?.name ?? "현재 지역"}
                      className="huntingHubCurrentImage"
                    />
                  </div>
                  <div className="huntingHubCurrentBody">
                    <span>{currentZone?.chapterLabel ?? "지역 미선택"}</span>
                    <strong>{currentZone?.name ?? "사냥터를 먼저 골라주세요"}</strong>
                    <p>{currentZone?.description ?? "사냥터 선택에서 지역을 고르면 이곳에 현재 사냥터 정보가 표시됩니다."}</p>
                    <div className="huntingHubCurrentMeta">
                      <span>권장 {currentZone?.recommendedPower ?? "-"}</span>
                      <span>클릭 {currentZone?.clickCost ?? "-"}</span>
                      <span>몬스터 {isHuntingZoneSummary(currentZone) ? currentZone.monsterNames.length : 0}종</span>
                    </div>
                  </div>
                </article>

                <article className="huntingHubDropCard">
                  <strong>대표 드랍</strong>
                  {currentZoneDrops.length === 0 ? (
                    <p>사냥터를 선택하면 대표 드랍이 보입니다.</p>
                  ) : (
                    <ul className="huntingHubDropList">
                      {currentZoneDrops.map((drop) => (
                        <li key={drop}>
                          <span className="huntingHubDropDot" />
                          <strong>{drop}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </div>
            </section>

            <section className="powerRankingBoardSection huntingHubZoneSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Suggested Zones</p>
                  <h2>추천 사냥터</h2>
                </div>
                <p className="powerRankingSectionHint">해금 가능한 주요 지역을 바로 눌러 이동할 수 있습니다.</p>
              </div>

              <div className="huntingHubZoneGrid">
                {featuredZones.map((zone) => {
                  const zoneImage = zone.id === currentZone?.id && selectedMonster?.imageUrl
                    ? selectedMonster.imageUrl
                    : "/assets/monsters/canteen-wolf.svg";
                  const isUnlocked = progress.level >= zone.unlockLevel;
                  return (
                    <article key={zone.id} className={`huntingHubZoneCard ${zone.id === currentZone?.id ? "isActive" : ""}`.trim()}>
                      <div className="huntingHubZoneVisual">
                        <img src={zoneImage} alt={zone.name} className="huntingHubZoneImage" />
                        <span className="huntingHubZoneBadge">{zone.badge}</span>
                      </div>
                      <div className="huntingHubZoneBody">
                        <strong>{zone.name}</strong>
                        <p>{zone.roleSummary}</p>
                        <div className="huntingHubZoneMeta">
                          <span>권장 {zone.recommendedPower}</span>
                          <span>클릭 {zone.clickCost}</span>
                          <span>{isUnlocked ? "입장 가능" : `Lv.${zone.unlockLevel} 필요`}</span>
                        </div>
                        <Link to="/dongyeon-hunting-zones" className="powerRankingItemButton">
                          {zone.id === currentZone?.id ? "현재 지역 보기" : "이 지역 보기"}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
        )}
      </div>
    </div>
  );
};

export default HuntingGroundPage;
