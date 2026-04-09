import { useEffect } from "react";
import { Link } from "react-router-dom";
import CommunityTopBar from "../components/CommunityTopBar";
import { materialMeta, MAX_ENDURANCE } from "../features/huntingProgress";
import { useHuntingGame } from "../features/hunting/useHuntingGame";

const HuntingGroundPage = () => {
  const { user, progress, profile, currentZone, selectedMonster, remainingClicks, estimatedDamage, isLoading, errorMessage } =
    useHuntingGame();

  useEffect(() => {
    document.title = "동아리연합회 사냥터";
  }, []);

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Hunting Hub</p>
            <h1>사냥터 허브</h1>
            <p className="powerRankingLead">
              한 페이지에 몰려 있던 사냥터를 `허브`, `사냥터 선택`, `전투 화면`으로 분리했습니다. 여기서는 현재 상태와 이동만 보여줍니다.
            </p>
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
            <section className="powerRankingDashboardSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Current Run</p>
                  <h2>현재 상태</h2>
                </div>
                <p className="powerRankingSectionHint">전투 진행에 필요한 핵심 정보만 남겼습니다.</p>
              </div>

              <div className="powerRankingDashboardGrid huntingOverviewGrid">
                <article className="powerRankingDashboardCard">
                  <span>현재 지역</span>
                  <strong>{currentZone?.name ?? "-"}</strong>
                  <p>
                    {currentZone?.chapterLabel ?? "미선택"}
                    {currentZone ? ` · ${currentZone.zoneType === "normal" ? "일반" : currentZone.zoneType === "elite" ? "정예" : currentZone.zoneType === "boss" ? "보스" : "이벤트"}` : ""}
                  </p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>현재 대상</span>
                  <strong>{selectedMonster?.name ?? "-"}</strong>
                  <p>{selectedMonster?.rarityLabel ?? "대상 없음"}</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>예상 데미지</span>
                  <strong>{estimatedDamage}</strong>
                  <p>현재 서버 계산 기준 예상 클릭 데미지입니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>동연 코인</span>
                  <strong>{progress.materials["club-coin"]}</strong>
                  <p>{materialMeta["club-coin"].description}</p>
                </article>
              </div>
            </section>

            <section className="powerRankingInventorySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Split Routes</p>
                  <h2>분리된 화면</h2>
                </div>
              </div>

              <div className="gameHomeQuickGrid">
                <Link to="/dongyeon-hunting-zones" className="powerRankingItemButton isPositive gameHomeQuickLink">
                  사냥터 선택 화면
                </Link>
                <Link to="/dongyeon-hunting-combat" className="powerRankingItemButton isPositive gameHomeQuickLink">
                  전투 화면
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HuntingGroundPage;
