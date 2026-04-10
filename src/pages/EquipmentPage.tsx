import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { useUserAuth } from "../auth/UserAuthContext";
import CommunityTopBar from "../components/CommunityTopBar";
import PowerRankingEquipmentCard from "../components/PowerRankingEquipmentCard";
import {
  materialMeta,
  miscMeta
} from "../features/huntingProgress";
import { useSyncedHuntingProgress } from "../features/hunting/useSyncedHuntingProgress";
import { powerRankingEquipmentSlotLabels } from "../data/powerRankingEquipment";
import type {
  PowerRankingEquipmentCode,
  PowerRankingEquipmentInventoryItem,
  PowerRankingEquipmentSlot,
  PowerRankingEquippedItem,
  PowerRankingInventoryItem,
  PowerRankingPeriod,
  PowerRankingPerson
} from "../types";

const slotOrder: PowerRankingEquipmentSlot[] = ["head", "weapon", "top", "gloves", "bottom", "shoes"];
type EquipmentInventoryTab = "equipment" | "consumables" | "other";

const slotLayout: Record<
  PowerRankingEquipmentSlot,
  {
    className: string;
    label: string;
  }
> = {
  head: { className: "isHead", label: "머리" },
  weapon: { className: "isWeapon", label: "무기" },
  top: { className: "isTop", label: "상의" },
  gloves: { className: "isGloves", label: "장갑" },
  bottom: { className: "isBottom", label: "하의" },
  shoes: { className: "isShoes", label: "신발" }
};

const huntingResourceVisualMap: Record<
  string,
  {
    icon: string;
    toneClass: string;
  }
> = {
  "club-coin": { icon: "DY", toneClass: "isCoin" },
  gem: { icon: "GM", toneClass: "isGem" },
  "enhancement-stone": { icon: "강", toneClass: "isStone" },
  "refined-stone": { icon: "고", toneClass: "isRefined" },
  "ancient-core": { icon: "핵", toneClass: "isCore" },
  "card-shard": { icon: "카", toneClass: "isShard" },
  "event-token": { icon: "토", toneClass: "isToken" },
  "healing-potion": { icon: "HP", toneClass: "isPotion" },
  "medium-healing-potion": { icon: "H+", toneClass: "isPotion" },
  "power-potion": { icon: "AT", toneClass: "isBuff" },
  "berserk-tonic": { icon: "BR", toneClass: "isBuff" },
  "lucky-scroll": { icon: "LU", toneClass: "isScroll" },
  "harvest-booster": { icon: "HB", toneClass: "isScroll" },
  "energy-bar": { icon: "EN", toneClass: "isEnergy" },
  "energy-drink": { icon: "ED", toneClass: "isEnergy" },
  "fan-letter": { icon: "팬", toneClass: "isCard" },
  "cheering-stick": { icon: "응", toneClass: "isCard" },
  "viral-ticket": { icon: "바", toneClass: "isCard" },
  "protection-scroll": { icon: "보", toneClass: "isScroll" },
  "night-snack-ticket": { icon: "야", toneClass: "isToken" },
  "festival-exchange-coupon": { icon: "축", toneClass: "isToken" }
};

