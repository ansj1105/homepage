import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import { useUserAuth } from "../auth/UserAuthContext";
import { useSyncedHuntingProgress } from "../features/hunting/useSyncedHuntingProgress";
import type { ShopItem } from "../types";

const ShopPage = () => {
  const { user } = useUserAuth();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
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
    try {
      await apiClient.buyShopItem({ itemId: item.id });
      setProgress((current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          materials: {
            ...current.materials,
            "club-coin": current.materials["club-coin"] - item.priceAmount,
            ...(item.itemType === "material"
              ? { [item.code]: current.materials[item.code as keyof typeof current.materials] + 1 }
              : {})
          },
          miscItems:
            item.itemType === "misc"
              ? {
                  ...current.miscItems,
                  [item.code]: current.miscItems[item.code as keyof typeof current.miscItems] + 1
                }
              : current.miscItems,
          consumables:
            item.itemType === "consumable"
              ? {
                  ...current.consumables,
                  [item.code]: current.consumables[item.code as keyof typeof current.consumables] + 1
                }
              : current.consumables
        };
      });
      setErrorMessage(`${item.name} 구매 완료`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "구매하지 못했습니다.");
    }
  };

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
          </div>
          <div className="powerRankingInventoryGrid">
            {items.map((item) => (
              <article key={item.id} className="powerRankingInventoryCard">
                <div className="powerRankingInventoryBody">
                  <div className="powerRankingInventoryHeading">
                    <strong>{item.name}</strong>
                    <span>{item.category ?? (item.itemType === "consumable" ? "소비" : "재료")}</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="powerRankingInventoryTags">
                    <span className="powerRankingInventoryPill">가격 {item.priceAmount}</span>
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
