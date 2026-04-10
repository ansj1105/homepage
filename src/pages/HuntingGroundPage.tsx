import { useEffect } from "react";
import CommunityTopBar from "../components/CommunityTopBar";
import HuntingSubNav from "../components/HuntingSubNav";
import { MAX_ENDURANCE, materialMeta } from "../features/huntingProgress";
import { useHuntingGame } from "../features/hunting/useHuntingGame";

const HuntingGroundPage = () => {
  const { user, progress, profile, currentZone, remainingClicks, isLoading, errorMessage } = useHuntingGame();

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
            <p className="powerRankingEyebrow">My Hunting Info</p>
            <h1>내 정보</h1>
            <p className="powerRankingLead">사냥 진행의 핵심 수치와 현재 진입 중인 지역만 먼저 보여줍니다.</p>
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
          </section>
        )}
      </div>
    </div>
  );
};

export default HuntingGroundPage;
