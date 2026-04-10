import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import MyInfoSubNav from "../components/MyInfoSubNav";
import { useUserAuth } from "../auth/UserAuthContext";
import { powerRankingEquipmentRarityLabels } from "../data/powerRankingEquipment";
import { getBrowserAlertDisabled } from "../features/alertPreference";
import { useSyncedHuntingProgress } from "../features/hunting/useSyncedHuntingProgress";
import type { HuntingConsumableCode, HuntingMaterialCode, HuntingMiscCode } from "../features/huntingProgress";
import type { MonsterCollectionEntry, PowerRankingEquipmentRarity, SetCollectionEntry } from "../types";

type CollectionTab = "monsters" | "equipment" | "sets" | "exchange";
type SetExchangeRecipe = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  costs: Array<{ code: HuntingMaterialCode; amount: number; label: string }>;
  rewards: Array<
    | { inventoryType: "consumable"; code: HuntingConsumableCode; amount: number; label: string }
    | { inventoryType: "misc"; code: HuntingMiscCode; amount: number; label: string }
  >;
};

const COLLECTION_PAGE_SIZE = 6;

const setVisualMap: Record<
  string,
  {
    imageUrl: string;
    flavor: string;
  }
> = {
  "balanced-freshman": {
    imageUrl: "/assets/equipment/mint-beret.svg",
    flavor: "입문 사냥터를 돌며 장비와 드랍을 균형 있게 챙기는 초심자용 세트입니다."
  },
  "honor-knight": {
    imageUrl: "/assets/equipment/commander-jacket.svg",
    flavor: "성채 계열 장비를 중심으로 화력을 끌어올리는 전투 특화 세트입니다."
  },
  "golden-harvester": {
    imageUrl: "/assets/equipment/golden-harness.svg",
    flavor: "재료와 골드를 더 많이 끌어오는 파밍 루프용 세트입니다."
  },
  "starlight-idol": {
    imageUrl: "/assets/equipment/star-visor.svg",
    flavor: "카드 성장과 응원 포인트 수급을 밀어주는 카드 성장형 세트입니다."
  },
  "gale-chaser": {
    imageUrl: "/assets/equipment/crystal-sneakers.svg",
    flavor: "클릭 여유와 자동 사냥 템포를 보정하는 속도형 세트입니다."
  }
};

const getPageSlice = <T,>(items: T[], page: number, pageSize: number) => {
  const safePage = Math.max(1, Math.min(page, Math.max(1, Math.ceil(items.length / pageSize))));
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    items: items.slice(start, start + pageSize)
  };
};

