import { useEffect } from "react";
import { Link } from "react-router-dom";
import CommunityTopBar from "../components/CommunityTopBar";
import HuntingSubNav from "../components/HuntingSubNav";
import { getCardStageImageUrl, getCardStageLabel } from "../data/gameCards";
import { powerRankingEquipmentSlotLabels } from "../data/powerRankingEquipment";
import { useHuntingGame } from "../features/hunting/useHuntingGame";
import type { PowerRankingEquipmentSlot } from "../types";

const HuntingProfilePage = () => {
  const { user, progress, profile, isLoading, errorMessage } = useHuntingGame();

  useEffect(() => {
    document.title = "사냥 내 프로필";
  }, []);

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <HuntingSubNav />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">My Hunting Profile</p>
            <h1>내 프로필</h1>
            <p className="powerRankingLead">선택 카드, 장착 장비, 현재 적용 중인 세부 효과만 따로 봅니다.</p>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

        {!user ? (
          <div className="powerRankingLoading">회원가입 이후 이용가능합니다.</div>
        ) : isLoading ? (
          <div className="powerRankingLoading">프로필 정보를 불러오는 중입니다.</div>
        ) : (
          <>
            <section className="powerRankingInventorySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Card</p>
                  <h2>선택 카드</h2>
                </div>
                <Link to="/dongyeon-cards" className="powerRankingItemButton">
                  카드 화면 이동
                </Link>
              </div>

              <div className="powerRankingDashboardGrid huntingOverviewGrid">
                <article className="powerRankingDashboardCard">
                  <span>선택 카드</span>
                  <strong>{profile?.activeCardName ?? "미선택"}</strong>
                  <p>
                    {profile?.activeCardId
                      ? `레벨 ${progress.cardLevels[profile.activeCardId] ?? 1} · ${getCardStageLabel(progress.cardLevels[profile.activeCardId] ?? 1)}`
                      : "카드 선택 필요"}
                  </p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>카드 성장 배수</span>
                  <strong>{profile?.cardGrowthMultiplier?.toFixed(2) ?? "1.00"}x</strong>
                  <p>머리 장비와 카드 효과 반영</p>
                </article>
              </div>
              {profile?.activeCardId ? (
                <div className="powerRankingInventoryGrid">
                  <article className="powerRankingInventoryCard">
                    <div className="powerRankingInventoryVisual">
                      <img
                        src={getCardStageImageUrl(profile.activeCardId, progress.cardLevels[profile.activeCardId] ?? 1)}
                        alt={profile.activeCardName ?? "선택 카드"}
                        className="powerRankingInventoryImage powerRankingCardImage"
                      />
                    </div>
                    <div className="powerRankingInventoryBody">
                      <div className="powerRankingInventoryHeading">
                        <strong>{profile.activeCardName}</strong>
                        <span>{getCardStageLabel(progress.cardLevels[profile.activeCardId] ?? 1)}</span>
                      </div>
                      <p>현재 선택된 카드의 성장 단계 이미지와 레벨 상태입니다.</p>
                    </div>
                  </article>
                </div>
              ) : null}
            </section>

            <section className="powerRankingInventorySection">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Equipment</p>
                  <h2>장착 장비</h2>
                </div>
                <Link to="/dongyeon-equipment" className="powerRankingItemButton">
                  내 장비 이동
                </Link>
              </div>

              <div className="powerRankingInventoryEquippedStrip">
                {(Object.keys(powerRankingEquipmentSlotLabels) as PowerRankingEquipmentSlot[]).map((slot) => {
                  const item = profile?.equippedItems?.[slot];
                  return (
                    <div key={slot} className={`powerRankingInventoryEquippedChip ${item ? "isFilled" : ""}`.trim()}>
                      <strong>{powerRankingEquipmentSlotLabels[slot]}</strong>
                      <span>{item?.name ?? "미착용"}</span>
                    </div>
                  );
                })}
              </div>

              <div className="powerRankingLogCard">
                <strong>현재 적용 중인 효과</strong>
                <ul className="powerRankingLogList">
                  {(profile?.effectBreakdown ?? []).length > 0 ? (
                    profile!.effectBreakdown.map((entry, index) => (
                      <li key={`${entry}-${index}`}>
                        <p>{entry}</p>
                      </li>
                    ))
                  ) : (
                    <li><p>현재 적용 중인 효과가 없습니다.</p></li>
                  )}
                </ul>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HuntingProfilePage;
