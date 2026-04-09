import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { useUserAuth } from "../auth/UserAuthContext";
import CommunityTopBar from "../components/CommunityTopBar";
import { powerRankingEquipmentSlotLabels } from "../data/powerRankingEquipment";
import {
  getHuntingStorageKey,
  loadHuntingProgress,
  materialMeta,
  MAX_ENDURANCE,
  type HuntingProgress
} from "../features/huntingProgress";
import type { GameHomeResponse, PowerRankingEquipmentSlot } from "../types";
import { useTodayVisitors } from "../visitor/VisitorContext";

const DAILY_CLICK_LIMIT = 300;

const GameHomePage = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const { todayVisitors } = useTodayVisitors();
  const [home, setHome] = useState<GameHomeResponse | null>(null);
  const [progress, setProgress] = useState<HuntingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.title = "게임 메인 로비";
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/dongyeon-login");
      return;
    }

    setProgress(loadHuntingProgress(getHuntingStorageKey(user.id)));
    apiClient
      .getGameHome()
      .then((payload) => {
        setHome(payload);
        setErrorMessage("");
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "메인 로비 데이터를 불러오지 못했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate, user]);

  const remainingClicks = Math.max(0, DAILY_CLICK_LIMIT - (progress?.todayClickCount ?? 0));
  const missions = useMemo(
    () => [
      {
        label: "오늘 클릭 30회",
        current: progress?.todayClickCount ?? 0,
        target: 30
      },
      {
        label: "오늘 처치 15마리",
        current: progress?.todayDefeatedCount ?? 0,
        target: 15
      },
      {
        label: "장비 3부위 장착",
        current: Object.keys(home?.huntingProfile.equippedItems ?? {}).length,
        target: 3
      }
    ],
    [home?.huntingProfile.equippedItems, progress?.todayClickCount, progress?.todayDefeatedCount]
  );

  const quickLinks = [
    { label: "사냥터 허브", to: "/dongyeon-hunting-ground" },
    { label: "사냥터 선택", to: "/dongyeon-hunting-zones" },
    { label: "전투 화면", to: "/dongyeon-hunting-combat" },
    { label: "인벤토리", to: "/dongyeon-equipment#equipment-inventory" },
    { label: "강화", to: "/dongyeon-equipment#equipment-enhancement" },
    { label: "카드", to: "/dongyeon-power-ranking" },
    { label: "상점", to: "/dongyeon-hunting-battle-ranking" }
  ];

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <header className="powerRankingHero powerRankingHeroMaple gameHomeHero">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Game Lobby</p>
            <h1>메인 로비</h1>
            <p className="powerRankingLead">
              사냥, 장비, 카드 상태를 한곳에서 보고 바로 이동할 수 있게 현재 사이트 구조에 맞춘 허브를 추가했습니다.
            </p>
          </div>

          <div className="powerRankingControlPanel">
            <div className="powerRankingStats">
              <div className="powerRankingStatCard">
                <span>유저 레벨</span>
                <strong>{progress?.level ?? 1}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>현재 전투력</span>
                <strong>{home?.huntingProfile.battlePower ?? 0}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>오늘 클릭</span>
                <strong>{progress?.todayClickCount ?? 0}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>오늘 방문자</span>
                <strong>{todayVisitors}</strong>
              </div>
            </div>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
        {isLoading ? <div className="powerRankingLoading">메인 로비를 불러오는 중입니다.</div> : null}

        {!isLoading && home && progress ? (
          <>
            <section className="powerRankingDashboardSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Lobby Status</p>
                  <h2>전체 상태</h2>
                </div>
                <p className="powerRankingSectionHint">현재 사이트에 저장되는 실제 데이터만 연결해서 보여줍니다.</p>
              </div>

              <div className="powerRankingDashboardGrid huntingOverviewGrid">
                <article className="powerRankingDashboardCard">
                  <span>남은 클릭 횟수</span>
                  <strong>{remainingClicks}</strong>
                  <p>오늘 클릭 {progress.todayClickCount} / {DAILY_CLICK_LIMIT}</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>남은 지구력</span>
                  <strong>{progress.endurance} / {MAX_ENDURANCE}</strong>
                  <p>사냥터 입장과 자동 사냥에 쓰는 현재 행동력입니다.</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>동연 코인</span>
                  <strong>{progress.materials["club-coin"]}</strong>
                  <p>{materialMeta["club-coin"].description}</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>고대 코어</span>
                  <strong>{progress.materials["ancient-core"]}</strong>
                  <p>{materialMeta["ancient-core"].description}</p>
                </article>
              </div>
            </section>

            <section className="powerRankingInventorySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Quick Move</p>
                  <h2>빠른 이동</h2>
                </div>
              </div>

              <div className="gameHomeQuickGrid">
                {quickLinks.map((link) => (
                  <Link key={link.label} to={link.to} className="powerRankingItemButton isPositive gameHomeQuickLink">
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>

            <section className="powerRankingInventorySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Equipment</p>
                  <h2>현재 장착 장비</h2>
                </div>
                <p className="powerRankingSectionHint">현재 장착 중인 부위와 효과 요약입니다.</p>
              </div>

              <div className="powerRankingInventoryGrid">
                {(Object.keys(powerRankingEquipmentSlotLabels) as PowerRankingEquipmentSlot[]).map((slot) => {
                  const equipped = home.huntingProfile.equippedItems[slot];
                  return (
                    <article key={slot} className="powerRankingInventoryCard">
                      <div className="powerRankingInventoryBody">
                        <div className="powerRankingInventoryHeading">
                          <strong>{powerRankingEquipmentSlotLabels[slot]}</strong>
                          <span>{equipped ? equipped.name : "미착용"}</span>
                        </div>
                        <p>{equipped ? equipped.effectSummary : "아직 장착한 장비가 없습니다."}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="powerRankingInventorySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Card Status</p>
                  <h2>카드 상태</h2>
                </div>
                <p className="powerRankingSectionHint">현재 응원 대상과 상위 카드 랭커를 바로 확인합니다.</p>
              </div>

              <div className="powerRankingInventoryGrid">
                <article className="powerRankingInventoryCard">
                  <div className="powerRankingInventoryBody">
                    <div className="powerRankingInventoryHeading">
                      <strong>현재 응원 카드</strong>
                      <span>{home.cards.find((card) => card.id === progress.selectedCardTargetId)?.name ?? "미선택"}</span>
                    </div>
                    <p>응원 포인트 {progress.cardSupportPoints}점을 모아 파워랭킹 인기도 성장에 사용합니다.</p>
                  </div>
                </article>
                {home.cards.slice(0, 3).map((card) => (
                  <article key={card.id} className="powerRankingInventoryCard">
                    <div className="powerRankingInventoryBody">
                      <div className="powerRankingInventoryHeading">
                        <strong>{card.name}</strong>
                        <span>인기도 {card.score}</span>
                      </div>
                      <p>현재 파워랭킹 상위 카드입니다.</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="powerRankingInventorySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Today Mission</p>
                  <h2>오늘의 미션</h2>
                </div>
              </div>

              <div className="powerRankingDashboardGrid">
                {missions.map((mission) => {
                  const ratio = Math.min(100, Math.round((mission.current / mission.target) * 100));
                  return (
                    <article key={mission.label} className="powerRankingDashboardCard">
                      <span>{mission.label}</span>
                      <strong>{mission.current} / {mission.target}</strong>
                      <p>진행률 {ratio}%</p>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default GameHomePage;
