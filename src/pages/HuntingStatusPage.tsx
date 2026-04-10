import { useEffect } from "react";
import { Link } from "react-router-dom";
import CommunityTopBar from "../components/CommunityTopBar";
import HuntingSubNav from "../components/HuntingSubNav";
import { useHuntingGame } from "../features/hunting/useHuntingGame";

const HuntingStatusPage = () => {
  const { user, combatState, currentZone, selectedMonster, estimatedDamage, zoneDropPreview, isLoading, errorMessage } =
    useHuntingGame();

  useEffect(() => {
    document.title = "사냥 내 상태";
  }, []);

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <HuntingSubNav />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">My Hunting Status</p>
            <h1>내 상태</h1>
            <p className="powerRankingLead">현재 전투 상태, 몬스터, 드랍 테이블만 분리해서 봅니다.</p>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

        {!user ? (
          <div className="powerRankingLoading">회원가입 이후 이용가능합니다.</div>
        ) : isLoading ? (
          <div className="powerRankingLoading">전투 상태를 불러오는 중입니다.</div>
        ) : (
          <>
            <section className="powerRankingBoardSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Current Battle</p>
                  <h2>전투 상태</h2>
                </div>
                <Link to="/dongyeon-hunting-combat" className="powerRankingItemButton isPositive">
                  전투 화면 이동
                </Link>
              </div>

              <div className="powerRankingDashboardGrid huntingOverviewGrid">
                <article className="powerRankingDashboardCard">
                  <span>현재 지역</span>
                  <strong>{currentZone?.name ?? "-"}</strong>
                  <p>{currentZone?.zoneType ?? "-"}</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>현재 대상</span>
                  <strong>{selectedMonster?.name ?? "-"}</strong>
                  <p>{selectedMonster?.rarityLabel ?? "대상 없음"}</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>예상 데미지</span>
                  <strong>{estimatedDamage}</strong>
                  <p>현재 서버 계산 기준</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>클릭 소모</span>
                  <strong>{combatState?.clickCost ?? 0}</strong>
                  <p>현재 지역 피로도 소모량</p>
                </article>
              </div>
            </section>

            <section className="powerRankingLogSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Drop Table</p>
                  <h2>드랍 테이블</h2>
                </div>
              </div>
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
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HuntingStatusPage;
