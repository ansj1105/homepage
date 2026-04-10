import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import MyInfoSubNav from "../components/MyInfoSubNav";
import { useUserAuth } from "../auth/UserAuthContext";
import { useSyncedHuntingProgress } from "../features/hunting/useSyncedHuntingProgress";
import type { HuntingConsumableCode, HuntingMaterialCode } from "../features/huntingProgress";
import type { MonsterCollectionEntry, SetCollectionEntry } from "../types";

type SetExchangeRecipe = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  costs: Array<{ code: HuntingMaterialCode; amount: number; label: string }>;
  rewards: Array<{ code: HuntingConsumableCode; amount: number; label: string }>;
};

const CollectionPage = () => {
  const { user } = useUserAuth();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [monsters, setMonsters] = useState<MonsterCollectionEntry[]>([]);
  const [sets, setSets] = useState<SetCollectionEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [equippedCount, setEquippedCount] = useState(0);
  const { progress, setProgress } = useSyncedHuntingProgress(user?.id);

  useEffect(() => {
    document.title = "도감";
  }, []);

  useEffect(() => {
    if (!user) return;
    apiClient
      .getInventory()
      .then((inventory) => setEquippedCount(Object.keys(inventory.equipment.equipped).length))
      .catch(() => undefined);
    apiClient.getEquipmentCollection().then(setEquipment).catch(() => undefined);
    apiClient.getMonsterCollection().then(setMonsters).catch(() => undefined);
    apiClient.getSetCollection().then(setSets).catch((error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "도감 정보를 불러오지 못했습니다.");
    });
  }, [user]);

  const discoveredMonsterCount = progress?.totalDefeated ? Math.min(monsters.length, Math.max(1, Math.floor(progress.totalDefeated / 3))) : 0;
  const setExchangeRecipes = useMemo<SetExchangeRecipe[]>(
    () => [
      {
        id: "honor-knight-cache",
        name: "명예 기사 보급 상자",
        subtitle: "전투형 세트 조각 교환",
        description: "성채에서 모은 세트 조각성 재료를 전투형 소비 아이템으로 바꿉니다.",
        costs: [
          { code: "refined-stone", amount: 4, label: "기사단 세트 조각" },
          { code: "ancient-core", amount: 2, label: "수호자 코어" },
          { code: "club-coin", amount: 260, label: "동연 코인" }
        ],
        rewards: [
          { code: "protection-scroll", amount: 1, label: "보호 주문서" },
          { code: "power-potion", amount: 1, label: "힘의 물약" }
        ]
      },
      {
        id: "golden-harvest-pack",
        name: "황금 수확자 꾸러미",
        subtitle: "파밍형 세트 조각 교환",
        description: "수확자 조각을 드랍 버프와 클릭 회복 아이템으로 교환합니다.",
        costs: [
          { code: "refined-stone", amount: 3, label: "수확자 세트 조각" },
          { code: "ancient-core", amount: 1, label: "희귀 재료" },
          { code: "club-coin", amount: 220, label: "동연 코인" }
        ],
        rewards: [
          { code: "harvest-booster", amount: 2, label: "채집 증폭제" },
          { code: "energy-bar", amount: 2, label: "에너지 바" }
        ]
      },
      {
        id: "starlight-idol-box",
        name: "별빛 아이돌 굿즈 박스",
        subtitle: "카드형 세트 조각 교환",
        description: "도시에서 모은 조각으로 카드 성장 소비 아이템을 제작합니다.",
        costs: [
          { code: "card-shard", amount: 6, label: "아이돌 세트 조각" },
          { code: "ancient-core", amount: 1, label: "바이럴 재료" },
          { code: "club-coin", amount: 300, label: "동연 코인" }
        ],
        rewards: [
          { code: "fan-letter", amount: 2, label: "팬레터" },
          { code: "cheering-stick", amount: 1, label: "응원봉" },
          { code: "viral-ticket", amount: 1, label: "바이럴 티켓" }
        ]
      }
    ],
    []
  );

  const handleExchangeSetRecipe = (recipe: SetExchangeRecipe) => {
    if (!progress) {
      return;
    }
    const hasEnoughMaterials = recipe.costs.every((cost) => (progress.materials[cost.code] ?? 0) >= cost.amount);
    if (!hasEnoughMaterials) {
      setErrorMessage("세트 조각 재료가 부족합니다.");
      return;
    }
    setProgress((current) => {
      if (!current) {
        return current;
      }
      const nextMaterials = { ...current.materials };
      const nextConsumables = { ...current.consumables };
      recipe.costs.forEach((cost) => {
        nextMaterials[cost.code] = Math.max(0, nextMaterials[cost.code] - cost.amount);
      });
      recipe.rewards.forEach((reward) => {
        nextConsumables[reward.code] += reward.amount;
      });
      return {
        ...current,
        materials: nextMaterials,
        consumables: nextConsumables
      };
    });
    setErrorMessage(`${recipe.name} 교환 완료`);
  };

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <MyInfoSubNav />
        <section className="powerRankingInventorySection">
          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Collection</p>
              <h1>도감 / 컬렉션</h1>
            </div>
            <p className="powerRankingSectionHint">몬스터 도감, 장비 수집, 세트 달성 현황을 유지율용 화면으로 분리했습니다.</p>
          </div>
          {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
          <div className="powerRankingDashboardGrid">
            <article className="powerRankingDashboardCard">
              <span>몬스터 도감</span>
              <strong>{discoveredMonsterCount} / {monsters.length}</strong>
              <p>사냥 누적 처치 기반으로 해금됩니다.</p>
            </article>
            <article className="powerRankingDashboardCard">
              <span>장비 수집</span>
              <strong>{equipment.length}</strong>
              <p>전체 장비 카탈로그와 효과를 확인합니다.</p>
            </article>
            <article className="powerRankingDashboardCard">
              <span>세트 달성</span>
              <strong>{equippedCount}</strong>
              <p>세트 유형별 보너스 방향과 현재 달성 상태를 확인합니다.</p>
            </article>
          </div>

          <div className="powerRankingSectionHead"><div><p className="powerRankingSectionEyebrow">Monsters</p><h2>몬스터 도감</h2></div></div>
          <div className="powerRankingInventoryGrid">
            {monsters.map((monster, index) => {
              const discovered = index < discoveredMonsterCount;
              return (
                <article key={monster.id} className="powerRankingInventoryCard">
                  <div className="powerRankingInventoryBody">
                    <div className="powerRankingInventoryHeading">
                      <strong>{discovered ? monster.name : "미발견 몬스터"}</strong>
                      <span>{monster.zoneName}</span>
                    </div>
                    <p>{discovered ? monster.rarityLabel : "더 많은 사냥이 필요합니다."}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="powerRankingSectionHead"><div><p className="powerRankingSectionEyebrow">Equipment</p><h2>장비 수집</h2></div></div>
          <div className="powerRankingInventoryGrid">
            {equipment.map((item) => (
              <article key={item.code} className="powerRankingInventoryCard">
                <div className="powerRankingInventoryBody">
                  <div className="powerRankingInventoryHeading">
                    <strong>{item.name}</strong>
                    <span>{item.slot}</span>
                  </div>
                  <p>{item.effectSummary}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="powerRankingSectionHead"><div><p className="powerRankingSectionEyebrow">Sets</p><h2>세트 달성 현황</h2></div></div>
          <div className="powerRankingInventoryGrid">
            {sets.map((setItem) => (
              <article key={setItem.id} className="powerRankingInventoryCard">
                <div className="powerRankingInventoryBody">
                  <div className="powerRankingInventoryHeading">
                    <strong>{setItem.name}</strong>
                    <span>{setItem.typeLabel ?? "세트"}</span>
                  </div>
                  <p>{setItem.requirement}</p>
                  <div className="powerRankingInventoryTags">
                    <span className="powerRankingInventoryPill">{setItem.bonusSummary}</span>
                    <span className="powerRankingInventoryPill isMuted">{equippedCount >= 2 ? "활성 가능" : "장비 필요"}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Set Exchange</p>
              <h2>세트 조각 교환소</h2>
            </div>
            <p className="powerRankingSectionHint">세트 조각 느낌의 재료를 바로 소비 아이템으로 바꿔서 쓸 수 있습니다.</p>
          </div>
          <div className="powerRankingInventoryGrid">
            {setExchangeRecipes.map((recipe) => {
              const canExchange = progress
                ? recipe.costs.every((cost) => (progress.materials[cost.code] ?? 0) >= cost.amount)
                : false;
              return (
                <article key={recipe.id} className="powerRankingInventoryCard powerRankingSetExchangeCard">
                  <div className="powerRankingInventoryBody">
                    <div className="powerRankingInventoryHeading">
                      <strong>{recipe.name}</strong>
                      <span>{recipe.subtitle}</span>
                    </div>
                    <p>{recipe.description}</p>
                    <div className="powerRankingSetExchangeMeta">
                      <div className="powerRankingSetExchangeBlock">
                        <span>필요 재료</span>
                        <ul className="powerRankingSetExchangeList">
                          {recipe.costs.map((cost) => (
                            <li key={`${recipe.id}-${cost.code}`}>
                              <strong>{cost.label}</strong>
                              <span>{progress?.materials[cost.code] ?? 0} / {cost.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="powerRankingSetExchangeBlock">
                        <span>교환 보상</span>
                        <ul className="powerRankingSetExchangeList">
                          {recipe.rewards.map((reward) => (
                            <li key={`${recipe.id}-${reward.code}`}>
                              <strong>{reward.label}</strong>
                              <span>x{reward.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="powerRankingItemButton isPositive"
                      disabled={!canExchange}
                      onClick={() => handleExchangeSetRecipe(recipe)}
                    >
                      {canExchange ? "세트 조각 교환" : "재료 부족"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CollectionPage;
