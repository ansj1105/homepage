import type { PowerRankingEquipmentCode, PowerRankingEquipmentInventoryItem } from "../types";
import {
  getPowerRankingEquipmentEnhancementPlan,
  powerRankingEquipmentSlotLabels
} from "../data/powerRankingEquipment";

type PowerRankingEquipmentCardProps = {
  item: PowerRankingEquipmentInventoryItem;
  onEquipEquipment?: (equipmentCode: PowerRankingEquipmentCode) => Promise<void> | void;
  equipSubmittingCode?: string | null;
  isEquipped?: boolean;
};

const PowerRankingEquipmentCard = ({
  item,
  onEquipEquipment,
  equipSubmittingCode = null,
  isEquipped = false
}: PowerRankingEquipmentCardProps) => {
  const enhancementPlan = getPowerRankingEquipmentEnhancementPlan(item.code);

  return (
    <article className={`powerRankingInventoryCard powerRankingEquipmentCard ${isEquipped ? "isEquipped" : ""}`.trim()}>
      <div className="powerRankingInventoryVisual">
        <img src={item.imageUrl} alt={item.name} className="powerRankingInventoryImage" />
        <span className="powerRankingInventoryBadge">x{item.quantity}</span>
        {isEquipped ? <span className="powerRankingEquippedBadge">착용 중</span> : null}
      </div>

      <div className="powerRankingInventoryBody">
        <div className="powerRankingInventoryHeading">
          <strong>{item.name}</strong>
          <span>{powerRankingEquipmentSlotLabels[item.slot]} 장비</span>
        </div>

        <p>{item.description}</p>

        <div className="powerRankingInventoryTags">
          {isEquipped ? <span className="powerRankingInventoryPill isEquipped">현재 착용 장비</span> : null}
          <span className="powerRankingInventoryPill">{item.effectSummary}</span>
          <span className="powerRankingInventoryPill isMuted">보유 {item.quantity}</span>
        </div>

        <details className="powerRankingEquipmentDetails">
          <summary>상세보기</summary>
          <div className="powerRankingEquipmentDetailsBody">
            <p>
              {powerRankingEquipmentSlotLabels[item.slot]} 슬롯 장비입니다. 착용 시 <strong>{item.effectSummary}</strong> 효과가 적용됩니다.
            </p>
            <p>
              권장 구조는 +0에서 시작해 +5까지는 100% 성공, +6부터 실패 가능 구간으로 진입합니다. 보호 주문서를 쓰면
              고강화 구간에서도 장비 파괴 없이 진행하는 흐름을 전제로 합니다.
            </p>

            <div className="powerRankingEquipmentEnhancementBox">
              <strong>권장 강화 밸런스</strong>
              <ul className="powerRankingEquipmentEnhancementList">
                {enhancementPlan.map((tier) => (
                  <li key={`${item.code}-${tier.level}`}>
                    <span>+{tier.level}</span>
                    <strong>성공 {Math.round(tier.successRate * 100)}%</strong>
                    <em>강화석 {tier.stoneCost}개</em>
                    <small>실패 패널티: {tier.failurePenalty}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>

        {onEquipEquipment ? (
          <button
            type="button"
            className="powerRankingItemButton isPositive"
            disabled={equipSubmittingCode === item.code || isEquipped}
            onClick={() => void onEquipEquipment(item.code)}
          >
            {isEquipped ? "착용 완료" : equipSubmittingCode === item.code ? "착용 중..." : "착용"}
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default PowerRankingEquipmentCard;
