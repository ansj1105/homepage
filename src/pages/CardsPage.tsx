import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import MyInfoSubNav from "../components/MyInfoSubNav";
import { useUserAuth } from "../auth/UserAuthContext";
import { useSyncedHuntingProgress } from "../features/hunting/useSyncedHuntingProgress";
import type { CardEntry } from "../types";

const CardsPage = () => {
  const { user } = useUserAuth();
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const { progress, setProgress } = useSyncedHuntingProgress(user?.id);

  useEffect(() => {
    document.title = "카드";
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    apiClient.getCards().then(setCards).catch((error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "카드 목록을 불러오지 못했습니다.");
    });
  }, [user]);

  const handleSelect = async (cardId: string) => {
    try {
      await apiClient.selectCard({ cardId });
      setProgress((current) => (current ? { ...current, selectedCardTargetId: cardId } : current));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "카드를 선택하지 못했습니다.");
    }
  };

  const handleUpgrade = async (cardId: string) => {
    if (!progress || progress.cardSupportPoints < 5) {
      setErrorMessage("응원 포인트가 부족합니다.");
      return;
    }
    try {
      await apiClient.upgradeCard({ cardId, pointCost: 5 });
      setProgress((current) =>
        current
          ? {
              ...current,
              cardSupportPoints: Math.max(0, current.cardSupportPoints - 5),
              cardLevels: {
                ...current.cardLevels,
                [cardId]: (current.cardLevels[cardId] ?? 1) + 1
              }
            }
          : current
      );
      setErrorMessage("카드 레벨을 올렸습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "카드를 성장시키지 못했습니다.");
    }
  };

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <MyInfoSubNav />
        <section className="powerRankingInventorySection">
          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Cards</p>
              <h1>카드 화면</h1>
            </div>
            <p className="powerRankingSectionHint">카드 선택, 인기도 성장, 카드 보너스, 머리 장비 보정 효과를 분리했습니다.</p>
          </div>
          {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
          <div className="powerRankingDashboardGrid">
            <article className="powerRankingDashboardCard">
              <span>현재 선택 카드</span>
              <strong>{cards.find((card) => card.id === progress?.selectedCardTargetId)?.name ?? "미선택"}</strong>
              <p>선택 카드 인기도 성장에 응원 포인트를 사용합니다.</p>
            </article>
            <article className="powerRankingDashboardCard">
              <span>응원 포인트</span>
              <strong>{progress?.cardSupportPoints ?? 0}</strong>
              <p>5포인트마다 카드 인기도를 올릴 수 있습니다.</p>
            </article>
          </div>
          <div className="powerRankingInventoryGrid">
            {cards.map((card) => (
              <article key={card.id} className="powerRankingInventoryCard">
                <div className="powerRankingInventoryBody">
                  <div className="powerRankingInventoryHeading">
                    <strong>{card.name}</strong>
                    <span>{card.grade.toUpperCase()}</span>
                  </div>
                  <p>
                    {card.typeLabel} · 레벨 {progress?.cardLevels[card.id] ?? 1} · 인기도 {(progress?.cardPopularity[card.id] ?? 0) + card.popularity}
                  </p>
                  <div className="powerRankingInventoryTags">
                    <span className="powerRankingInventoryPill">등급 {card.grade}</span>
                    <span className="powerRankingInventoryPill isMuted">{card.bonusSummary}</span>
                  </div>
                  <div className="huntingCombatActions">
                    <button type="button" className="powerRankingItemButton" onClick={() => void handleSelect(card.id)}>선택</button>
                    <button type="button" className="powerRankingItemButton isPositive" onClick={() => void handleUpgrade(card.id)}>인기도 성장</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CardsPage;