const CollectionPage = () => {
  const { user } = useUserAuth();
  const [activeTab, setActiveTab] = useState<CollectionTab>("monsters");
  const [currentPage, setCurrentPage] = useState(1);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [monsters, setMonsters] = useState<MonsterCollectionEntry[]>([]);
  const [sets, setSets] = useState<SetCollectionEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [exchangeResultModal, setExchangeResultModal] = useState<{ title: string; message: string } | null>(null);
  const [equippedCount, setEquippedCount] = useState(0);
  const { progress, setProgress } = useSyncedHuntingProgress(user?.id);

  useEffect(() => {
    document.title = "도감";
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
          { inventoryType: "consumable", code: "protection-scroll", amount: 1, label: "보호 주문서" },
          { inventoryType: "consumable", code: "power-potion", amount: 1, label: "힘의 물약" }
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
          { inventoryType: "consumable", code: "harvest-booster", amount: 2, label: "채집 증폭제" },
          { inventoryType: "consumable", code: "energy-bar", amount: 2, label: "에너지 바" }
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
          { inventoryType: "consumable", code: "fan-letter", amount: 2, label: "팬레터" },
          { inventoryType: "consumable", code: "cheering-stick", amount: 1, label: "응원봉" },
          { inventoryType: "consumable", code: "viral-ticket", amount: 1, label: "바이럴 티켓" }
        ]
      },
      {
        id: "festival-promo-cache",
        name: "대동제 홍보 꾸러미",
        subtitle: "이벤트형 세트 조각 교환",
        description: "응원용 세트 조각을 축제용 교환권과 클릭 회복 아이템으로 돌려받습니다.",
        costs: [
          { code: "card-shard", amount: 4, label: "무대 조각" },
          { code: "event-token", amount: 2, label: "이벤트 토큰" },
          { code: "club-coin", amount: 180, label: "동연 코인" }
        ],
        rewards: [
          { inventoryType: "misc", code: "festival-exchange-coupon", amount: 1, label: "축제 교환권" },
          { inventoryType: "consumable", code: "energy-bar", amount: 1, label: "에너지 바" }
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
      const nextMiscItems = { ...current.miscItems };
      recipe.costs.forEach((cost) => {
        nextMaterials[cost.code] = Math.max(0, nextMaterials[cost.code] - cost.amount);
      });
      recipe.rewards.forEach((reward) => {
        if (reward.inventoryType === "consumable") {
          nextConsumables[reward.code] += reward.amount;
          return;
        }
        nextMiscItems[reward.code] += reward.amount;
      });
      return {
        ...current,
        materials: nextMaterials,
        consumables: nextConsumables,
        miscItems: nextMiscItems
      };
    });
    setErrorMessage(`${recipe.name} 교환 완료`);
    if (!getBrowserAlertDisabled()) {
      setExchangeResultModal({
        title: "교환에 성공했습니다.",
        message: `${recipe.name} 교환이 완료되었습니다. 보상은 인벤토리에서 바로 확인할 수 있습니다.`
      });
    }
  };

  const monsterCards = monsters.map((monster, index) => {
    const discovered = index < discoveredMonsterCount;
    return {
      id: monster.id,
      imageUrl: monster.imageUrl,
      title: discovered ? monster.name : "미발견 몬스터",
      subtitle: monster.zoneName,
      description: discovered ? monster.rarityLabel : "더 많은 사냥이 필요합니다.",
      tag: discovered ? "발견 완료" : "미발견",
      hidden: !discovered
    };
  });

  const equipmentCards = equipment.map((item) => ({
    id: item.code,
    imageUrl: item.imageUrl,
    title: item.name,
    subtitle: `${item.slot} · ${powerRankingEquipmentRarityLabels[(item.rarity ?? "common") as PowerRankingEquipmentRarity]}`,
    description: item.effectSummary,
    tag: item.setName ?? "장비 효과"
  }));

  const setCards = sets.map((setItem) => ({
    id: setItem.id,
    imageUrl: setVisualMap[setItem.id]?.imageUrl ?? "/assets/equipment/crown-of-cheers.svg",
    title: setItem.name,
    subtitle: setItem.typeLabel ?? "세트",
    description: setVisualMap[setItem.id]?.flavor ?? setItem.requirement,
    requirement: setItem.requirement,
    bonusSummary: setItem.bonusSummary
  }));

  const pagedMonsterCards = getPageSlice(monsterCards, currentPage, COLLECTION_PAGE_SIZE);
  const pagedEquipmentCards = getPageSlice(equipmentCards, currentPage, COLLECTION_PAGE_SIZE);
  const pagedSetCards = getPageSlice(setCards, currentPage, COLLECTION_PAGE_SIZE);
  const pagedExchangeCards = getPageSlice(setExchangeRecipes, currentPage, 3);

  const activePagination = (() => {
    if (activeTab === "monsters") return { page: pagedMonsterCards.page, totalPages: pagedMonsterCards.totalPages };
    if (activeTab === "equipment") return { page: pagedEquipmentCards.page, totalPages: pagedEquipmentCards.totalPages };
    if (activeTab === "sets") return { page: pagedSetCards.page, totalPages: pagedSetCards.totalPages };
    return { page: pagedExchangeCards.page, totalPages: pagedExchangeCards.totalPages };
  })();

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
          <div className="huntingSubNav">
            <button type="button" className={`huntingSubNavLink ${activeTab === "monsters" ? "isActive" : ""}`} onClick={() => setActiveTab("monsters")}>몬스터 도감</button>
            <button type="button" className={`huntingSubNavLink ${activeTab === "equipment" ? "isActive" : ""}`} onClick={() => setActiveTab("equipment")}>장비 도감</button>
            <button type="button" className={`huntingSubNavLink ${activeTab === "sets" ? "isActive" : ""}`} onClick={() => setActiveTab("sets")}>세트 효과</button>
            <button type="button" className={`huntingSubNavLink ${activeTab === "exchange" ? "isActive" : ""}`} onClick={() => setActiveTab("exchange")}>세트 교환소</button>
          </div>

          {activeTab === "monsters" ? (
            <>
              <div className="powerRankingSectionHead"><div><p className="powerRankingSectionEyebrow">Monsters</p><h2>몬스터 도감</h2></div></div>
              <div className="powerRankingInventoryGrid powerRankingCollectionCardGrid">
                {pagedMonsterCards.items.map((monster) => (
                  <article key={monster.id} className={`powerRankingInventoryCard powerRankingCollectionCard ${monster.hidden ? "isHidden" : ""}`.trim()}>
                    <div className="powerRankingInventoryVisual">
                      <img src={monster.imageUrl} alt={monster.title} className="powerRankingInventoryImage" />
                      <span className="powerRankingInventoryBadge">{monster.tag}</span>
                    </div>
                    <div className="powerRankingInventoryBody">
                      <div className="powerRankingInventoryHeading">
                        <strong>{monster.title}</strong>
                        <span>{monster.subtitle}</span>
                      </div>
                      <p>{monster.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {activeTab === "equipment" ? (
            <>
              <div className="powerRankingSectionHead"><div><p className="powerRankingSectionEyebrow">Equipment</p><h2>장비 도감</h2></div></div>
              <div className="powerRankingInventoryGrid powerRankingCollectionCardGrid">
                {pagedEquipmentCards.items.map((item) => (
                  <article key={item.id} className="powerRankingInventoryCard powerRankingCollectionCard">
                    <div className="powerRankingInventoryVisual">
                      <img src={item.imageUrl} alt={item.title} className="powerRankingInventoryImage" />
                      <span className="powerRankingInventoryBadge">{item.subtitle}</span>
                    </div>
                    <div className="powerRankingInventoryBody">
                      <div className="powerRankingInventoryHeading">
                        <strong>{item.title}</strong>
                        <span>{item.subtitle}</span>
                      </div>
                      <p>{item.description}</p>
                      <div className="powerRankingInventoryTags">
                        <span className="powerRankingInventoryPill">효과</span>
                        <span className="powerRankingInventoryPill isMuted">{item.description}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {activeTab === "sets" ? (
            <>
              <div className="powerRankingSectionHead"><div><p className="powerRankingSectionEyebrow">Sets</p><h2>세트 효과</h2></div></div>
              <div className="powerRankingInventoryGrid powerRankingCollectionCardGrid">
                {pagedSetCards.items.map((setItem) => (
                  <article key={setItem.id} className="powerRankingInventoryCard powerRankingCollectionCard">
                    <div className="powerRankingInventoryVisual">
                      <img src={setItem.imageUrl} alt={setItem.title} className="powerRankingInventoryImage" />
                      <span className="powerRankingInventoryBadge">{setItem.subtitle}</span>
                    </div>
                    <div className="powerRankingInventoryBody">
                      <div className="powerRankingInventoryHeading">
                        <strong>{setItem.title}</strong>
                        <span>{setItem.subtitle}</span>
                      </div>
                      <p>{setItem.description}</p>
                      <div className="powerRankingInventoryTags">
                        <span className="powerRankingInventoryPill">{setItem.requirement}</span>
                        <span className="powerRankingInventoryPill isMuted">{setItem.bonusSummary}</span>
                        <span className="powerRankingInventoryPill isMuted">{equippedCount >= 2 ? "활성 가능" : "장비 필요"}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {activeTab === "exchange" ? (
            <>
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Set Exchange</p>
                  <h2>세트 조각 교환소</h2>
                </div>
                <p className="powerRankingSectionHint">세트 조각 느낌의 재료를 바로 소비 아이템으로 바꿔서 쓸 수 있습니다.</p>
              </div>
              <div className="powerRankingInventoryGrid">
                {pagedExchangeCards.items.map((recipe) => {
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
            </>
          ) : null}

          <div className="powerRankingCollectionPagination">
            <button
              type="button"
              className="powerRankingItemButton"
              disabled={activePagination.page <= 1}
              onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
            >
              이전
            </button>
            <span>
              {activePagination.page} / {activePagination.totalPages}
            </span>
            <button
              type="button"
              className="powerRankingItemButton"
              disabled={activePagination.page >= activePagination.totalPages}
              onClick={() => setCurrentPage((current) => Math.min(activePagination.totalPages, current + 1))}
            >
              다음
            </button>
          </div>
        </section>
        {exchangeResultModal ? (
          <div className="powerRankingResultModalBackdrop" role="presentation" onClick={() => setExchangeResultModal(null)}>
            <section
              className="powerRankingResultModal isSuccess"
              role="dialog"
              aria-modal="true"
              aria-labelledby="collection-exchange-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="powerRankingResultModalVisual">
                <img src="/assets/shops/campus-shopkeeper.svg" alt="교환소 NPC" className="powerRankingResultModalNpcImage" />
              </div>
              <div className="powerRankingResultModalBody">
                <h2 id="collection-exchange-modal-title">{exchangeResultModal.title}</h2>
                <p>동연 상점지기 민트</p>
                <p>{exchangeResultModal.message}</p>
                <button type="button" className="powerRankingItemButton isPositive" onClick={() => setExchangeResultModal(null)}>
                  확인
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CollectionPage;
