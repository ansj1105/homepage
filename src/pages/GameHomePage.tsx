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
import {
  applyMissionRewards,
  getAchievements,
  getDailyMissions,
  getMissionRewardText,
  getWeeklyMissions,
  type MissionEntry
} from "../features/missions";
import type { GameHomeResponse, PowerRankingEquipmentSlot } from "../types";
import { useTodayVisitors } from "../visitor/VisitorContext";

const GameHomePage = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const { todayVisitors } = useTodayVisitors();
  const [home, setHome] = useState<GameHomeResponse | null>(null);
  const [progress, setProgress] = useState<HuntingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.title = "내 정보";
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/dongyeon-login");
      return;
    }

    const saved = loadHuntingProgress(getHuntingStorageKey(user.id));
    setProgress(saved);
    apiClient
      .getGameHome(
        saved.selectedCardTargetId,
        saved.selectedCardTargetId ? (saved.cardLevels[saved.selectedCardTargetId] ?? 1) : 1
      )
      .then((payload) => {
        setHome(payload);
        setErrorMessage("");
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "내 정보 데이터를 불러오지 못했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate, user]);

  const remainingClicks = Math.max(0, (home?.huntingProfile.dailyClickLimit ?? 300) - (progress?.todayClickCount ?? 0));
  const equippedCount = Object.keys(home?.huntingProfile.equippedItems ?? {}).length;
  const ownedEquipmentCount = (home?.huntingProfile.equipmentInventory.length ?? 0) + equippedCount;
  const selectedCardLevel = progress?.selectedCardTargetId ? (progress.cardLevels[progress.selectedCardTargetId] ?? 1) : 0;
  const selectedCardPopularity = progress?.selectedCardTargetId ? (progress.cardPopularity[progress.selectedCardTargetId] ?? 0) : 0;

  const maxEnhanceLevel = Math.max(0, ...Object.values(progress?.enhancementLevels ?? {}).map((value) => value ?? 0));
  const dailyMissions = useMemo(() => (progress ? getDailyMissions(progress) : []), [progress]);
  const weeklyMissions = useMemo(
    () => (progress ? getWeeklyMissions(progress, equippedCount, ownedEquipmentCount, selectedCardLevel) : []),
    [progress, equippedCount, ownedEquipmentCount, selectedCardLevel]
  );
  const achievements = useMemo(
    () => (progress ? getAchievements(progress, maxEnhanceLevel, equippedCount, selectedCardPopularity) : []),
    [progress, maxEnhanceLevel, equippedCount, selectedCardPopularity]
  );

  const growthAxes = useMemo(
    () => [
      {
        label: "유저 레벨",
        value: `Lv.${progress?.level ?? 1}`,
        summary: "클릭 / 처치 / 미션 보상으로 경험치를 쌓습니다."
      },
      {
        label: "장비 성장",
        value: `${equippedCount}부위 / +${Math.max(0, ...Object.values(progress?.enhancementLevels ?? {}).map((value) => value ?? 0))}`,
        summary: "강화, 세트 조합, 등급 교체로 전투력이 오릅니다."
      },
      {
        label: "카드 성장",
        value: `${selectedCardLevel > 0 ? `Lv.${selectedCardLevel}` : "미선택"}`,
        summary: "인기도, 카드 레벨, 카드 패시브가 전투와 파밍에 연결됩니다."
      },
      {
        label: "사냥터 해금",
        value: `${progress?.level ?? 1}레벨`,
        summary: "더 높은 지역이 열리며 보스와 세트 장비가 확장됩니다."
      },
      {
        label: "컬렉션 성장",
        value: `${ownedEquipmentCount}장비`,
        summary: "도감, 세트 도감, 카드 수집이 장기 성장 목표가 됩니다."
      }
    ],
    [progress?.level, progress?.enhancementLevels, selectedCardLevel, ownedEquipmentCount, equippedCount]
  );

  const handleClaimMission = (mission: MissionEntry) => {
    if (!progress || mission.claimed || mission.current < mission.target) {
      return;
    }
    const next = applyMissionRewards(progress, mission);
    setProgress(next);
    setErrorMessage(`${mission.label} 보상 수령 완료 · ${getMissionRewardText(mission)}`);
  };

  const quickLinks = [
    { label: "사냥터 허브", to: "/dongyeon-hunting-ground" },
    { label: "사냥터 선택", to: "/dongyeon-hunting-zones" },
    { label: "전투 화면", to: "/dongyeon-hunting-combat" },
    { label: "인벤토리", to: "/dongyeon-inventory" },
    { label: "강화", to: "/dongyeon-equipment-enhancement" },
    { label: "카드", to: "/dongyeon-cards" },
    { label: "상점", to: "/dongyeon-shop" },
    { label: "도감", to: "/dongyeon-collection" }
  ];

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <header className="powerRankingHero powerRankingHeroMaple gameHomeHero">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">My Overview</p>
            <h1>내 정보</h1>
            <p className="powerRankingLead">
              사냥, 장비, 카드, 자원 상태를 한곳에서 보고 바로 이동할 수 있게 정리한 개인 허브입니다.
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
        {isLoading ? <div className="powerRankingLoading">내 정보를 불러오는 중입니다.</div> : null}

        {!isLoading && home && progress ? (
          <>
            <section className="powerRankingDashboardSection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">My Status</p>
                  <h2>내 상태</h2>
                </div>
                <p className="powerRankingSectionHint">현재 사이트에 저장되는 실제 데이터만 연결해서 보여줍니다.</p>
              </div>

              <div className="powerRankingDashboardGrid huntingOverviewGrid">
                <article className="powerRankingDashboardCard">
                  <span>남은 클릭 횟수</span>
                  <strong>{remainingClicks}</strong>
                  <p>오늘 클릭 {progress.todayClickCount} / {home.huntingProfile.dailyClickLimit}</p>
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
                    <p>응원 포인트 {progress.cardSupportPoints}점 · 카드 레벨 {progress.selectedCardTargetId ? (progress.cardLevels[progress.selectedCardTargetId] ?? 1) : 0}</p>
                  </div>
                </article>
                {home.cards.slice(0, 3).map((card) => (
                  <article key={card.id} className="powerRankingInventoryCard">
                    <div className="powerRankingInventoryBody">
                      <div className="powerRankingInventoryHeading">
                        <strong>{card.name}</strong>
                        <span>{card.typeLabel}</span>
                      </div>
                      <p>{card.bonusSummary}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="powerRankingInventorySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Daily Mission</p>
                  <h2>일일 미션</h2>
                </div>
              </div>

              <div className="powerRankingDashboardGrid">
                {dailyMissions.map((mission) => {
                  const ratio = Math.min(100, Math.round((mission.current / mission.target) * 100));
                  return (
                    <article key={mission.label} className="powerRankingDashboardCard">
                      <span>{mission.label}</span>
                      <strong>{mission.current} / {mission.target}</strong>
                      <p>진행률 {ratio}% · 보상 {mission.rewardSummary}</p>
                      <button
                        type="button"
                        className="powerRankingItemButton isPositive"
                        disabled={mission.claimed || mission.current < mission.target}
                        onClick={() => handleClaimMission(mission)}
                      >
                        {mission.claimed ? "수령 완료" : "보상 수령"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="powerRankingInventorySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Weekly Mission</p>
                  <h2>주간 미션</h2>
                </div>
              </div>

              <div className="powerRankingDashboardGrid">
                {weeklyMissions.map((mission) => {
                  const ratio = Math.min(100, Math.round((mission.current / mission.target) * 100));
                  return (
                    <article key={mission.label} className="powerRankingDashboardCard">
                      <span>{mission.label}</span>
                      <strong>{mission.current} / {mission.target}</strong>
                      <p>진행률 {ratio}%</p>
                      <button
                        type="button"
                        className="powerRankingItemButton isPositive"
                        disabled={mission.claimed || mission.current < mission.target}
                        onClick={() => handleClaimMission(mission)}
                      >
                        {mission.claimed ? "수령 완료" : "보상 수령"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="powerRankingInventorySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Achievement</p>
                  <h2>업적</h2>
                </div>
              </div>

              <div className="powerRankingDashboardGrid">
                {achievements.map((achievement) => {
                  const ratio = Math.min(100, Math.round((achievement.current / achievement.target) * 100));
                  return (
                    <article key={achievement.label} className="powerRankingDashboardCard">
                      <span>{achievement.label}</span>
                      <strong>{achievement.current} / {achievement.target}</strong>
                      <p>달성도 {ratio}%</p>
                      <button
                        type="button"
                        className="powerRankingItemButton isPositive"
                        disabled={achievement.claimed || achievement.current < achievement.target}
                        onClick={() => handleClaimMission(achievement)}
                      >
                        {achievement.claimed ? "수령 완료" : "보상 수령"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="powerRankingInventorySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Growth Axis</p>
                  <h2>성장 축</h2>
                </div>
              </div>

              <div className="powerRankingDashboardGrid">
                {growthAxes.map((axis) => (
                  <article key={axis.label} className="powerRankingDashboardCard">
                    <span>{axis.label}</span>
                    <strong>{axis.value}</strong>
                    <p>{axis.summary}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default GameHomePage;
