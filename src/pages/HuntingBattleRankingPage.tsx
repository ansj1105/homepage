import { useEffect, useMemo, useState } from "react";
import CommunityTopBar from "../components/CommunityTopBar";
import { apiClient } from "../api/client";
import type { HuntingBattleRankingEntry } from "../types";

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

const HuntingBattleRankingPage = () => {
  const [ranking, setRanking] = useState<HuntingBattleRankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.title = "개인 전투력 랭킹";
  }, []);

  useEffect(() => {
    apiClient
      .getHuntingBattleRanking()
      .then((items) => {
        setRanking(items);
        setErrorMessage("");
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "전투력 랭킹을 불러오지 못했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const topThree = useMemo(() => ranking.slice(0, 3), [ranking]);

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Battle Power Ranking</p>
            <h1>개인 전투력 랭킹</h1>
            <p className="powerRankingLead">
              사냥 프로필 기준 전투력을 전체 사용자 순위로 집계했습니다. 파워랭킹과 달리 이 페이지는 표 중심으로 보여줍니다.
            </p>
          </div>

          <div className="powerRankingControlPanel">
            <div className="powerRankingStats">
              <div className="powerRankingStatCard">
                <span>랭커 수</span>
                <strong>{ranking.length}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>1위 전투력</span>
                <strong>{topThree[0]?.battlePower ?? 0}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>평균 전투력</span>
                <strong>
                  {ranking.length > 0
                    ? Math.round(ranking.reduce((sum, item) => sum + item.battlePower, 0) / ranking.length)
                    : 0}
                </strong>
              </div>
            </div>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
        {isLoading ? <div className="powerRankingLoading">전투력 랭킹을 불러오는 중입니다.</div> : null}

        {!isLoading ? (
          <section className="powerRankingBoardSection">
            <div className="powerRankingSectionHead">
              <div>
                <p className="powerRankingSectionEyebrow">Battle Table</p>
                <h2>전체 전투력 순위표</h2>
              </div>
              <p className="powerRankingSectionHint">
                정렬 기준: 전투력, 무기 공격력, 닉네임 순
              </p>
            </div>

            <div className="powerRankingBoard huntingBattleRankingBoard">
              <div className="powerRankingBoardHeader huntingBattleRankingHeader">
                <span>순위</span>
                <span>닉네임</span>
                <span>이름</span>
                <span>전투력</span>
                <span>무기</span>
                <span>추천</span>
                <span>장비</span>
                <span>업데이트</span>
              </div>
              <div className="powerRankingBoardList">
                {ranking.length > 0 ? (
                  ranking.map((entry) => (
                    <div key={entry.userId} className="powerRankingRow">
                      <div className="powerRankingRowSummary huntingBattleRankingRow">
                        <div className="huntingBattleRankingCell">
                          <span className="powerRankingRowLabel">순위</span>
                          <strong>#{entry.rank}</strong>
                        </div>
                        <div className="huntingBattleRankingCell">
                          <span className="powerRankingRowLabel">닉네임</span>
                          <strong>{entry.nickname}</strong>
                        </div>
                        <div className="huntingBattleRankingCell">
                          <span className="powerRankingRowLabel">이름</span>
                          <span>{entry.name}</span>
                        </div>
                        <div className="huntingBattleRankingCell">
                          <span className="powerRankingRowLabel">전투력</span>
                          <strong>{entry.battlePower}</strong>
                        </div>
                        <div className="huntingBattleRankingCell">
                          <span className="powerRankingRowLabel">무기</span>
                          <span>{entry.weaponAttack}</span>
                        </div>
                        <div className="huntingBattleRankingCell">
                          <span className="powerRankingRowLabel">추천</span>
                          <span>{entry.recommendationCoefficient}</span>
                        </div>
                        <div className="huntingBattleRankingCell">
                          <span className="powerRankingRowLabel">장비</span>
                          <span>{entry.equippedCount} / 5</span>
                        </div>
                        <div className="huntingBattleRankingCell">
                          <span className="powerRankingRowLabel">업데이트</span>
                          <span>{formatDateTime(entry.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="powerRankingInventoryEmpty">표시할 전투력 랭커가 없습니다.</div>
                )}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default HuntingBattleRankingPage;
