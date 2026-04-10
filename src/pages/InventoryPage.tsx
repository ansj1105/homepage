import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import PowerRankingEquipmentCard from "../components/PowerRankingEquipmentCard";
import { useUserAuth } from "../auth/UserAuthContext";
import {
  miscMeta,
  materialMeta
} from "../features/huntingProgress";
import { useSyncedHuntingProgress } from "../features/hunting/useSyncedHuntingProgress";
import { powerRankingEquipmentSlotLabels } from "../data/powerRankingEquipment";
import type {
  PowerRankingEquipmentCode,
  PowerRankingEquipmentSlot,
  PowerRankingInventoryItem
} from "../types";

type InventoryTab = "equipment" | "consumables" | "other";

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

const InventoryPage = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [activeTab, setActiveTab] = useState<InventoryTab>("equipment");
  const [equipmentInventory, setEquipmentInventory] = useState<any[]>([]);
  const [equippedItems, setEquippedItems] = useState<Record<string, any>>({});
  const [itemInventory, setItemInventory] = useState<PowerRankingInventoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittingCode, setSubmittingCode] = useState<string | null>(null);
  const { progress, setProgress, isHydrated } = useSyncedHuntingProgress(user?.id);

  useEffect(() => {
    document.title = "인벤토리";
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
        setErrorMessage(error instanceof Error ? error.message : "인벤토리를 불러오지 못했습니다.");
      });
  }, [navigate, user]);

  const handleEquip = async (equipmentCode: PowerRankingEquipmentCode) => {
    setSubmittingCode(equipmentCode);
    try {
      const equipment = await apiClient.equipEquipment({ equipmentCode });
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
    try {
      const equipment = await apiClient.unequipEquipment({ slot });
      setEquipmentInventory(equipment.inventory);
      setEquippedItems(equipment.equipped);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "장비를 해제하지 못했습니다.");
    }
  };

  const handleSell = async (inventoryType: "equipment" | "consumable", code: string) => {
    try {
      const result = await apiClient.sellItem({ inventoryType, code });
      setEquipmentInventory(result.equipment.inventory);
      setEquippedItems(result.equipment.equipped);
      setItemInventory(result.consumables);
      setProgress((current) =>
        current
          ? {
              ...current,
              materials: {
                ...current.materials,
                "club-coin": current.materials["club-coin"] + result.soldAmount
              }
            }
          : current
      );
      setErrorMessage(`판매 완료 · 동연 코인 +${result.soldAmount}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "판매하지 못했습니다.");
    }
  };

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

  const equippedList = Object.entries(equippedItems) as Array<[PowerRankingEquipmentSlot, any]>;
  const equippedCodes = new Set(
    equippedList
      .map(([, equipped]) => equipped?.code)
      .filter((code): code is string => Boolean(code))
  );

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <section className="powerRankingInventorySection">
          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Inventory</p>
              <h1>인벤토리</h1>
            </div>
            <p className="powerRankingSectionHint">장비 / 소비 / 기타 탭으로 나누고, 착용 중 장비가 바로 보이도록 정리했습니다.</p>
          </div>

          {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
          {!isHydrated ? <div className="powerRankingLoading">인벤토리 진행도를 불러오는 중입니다.</div> : null}

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
                  <p className="powerRankingSectionEyebrow">Equipped</p>
                  <h2>착용 중 장비</h2>
                </div>
                <Link to="/dongyeon-equipment-enhancement" className="powerRankingItemButton">강화 화면 이동</Link>
              </div>
              <div className="powerRankingInventoryGrid">
                {(Object.keys(powerRankingEquipmentSlotLabels) as PowerRankingEquipmentSlot[]).map((slot) => {
                  const equipped = equippedItems[slot];
                  return (
                    <article key={slot} className="powerRankingInventoryCard">
                      <div className="powerRankingInventoryBody">
                        <div className="powerRankingInventoryHeading">
                          <strong>{powerRankingEquipmentSlotLabels[slot]}</strong>
                          <span>{equipped ? equipped.name : "미착용"}</span>
                        </div>
                        <p>{equipped ? equipped.effectSummary : "아직 장착한 장비가 없습니다."}</p>
                        {equipped ? (
                          <button type="button" className="powerRankingItemButton" onClick={() => void handleUnequip(slot)}>
                            장비 해제
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="powerRankingInventoryGrid">
                {equipmentInventory.length === 0 ? (
                  <article className="powerRankingInventoryEmpty">보유 장비가 없습니다.</article>
                ) : (
                  equipmentInventory.map((item) => (
                    <div key={item.code} className="powerRankingItemActionCard">
                      <PowerRankingEquipmentCard
                        item={item}
                        onEquipEquipment={handleEquip}
                        equipSubmittingCode={submittingCode}
                        isEquipped={equippedCodes.has(item.code)}
                      />
                      <button type="button" className="powerRankingItemButton" onClick={() => void handleSell("equipment", item.code)}>
                        장비 판매
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : null}

          {activeTab === "consumables" ? (
            <div className="powerRankingInventoryGrid">
              {itemInventory.length === 0 ? (
                <article className="powerRankingInventoryEmpty">보유 중인 소비 아이템이 없습니다.</article>
              ) : (
                itemInventory.map((item) => (
                  <article key={item.code} className="powerRankingInventoryCard">
                    <div className="powerRankingInventoryVisual">
                      <img src={item.imageUrl} alt={item.name} className="powerRankingInventoryImage" />
                      <span className="powerRankingInventoryBadge">x{item.quantity}</span>
                    </div>
                    <div className="powerRankingInventoryBody">
                      <div className="powerRankingInventoryHeading">
                        <strong>{item.name}</strong>
                        <span>사용/판매 가능</span>
                      </div>
                      <p>{item.description}</p>
                      <button type="button" className="powerRankingItemButton" onClick={() => void handleSell("consumable", item.code)}>
                        아이템 판매
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          ) : null}

          {activeTab === "other" ? (
            <div className="powerRankingInventoryGrid">
              {otherItems.map((item) => (
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
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default InventoryPage;