const EquipmentPage = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [activeTab, setActiveTab] = useState<EquipmentInventoryTab>("equipment");
  const [equipmentInventory, setEquipmentInventory] = useState<PowerRankingEquipmentInventoryItem[]>([]);
  const [itemInventory, setItemInventory] = useState<PowerRankingInventoryItem[]>([]);
  const [rankingPeople, setRankingPeople] = useState<PowerRankingPerson[]>([]);
  const [selectedItemTargetId, setSelectedItemTargetId] = useState("");
  const [itemUsePeriod, setItemUsePeriod] = useState<PowerRankingPeriod>("all");
  const [equippedItems, setEquippedItems] = useState<
    Partial<Record<PowerRankingEquipmentSlot, PowerRankingEquippedItem>>
  >({});
  const [errorMessage, setErrorMessage] = useState("");
  const [submittingCode, setSubmittingCode] = useState<string | null>(null);
  const [submittingSlot, setSubmittingSlot] = useState<PowerRankingEquipmentSlot | null>(null);
  const [usingItemCode, setUsingItemCode] = useState<string | null>(null);
  const { progress, isHydrated } = useSyncedHuntingProgress(user?.id);

  useEffect(() => {
    document.title = "내 장비";
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/dongyeon-login");
      return;
    }

    apiClient
      .getInventory()
      .then((payload) => {
        setEquipmentInventory(payload.equipment.inventory);
        setEquippedItems(payload.equipment.equipped);
        setItemInventory(payload.consumables);
        setErrorMessage("");
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "장비 정보를 불러오지 못했습니다.");
      });

    apiClient
      .getPowerRanking("all")
      .then((people) => {
        setRankingPeople(people);
        setSelectedItemTargetId((current) => current || people[0]?.id || "");
      })
      .catch(() => {
        // Ignore ranking target fetch failure here; page remains usable.
      });
  }, [navigate, user]);

  const handleEquip = async (equipmentCode: PowerRankingEquipmentCode) => {
    setSubmittingCode(equipmentCode);
    try {
      const equipment = await apiClient.equipPowerRankingEquipment({ equipmentCode });
      setEquipmentInventory(equipment.inventory);
      setEquippedItems(equipment.equipped);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "장비를 착용하지 못했습니다.");
    } finally {
      setSubmittingCode(null);
    }
  };

  const handleUnequip = async (slot: PowerRankingEquipmentSlot) => {
    setSubmittingSlot(slot);
    try {
      const equipment = await apiClient.unequipEquipment({ slot });
      setEquipmentInventory(equipment.inventory);
      setEquippedItems(equipment.equipped);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "장비를 해제하지 못했습니다.");
    } finally {
      setSubmittingSlot(null);
    }
  };

  const handleUseItem = async (itemCode: string) => {
    if (!selectedItemTargetId) {
      setErrorMessage("소비 아이템을 사용할 대상을 먼저 선택해주세요.");
      return;
    }

    setUsingItemCode(itemCode);
    try {
      const result = await apiClient.usePowerRankingItem({
        personId: selectedItemTargetId,
        itemCode: itemCode as PowerRankingInventoryItem["code"],
        period: itemUsePeriod
      });
      setItemInventory(result.inventory);
      setRankingPeople((current) =>
        current.map((person) => (person.id === result.person.id ? result.person : person))
      );
      setErrorMessage(`${result.usedItem.name} 사용 완료 · ${result.person.name} ${result.appliedDelta > 0 ? `+${result.appliedDelta}` : result.appliedDelta}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "소비 아이템을 사용하지 못했습니다.");
    } finally {
      setUsingItemCode(null);
    }
  };

  const activeEffects = useMemo(() => {
    let upDelta = 1;
    let downDelta = -1;
    let blanketDelta = -100;
    let loveDelta = 100;
    let consumableDropBonus = 0;
    let equipmentDropBonus = 0;
    const summaries: string[] = [];

    const equippedList = Object.values(equippedItems);
    for (const item of equippedList) {
      switch (item.code) {
        case "crown-of-cheers":
          upDelta *= 2;
          summaries.push("올리기 x2");
          break;
        case "commander-jacket":
          upDelta += 1;
          summaries.push("올리기 +1");
          break;
        case "midnight-slacks":
          downDelta *= 2;
          summaries.push("내리기 x2");
          break;
        case "wave-denim":
          downDelta -= 1;
          summaries.push("내리기 -1 추가");
          break;
        case "titan-gauntlet":
          upDelta += 1;
          downDelta -= 1;
          summaries.push("올리기/내리기 절대값 +1");
          break;
        case "golden-harness":
          blanketDelta -= 20;
          loveDelta += 20;
          summaries.push("소비 아이템 위력 +20");
          break;
        case "silk-gloves":
          blanketDelta -= 10;
          loveDelta += 10;
          summaries.push("소비 아이템 위력 +10");
          break;
        case "mint-beret":
          consumableDropBonus += 1.5;
          summaries.push("소비 아이템 드롭률 +1.5%");
          break;
        case "ribbon-cardigan":
          consumableDropBonus += 1;
          equipmentDropBonus += 1;
          summaries.push("소비/장비 드롭률 +1%");
          break;
        case "aurora-skirt":
          equipmentDropBonus += 1.5;
          summaries.push("장비 드롭률 +1.5%");
          break;
        case "crystal-sneakers":
          consumableDropBonus += 1;
          summaries.push("소비 아이템 드롭률 +1%");
          break;
        case "ember-heels":
          equipmentDropBonus += 1;
          summaries.push("장비 드롭률 +1%");
          break;
        case "pulse-gloves":
          consumableDropBonus += 0.8;
          equipmentDropBonus += 0.8;
          summaries.push("소비/장비 드롭률 +0.8%");
          break;
        case "star-visor":
        case "thunder-boots":
          summaries.push("하루 첫 반영 +5");
          break;
        default:
          break;
      }
    }

    return {
      upDelta,
      downDelta,
      blanketDelta,
      loveDelta,
      consumableDropBonus,
      equipmentDropBonus,
      summaries
    };
  }, [equippedItems]);

  const otherItems = useMemo(
    () =>
      progress
        ? [
            ...(Object.keys(materialMeta) as Array<keyof typeof materialMeta>).map((code) => ({
              code,
              name: materialMeta[code].name,
              description: materialMeta[code].description,
              quantity: progress.materials[code]
            })),
            ...(Object.keys(miscMeta) as Array<keyof typeof miscMeta>).map((code) => ({
              code,
              name: miscMeta[code].name,
              description: miscMeta[code].description,
              quantity: progress.miscItems[code]
            }))
          ]
        : [],
    [progress]
  );

  const equippedCodes = useMemo(
    () =>
      new Set(
        Object.values(equippedItems)
          .map((equipped) => equipped?.code)
          .filter((code): code is PowerRankingEquipmentCode => Boolean(code))
      ),
    [equippedItems]
  );

  const equippedCardItems = useMemo(
    () => slotOrder.map((slot) => equippedItems[slot]).filter((item): item is PowerRankingEquippedItem => Boolean(item)),
    [equippedItems]
  );

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar
          equipmentInventory={equipmentInventory}
          equippedItems={equippedItems}
          onEquipEquipment={handleEquip}
          equipSubmittingCode={submittingCode}
        />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Equipment Room</p>
            <h1>내 장비</h1>
            <p className="powerRankingLead">
              사람 기준으로 어느 부위에 무엇을 끼고 있는지 바로 보고, 장착 효과가 파워랭킹에 어떻게 반영되는지 같이 확인합니다.
            </p>
          </div>
        </header>

        <section className="powerRankingInventorySection equipmentPageOverviewSection">
          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Equipped Layout</p>
              <h2>착용 현황</h2>
            </div>
            <p className="powerRankingSectionHint">현재 착용 장비와 파워랭킹 반영 수치를 함께 보여줍니다.</p>
          </div>

          {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
          {!isHydrated ? <div className="powerRankingLoading">장비 진행도를 불러오는 중입니다.</div> : null}

          <div className="equipmentPageOverviewGrid">
            <section className="equipmentPageAvatarPanel">
              <div className="equipmentPageAvatarBoard">
                <div className="equipmentPageAvatarFigure" aria-hidden="true">
                  <div className="equipmentPageAvatarHead" />
                  <div className="equipmentPageAvatarTorso" />
                  <div className="equipmentPageAvatarArm isLeft" />
                  <div className="equipmentPageAvatarArm isRight" />
                  <div className="equipmentPageAvatarLeg isLeft" />
                  <div className="equipmentPageAvatarLeg isRight" />
                </div>

                {slotOrder.map((slot) => {
                  const equipped = equippedItems[slot];
                  const layout = slotLayout[slot];
                  return (
                    <article key={slot} className={`equipmentPageSlotCard ${layout.className}`.trim()}>
                      <span>{layout.label}</span>
                      {equipped ? (
                        <div className="equipmentPageSlotItem">
                          <img src={equipped.imageUrl} alt={equipped.name} />
                          <strong>{equipped.name}</strong>
                          <small>{equipped.effectSummary}</small>
                          <button
                            type="button"
                            className="powerRankingItemButton"
                            disabled={submittingSlot === slot}
                            onClick={() => void handleUnequip(slot)}
                          >
                            {submittingSlot === slot ? "해제 중..." : "해제"}
                          </button>
                        </div>
                      ) : (
                        <p>미착용</p>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="equipmentPageEffectPanel">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Applied Effects</p>
                  <h2>실제 적용 효과</h2>
                </div>
              </div>

              <div className="equipmentPageEffectGrid">
                <article className="powerRankingDashboardCard">
                  <span>올리기</span>
                  <strong>{activeEffects.upDelta > 0 ? `+${activeEffects.upDelta}` : activeEffects.upDelta}</strong>
                  <p>기본 올리기 반영 수치</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>내리기</span>
                  <strong>{activeEffects.downDelta}</strong>
                  <p>기본 내리기 반영 수치</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>박병준의 담요</span>
                  <strong>{activeEffects.blanketDelta}</strong>
                  <p>현재 사용 시 반영되는 실제 수치</p>
                </article>
                <article className="powerRankingDashboardCard">
                  <span>서은택의 사랑</span>
                  <strong>{`+${activeEffects.loveDelta}`}</strong>
                  <p>현재 사용 시 반영되는 실제 수치</p>
                </article>
              </div>

              <div className="equipmentPageEffectSummary">
                <div className="equipmentPageEffectStat">
                  <strong>소비 아이템 드롭률</strong>
                  <span>{activeEffects.consumableDropBonus > 0 ? `+${activeEffects.consumableDropBonus.toFixed(1)}%` : "추가 없음"}</span>
                </div>
                <div className="equipmentPageEffectStat">
                  <strong>장비 드롭률</strong>
                  <span>{activeEffects.equipmentDropBonus > 0 ? `+${activeEffects.equipmentDropBonus.toFixed(1)}%` : "추가 없음"}</span>
                </div>
              </div>

              <div className="equipmentPageEffectList">
                <strong>활성 효과 요약</strong>
                {activeEffects.summaries.length === 0 ? (
                  <p>아직 적용 중인 장비 효과가 없습니다.</p>
                ) : (
                  <ul className="powerRankingEquipmentEnhancementList">
                    {activeEffects.summaries.map((summary, index) => (
                      <li key={`${summary}-${index}`}>
                        <span>{index + 1}</span>
                        <strong>{summary}</strong>
                        <small>현재 착용 기준 적용 중</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="gameHomeQuickGrid">
                <Link to="/dongyeon-inventory" className="powerRankingItemButton gameHomeQuickLink">
                  인벤토리 이동
                </Link>
                <Link to="/dongyeon-equipment-enhancement" className="powerRankingItemButton gameHomeQuickLink">
                  강화 화면 이동
                </Link>
              </div>
            </section>
          </div>
        </section>

        <section className="powerRankingInventorySection">
          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Equipment Inventory</p>
              <h2>인벤토리</h2>
            </div>
            <p className="powerRankingSectionHint">장비 페이지 안에서 장비, 소비, 기타 아이템을 함께 확인합니다.</p>
          </div>

          <div className="huntingSubNav">
            <button type="button" className={`huntingSubNavLink ${activeTab === "equipment" ? "isActive" : ""}`} onClick={() => setActiveTab("equipment")}>장비</button>
            <button type="button" className={`huntingSubNavLink ${activeTab === "consumables" ? "isActive" : ""}`} onClick={() => setActiveTab("consumables")}>소비</button>
            <button type="button" className={`huntingSubNavLink ${activeTab === "other" ? "isActive" : ""}`} onClick={() => setActiveTab("other")}>기타</button>
          </div>

          {activeTab === "equipment" ? (
            <>
              <div className="powerRankingInventoryEquippedStrip">
                {(Object.keys(powerRankingEquipmentSlotLabels) as PowerRankingEquipmentSlot[]).map((slot) => {
                  const equipped = equippedItems[slot];
                  return (
                    <div key={slot} className={`powerRankingInventoryEquippedChip ${equipped ? "isFilled" : ""}`.trim()}>
                      <strong>{powerRankingEquipmentSlotLabels[slot]}</strong>
                      <span>{equipped ? equipped.name : "미착용"}</span>
                    </div>
                  );
                })}
              </div>

              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Now Equipped</p>
                  <h2>장착 중 장비</h2>
                </div>
                <p className="powerRankingSectionHint">현재 장착된 장비를 카드 형태로 다시 보여줍니다.</p>
              </div>

              <div className="powerRankingInventoryGrid">
                {equippedCardItems.length === 0 ? (
                  <article className="powerRankingInventoryEmpty">현재 장착 중인 장비가 없습니다.</article>
                ) : (
                  equippedCardItems.map((item) => (
                    <PowerRankingEquipmentCard
                      key={`equipped-${item.code}`}
                      item={{ ...item, quantity: 1, createdAt: item.equippedAt }}
                      isEquipped
                    />
                  ))
                )}
              </div>

              <div className="powerRankingInventoryGrid">
                {equipmentInventory.length === 0 ? (
                  <article className="powerRankingInventoryEmpty">보유 장비가 없습니다.</article>
                ) : (
                  equipmentInventory.map((item) => (
                    <PowerRankingEquipmentCard
                      key={item.code}
                      item={item}
                      onEquipEquipment={handleEquip}
                      equipSubmittingCode={submittingCode}
                      isEquipped={equippedCodes.has(item.code)}
                    />
                  ))
                )}
              </div>
            </>
          ) : null}

          {activeTab === "consumables" ? (
            <>
              <div className="equipmentPageUsePanel">
                <div className="equipmentPageUseField">
                  <span>대상</span>
                  <select value={selectedItemTargetId} onChange={(event) => setSelectedItemTargetId(event.target.value)}>
                    {rankingPeople.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="equipmentPageUseField">
                  <span>기간</span>
                  <select value={itemUsePeriod} onChange={(event) => setItemUsePeriod(event.target.value as PowerRankingPeriod)}>
                    <option value="all">전체</option>
                    <option value="weekly">주간</option>
                    <option value="daily">일간</option>
                  </select>
                </div>
              </div>

              <div className="powerRankingInventoryGrid">
                {itemInventory.length === 0 ? (
                  <article className="powerRankingInventoryEmpty">보유 중인 소비 아이템이 없습니다.</article>
                ) : (
                  itemInventory.map((item) => {
                    const canUseDirectly =
                      item.code === "byeokbangjun-blanket" || item.code === "seoeuntaek-love" || item.code === "kimdaseul-blessing";

                    return (
                      <article key={item.code} className="powerRankingInventoryCard">
                        <div className="powerRankingInventoryVisual">
                          <img src={item.imageUrl} alt={item.name} className="powerRankingInventoryImage" />
                          <span className="powerRankingInventoryBadge">x{item.quantity}</span>
                        </div>
                        <div className="powerRankingInventoryBody">
                          <div className="powerRankingInventoryHeading">
                            <strong>{item.name}</strong>
                            <span>보유 중</span>
                          </div>
                          <p>{item.description}</p>
                          <div className="powerRankingInventoryTags">
                            {canUseDirectly ? (
                              <span className="powerRankingInventoryPill isEquipped">대상 선택 후 즉시 사용 가능</span>
                            ) : (
                              <span className="powerRankingInventoryPill isMuted">이 아이템은 자동 소모 또는 별도 화면에서 사용됩니다.</span>
                            )}
                          </div>
                          {canUseDirectly ? (
                            <button
                              type="button"
                              className="powerRankingItemButton isPositive"
                              disabled={item.quantity < 1 || usingItemCode === item.code || !selectedItemTargetId}
                              onClick={() => void handleUseItem(item.code)}
                            >
                              {usingItemCode === item.code ? "사용 중..." : "이 아이템 사용"}
                            </button>
                          ) : null}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </>
          ) : null}

          {activeTab === "other" ? (
            <div className="powerRankingInventoryGrid">
              {otherItems.length === 0 ? (
                <article className="powerRankingInventoryEmpty">보유 중인 기타 아이템이 없습니다.</article>
              ) : (
                otherItems.map((item) => (
                  <article key={item.code} className="powerRankingInventoryCard">
                    <div className="powerRankingInventoryVisual">
                      <div
                        className={`powerRankingResourceIcon ${huntingResourceVisualMap[item.code]?.toneClass ?? ""}`.trim()}
                      >
                        {huntingResourceVisualMap[item.code]?.icon ?? "IT"}
                      </div>
                      <span className="powerRankingInventoryBadge">x{item.quantity}</span>
                    </div>
                    <div className="powerRankingInventoryBody">
                      <div className="powerRankingInventoryHeading">
                        <strong>{item.name}</strong>
                        <span>보유 {item.quantity}</span>
                      </div>
                      <p>{item.description}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default EquipmentPage;
