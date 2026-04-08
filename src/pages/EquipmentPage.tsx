import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import type {
  PowerRankingEquipmentCode,
  PowerRankingEquipmentInventoryItem,
  PowerRankingEquipmentSlot,
  PowerRankingEquippedItem
} from "../types";
import { useUserAuth } from "../auth/UserAuthContext";

const EquipmentPage = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [equipmentInventory, setEquipmentInventory] = useState<PowerRankingEquipmentInventoryItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<
    Partial<Record<PowerRankingEquipmentSlot, PowerRankingEquippedItem>>
  >({});
  const [errorMessage, setErrorMessage] = useState("");
  const [submittingCode, setSubmittingCode] = useState<string | null>(null);

  useEffect(() => {
    document.title = "내 장비";
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/dongyeon-login");
      return;
    }

    apiClient
      .getPowerRankingEquipment()
      .then((equipment) => {
        setEquipmentInventory(equipment.inventory);
        setEquippedItems(equipment.equipped);
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "장비를 불러오지 못했습니다.");
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

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar
          equipmentInventory={equipmentInventory}
          equippedItems={equippedItems}
          onEquipEquipment={handleEquipEquipment}
          equipSubmittingCode={submittingCode}
        />

        <section className="powerRankingInventorySection" aria-label="내 장비 보관함">
          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">My Equipment</p>
              <h1>내 장비</h1>
            </div>
            <p className="powerRankingSectionHint">추천 이벤트로 획득한 장비를 확인하고 착용할 수 있습니다.</p>
          </div>

          {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

          <div className="powerRankingInventoryGrid">
            {equipmentInventory.length === 0 ? (
              <article className="powerRankingInventoryEmpty">
                아직 획득한 장비가 없습니다. 추천 이벤트로 장비를 모아보세요.
              </article>
            ) : (
              equipmentInventory.map((item) => (
                <article key={item.code} className="powerRankingInventoryCard">
                  <img src={item.imageUrl} alt={item.name} className="powerRankingInventoryImage" />
                  <div className="powerRankingInventoryBody">
                    <strong>{item.name}</strong>
                    <p>{item.description}</p>
                    <span>{item.slot} · 보유 수량 {item.quantity}</span>
                    <button
                      type="button"
                      className="powerRankingItemButton isPositive"
                      disabled={submittingCode === item.code}
                      onClick={() => void handleEquipEquipment(item.code)}
                    >
                      {submittingCode === item.code ? "착용 중..." : "착용"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EquipmentPage;
