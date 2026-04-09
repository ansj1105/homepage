import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import PowerRankingEquipmentCard from "../components/PowerRankingEquipmentCard";
import {
  consumableMeta,
  getHuntingStorageKey,
  loadHuntingProgress,
  materialMeta,
  saveHuntingProgress,
  type HuntingProgress
} from "../features/huntingProgress";
import { getPowerRankingEquipmentEnhancementPlan, powerRankingEquipmentSlotLabels } from "../data/powerRankingEquipment";
import type {
  PowerRankingEquipmentCode,
  PowerRankingEquipmentInventoryItem,
  PowerRankingEquipmentSlot,
  PowerRankingEquippedItem,
  PowerRankingInventoryItem
} from "../types";
import { useUserAuth } from "../auth/UserAuthContext";

const EquipmentPage = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [equipmentInventory, setEquipmentInventory] = useState<PowerRankingEquipmentInventoryItem[]>([]);
  const [itemInventory, setItemInventory] = useState<PowerRankingInventoryItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<
    Partial<Record<PowerRankingEquipmentSlot, PowerRankingEquippedItem>>
  >({});
  const [progress, setProgress] = useState<HuntingProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittingCode, setSubmittingCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    setProgress(loadHuntingProgress(getHuntingStorageKey(user.id)));
  }, [user]);

  useEffect(() => {
    if (!user || !progress) {
      return;
    }
    saveHuntingProgress(getHuntingStorageKey(user.id), progress);
  }, [progress, user]);

  useEffect(() => {
    document.title = "내 장비";
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/dongyeon-login");
      return;
    }

    Promise.all([apiClient.getPowerRankingEquipment(), apiClient.getPowerRankingInventory()])
      .then(([equipment, items]) => {
        setEquipmentInventory(equipment.inventory);
        setEquippedItems(equipment.equipped);
        setItemInventory(items);
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "내 장비 정보를 불러오지 못했습니다.");
      });
  }, [navigate, user]);

  const handleEquipEquipment = async (equipmentCode: PowerRankingEquipmentCode) => {
    setSubmittingCode(equipmentCode);
    setErrorMessage("");
    try {
      const equipment = await apiClient.equipPowerRankingEquipment({ equipmentCode });
      setEquipmentInventory(equipment.inventory);
      setEquippedItems(equipment.equipped);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "장비를 착용하지 못했습니다.");
    } finally {
      setSubmittingCode(null);
    }
  };

  const equippedList = Object.values(equippedItems);
  const miscItems = progress
    ? [
        ...Object.entries(materialMeta).map(([code, meta]) => ({
          code,
          name: meta.name,
          description: meta.description,
          quantity: progress.materials[code as keyof typeof progress.materials]
        })),
        ...Object.entries(consumableMeta).map(([code, meta]) => ({
          code,
          name: meta.name,
          description: meta.description,
          quantity: progress.consumables[code as keyof typeof progress.consumables]
        }))
      ].filter((item) => item.quantity > 0)
    : [];

  const handleEnhanceEquipment = (equipmentCode: PowerRankingEquipmentCode) => {
    if (!progress) {
      setErrorMessage("사냥 진행 정보가 아직 준비되지 않았습니다.");
      return;
    }
    const currentLevel = progress.enhancementLevels[equipmentCode] ?? 0;
    if (currentLevel >= 10) {
      setErrorMessage("이미 최대 강화 단계입니다.");
      return;
    }

    const targetTier = getPowerRankingEquipmentEnhancementPlan(equipmentCode).find(
      (tier) => tier.level === currentLevel + 1
    );
    if (!targetTier) {
      return;
    }
    if (progress.materials["enhancement-stone"] < targetTier.stoneCost) {
      setErrorMessage("강화석이 부족합니다.");
      return;
    }

    const useProtection =
      targetTier.level >= 8 && progress.consumables["protection-scroll"] > 0;
    const isSuccess = Math.random() < targetTier.successRate;

    setProgress((current) => {
      if (!current) {
        return current;
      }
      const nextMaterials = { ...current.materials };
      const nextConsumables = { ...current.consumables };
      const nextEnhancementLevels = { ...current.enhancementLevels };

      nextMaterials["enhancement-stone"] = Math.max(0, nextMaterials["enhancement-stone"] - targetTier.stoneCost);

      if (useProtection) {
        nextConsumables["protection-scroll"] = Math.max(0, nextConsumables["protection-scroll"] - 1);
      }

      if (isSuccess) {
        nextEnhancementLevels[equipmentCode] = currentLevel + 1;
      } else if (targetTier.failurePenalty === "강화석 추가 소모" && !useProtection) {
        nextMaterials["refined-stone"] = Math.max(0, nextMaterials["refined-stone"] - 1);
      }

      return {
        ...current,
        materials: nextMaterials,
        consumables: nextConsumables,
        enhancementLevels: nextEnhancementLevels
      };
    });

    setErrorMessage(
      isSuccess
        ? `${equipmentInventory.find((item) => item.code === equipmentCode)?.name ?? equipmentCode} 강화 성공`
        : `${equipmentInventory.find((item) => item.code === equipmentCode)?.name ?? equipmentCode} 강화 실패`
    );
  };

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <section className="powerRankingInventorySection" aria-label="내 장비 보관함">
          <div className="powerRankingSectionHead" id="equipment-inventory">
            <div>
              <p className="powerRankingSectionEyebrow">My Equipment</p>
              <h1>내 장비</h1>
            </div>
            <p className="powerRankingSectionHint">장비, 소비 아이템, 기타 재화, 강화까지 이 페이지에서 관리합니다.</p>
          </div>

          {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

          <div className="powerRankingDashboardGrid">
            <article className="powerRankingDashboardCard">
              <span>착용 장비</span>
              <strong>{equippedList.length} / 5</strong>
              <p>사냥터 전투력 계산에 바로 반영되는 현재 장착 수입니다.</p>
            </article>
            <article className="powerRankingDashboardCard">
              <span>소비 아이템</span>
              <strong>{itemInventory.reduce((sum, item) => sum + item.quantity, 0)}</strong>
              <p>파워랭킹에서 바로 사용하는 소비 아이템 보유량입니다.</p>
            </article>
            <article className="powerRankingDashboardCard">
              <span>기타 재화</span>
              <strong>{miscItems.reduce((sum, item) => sum + item.quantity, 0)}</strong>
              <p>사냥터 재료와 강화 보조 아이템을 포함합니다.</p>
            </article>
          </div>

          <div className="powerRankingSectionHead" id="equipment-enhancement">
            <div>
              <p className="powerRankingSectionEyebrow">Equipped</p>
              <h2>착용 중 장비</h2>
            </div>
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
                      <div className="powerRankingInventoryTags">
                        <span className="powerRankingInventoryPill">착용 중</span>
                        <span className="powerRankingInventoryPill isMuted">
                          +{progress?.enhancementLevels[equipped.code] ?? 0}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Equipment</p>
              <h2>장비</h2>
            </div>
          </div>

          <div className="powerRankingInventoryGrid">
            {equipmentInventory.length === 0 ? (
              <article className="powerRankingInventoryEmpty">
                아직 획득한 장비가 없습니다. 추천 이벤트로 장비를 모아보세요.
              </article>
            ) : (
              equipmentInventory.map((item) => (
                <PowerRankingEquipmentCard
                  key={item.code}
                  item={item}
                  onEquipEquipment={handleEquipEquipment}
                  equipSubmittingCode={submittingCode}
                />
              ))
            )}
          </div>

          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Consumables</p>
              <h2>소비</h2>
            </div>
          </div>

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
                      <span>파워랭킹 소비 아이템</span>
                    </div>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Misc</p>
              <h2>기타</h2>
            </div>
          </div>

          <div className="powerRankingInventoryGrid">
            {miscItems.length === 0 ? (
              <article className="powerRankingInventoryEmpty">사냥터에서 획득한 기타 재화가 없습니다.</article>
            ) : (
              miscItems.map((item) => (
                <article key={item.code} className="powerRankingInventoryCard">
                  <div className="powerRankingInventoryBody">
                    <div className="powerRankingInventoryHeading">
                      <strong>{item.name}</strong>
                      <span>기타 재화</span>
                    </div>
                    <p>{item.description}</p>
                    <div className="powerRankingInventoryTags">
                      <span className="powerRankingInventoryPill">보유 {item.quantity}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Enhancement</p>
              <h2>강화</h2>
            </div>
            <p className="powerRankingSectionHint">장착 중인 장비만 강화되고, 결과는 사냥터 전투력에 반영됩니다.</p>
          </div>

          <div className="powerRankingInventoryGrid">
            {equippedList.length === 0 ? (
              <article className="powerRankingInventoryEmpty">장착한 장비가 없어 강화할 수 없습니다.</article>
            ) : (
              equippedList.map((item) => {
                const currentLevel = progress?.enhancementLevels[item.code] ?? 0;
                const nextTier = getPowerRankingEquipmentEnhancementPlan(item.code).find(
                  (tier) => tier.level === currentLevel + 1
                );

                return (
                  <article key={`enhance-${item.code}`} className="powerRankingInventoryCard huntingEnhancementCard">
                    <div className="powerRankingInventoryVisual">
                      <img src={item.imageUrl} alt={item.name} className="powerRankingInventoryImage" />
                      <span className="powerRankingInventoryBadge">+{currentLevel}</span>
                    </div>
                    <div className="powerRankingInventoryBody">
                      <div className="powerRankingInventoryHeading">
                        <strong>{item.name}</strong>
                        <span>{item.effectSummary}</span>
                      </div>
                      <p>{item.description}</p>
                      {nextTier ? (
                        <div className="powerRankingInventoryTags">
                          <span className="powerRankingInventoryPill">다음 성공률 {Math.round(nextTier.successRate * 100)}%</span>
                          <span className="powerRankingInventoryPill">강화석 {nextTier.stoneCost}개</span>
                          <span className="powerRankingInventoryPill isMuted">보호 주문서 {progress?.consumables["protection-scroll"] ?? 0}개</span>
                        </div>
                      ) : (
                        <div className="powerRankingInventoryTags">
                          <span className="powerRankingInventoryPill">최대 강화</span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="powerRankingItemButton isPositive"
                        disabled={!nextTier || !progress}
                        onClick={() => handleEnhanceEquipment(item.code)}
                      >
                        {nextTier ? `+${nextTier.level} 강화 시도` : "강화 완료"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EquipmentPage;
