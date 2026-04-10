import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import { useUserAuth } from "../auth/UserAuthContext";
import { useSyncedHuntingProgress } from "../features/hunting/useSyncedHuntingProgress";
import type { ShopItem } from "../types";

type ShopTab = "equipment" | "consumables" | "other";

const ShopPage = () => {
  const { user } = useUserAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<ShopTab>("consumables");
  const { progress, setProgress } = useSyncedHuntingProgress(user?.id);

  useEffect(() => {
    document.title = "상점";
  }, []);

  useEffect(() => {
    if (!user) return;
    apiClient.getShopItems().then(setItems).catch((error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "상점 정보를 불러오지 못했습니다.");
    });
  }, [user]);

  const handleBuy = async (item: ShopItem) => {
    if (!progress || progress.materials["club-coin"] < item.priceAmount) {
      setErrorMessage("동연 코인이 부족합니다.");
      return;
    }
    if ((item.nightSnackTicketCost ?? 0) > (progress?.miscItems["night-snack-ticket"] ?? 0)) {
      setErrorMessage("야식 교환권이 부족합니다.");
      return;
    }
    try {
      const result = await apiClient.buyShopItem({ itemId: item.id });
      setProgress(result.progress);
      setErrorMessage(`${item.name} 구매 완료`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "구매하지 못했습니다.");
    }
  };

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (activeTab === "equipment") {
          return item.itemType === "material";
        }
        if (activeTab === "consumables") {
          return item.itemType === "consumable";
        }
        return item.itemType === "misc";
      }),
    [activeTab, items]
  );

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <section className="powerRankingInventorySection">
          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Shop</p>
              <h1>상점 화면</h1>
            </div>
            <p className="powerRankingSectionHint">소비 아이템과 강화 재료를 동연 코인으로 구매합니다.</p>
          </div>
          {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
          <div className="powerRankingDashboardGrid">
            <article className="powerRankingDashboardCard">
              <span>보유 동연 코인</span>
              <strong>{progress?.materials["club-coin"] ?? 0}</strong>
              <p>상점과 강화의 공용 화폐입니다.</p>
            </article>
            <article className="powerRankingDashboardCard">
              <span>보유 야식 교환권</span>
              <strong>{progress?.miscItems["night-snack-ticket"] ?? 0}</strong>
              <p>특수 상품 구매에 같이 쓰는 기타 재화입니다.</p>
            </article>
          </div>
          <div className="huntingSubNav">
            <button
              type="button"
              className={`huntingSubNavLink ${activeTab === "equipment" ? "isActive" : ""}`}
              onClick={() => setActiveTab("equipment")}
            >
              장비
            </button>
            <button
              type="button"
              className={`huntingSubNavLink ${activeTab === "consumables" ? "isActive" : ""}`}
              onClick={() => setActiveTab("consumables")}
            >
              소비
            </button>
            <button
              type="button"
              className={`huntingSubNavLink ${activeTab === "other" ? "isActive" : ""}`}
              onClick={() => setActiveTab("other")}
            >
              기타
            </button>
          </div>
          <div className="powerRankingInventoryGrid">
            {filteredItems.length === 0 ? <article className="powerRankingInventoryEmpty">이 카테고리에는 아직 판매 중인 상품이 없습니다.</article> : null}
            {filteredItems.map((item) => (
              <article key={item.id} className="powerRankingInventoryCard">
                <div className="powerRankingInventoryBody">
                  <div className="powerRankingInventoryHeading">
                    <strong>{item.name}</strong>
                    <span>{item.category ?? (item.itemType === "consumable" ? "소비" : item.itemType === "material" ? "장비/강화" : "기타")}</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="powerRankingInventoryTags">
                    <span className="powerRankingInventoryPill">동연 코인 {item.priceAmount}</span>
                    {item.nightSnackTicketCost ? (
                      <span className="powerRankingInventoryPill">야식 교환권 {item.nightSnackTicketCost}</span>
                    ) : null}
                    <span className="powerRankingInventoryPill isMuted">
                      {item.category ?? (item.itemType === "consumable" ? "소비" : item.itemType === "material" ? "재료" : "기타")}
                    </span>
                  </div>
                  <button type="button" className="powerRankingItemButton isPositive" onClick={() => void handleBuy(item)}>
                    구매
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShopPage;
