import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useUserAuth } from "../auth/UserAuthContext";
import { useTodayVisitors } from "../visitor/VisitorContext";
import type {
  PowerRankingEquipmentCode,
  PowerRankingEquipmentInventoryItem,
  PowerRankingEquipmentSlot,
  PowerRankingEquippedItem
} from "../types";
import { powerRankingEquipmentSlotLabels } from "../data/powerRankingEquipment";

type CommunityTopBarProps = {
  equipmentInventory?: PowerRankingEquipmentInventoryItem[];
  equippedItems?: Partial<Record<PowerRankingEquipmentSlot, PowerRankingEquippedItem>>;
  onEquipEquipment?: (equipmentCode: PowerRankingEquipmentCode) => Promise<void> | void;
  equipSubmittingCode?: string | null;
};

const CommunityTopBar = ({
  equipmentInventory = [],
  equippedItems = {},
  onEquipEquipment,
  equipSubmittingCode = null
}: CommunityTopBarProps) => {
  const { user, logout } = useUserAuth();
  const { todayVisitors } = useTodayVisitors();
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);

  return (
    <div className="communityTopBar">
      <div className="communityTopBarBrand">
        <p>Community</p>
        <strong>동아리연합회</strong>
      </div>
      <nav className="communityTopBarNav" aria-label="커뮤니티 메뉴">
        <NavLink
          to="/dongyeon-power-ranking"
          className={({ isActive }) =>
            `communityTopBarLink ${isActive ? "isActive" : ""}`.trim()
          }
        >
          파워랭킹
        </NavLink>
        <NavLink
          to="/dongyeon-board"
          className={({ isActive }) =>
            `communityTopBarLink ${isActive ? "isActive" : ""}`.trim()
          }
        >
          게시판
        </NavLink>
        {!user || !onEquipEquipment ? (
          <NavLink
            to="/dongyeon-equipment"
            className={({ isActive }) =>
              `communityTopBarLink ${isActive ? "isActive" : ""}`.trim()
            }
          >
            내 장비
          </NavLink>
        ) : null}
        <NavLink
          to="/dongyeon-hunting-ground"
          className={({ isActive }) =>
            `communityTopBarLink ${isActive ? "isActive" : ""}`.trim()
          }
        >
          사냥터
        </NavLink>
        {!user ? (
          <>
            <NavLink
              to="/dongyeon-login"
              className={({ isActive }) =>
                `communityTopBarLink ${isActive ? "isActive" : ""}`.trim()
              }
            >
              로그인
            </NavLink>
            <NavLink
              to="/dongyeon-signup"
              className={({ isActive }) =>
                `communityTopBarLink ${isActive ? "isActive" : ""}`.trim()
              }
            >
              회원가입
            </NavLink>
          </>
        ) : (
          <>
            {onEquipEquipment ? (
              <div className={`communityTopBarEquipment ${isEquipmentOpen ? "isOpen" : ""}`.trim()}>
                <button
                  type="button"
                  className="communityTopBarLink"
                  onClick={() => setIsEquipmentOpen((current) => !current)}
                >
                  내 장비
                </button>
                {isEquipmentOpen ? (
                  <div className="communityTopBarEquipmentPanel">
                    <div className="communityTopBarEquipmentSlots">
                      {(Object.keys(powerRankingEquipmentSlotLabels) as PowerRankingEquipmentSlot[]).map((slot) => {
                        const equipped = equippedItems[slot];
                        return (
                          <div key={slot} className="communityTopBarEquipmentSlot">
                            <span>{powerRankingEquipmentSlotLabels[slot]}</span>
                            {equipped ? (
                              <div className="communityTopBarEquipmentSlotItem">
                                <img src={equipped.imageUrl} alt={equipped.name} />
                                <strong>{equipped.name}</strong>
                                <small>{equipped.effectSummary}</small>
                              </div>
                            ) : (
                              <p>장비 없음</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="communityTopBarEquipmentInventory">
                      {equipmentInventory.length === 0 ? (
                        <p className="communityTopBarEquipmentEmpty">추천을 통해 장비를 획득하세요.</p>
                      ) : (
                        equipmentInventory.map((item) => (
                          <div key={item.code} className="communityTopBarEquipmentCard">
                            <img src={item.imageUrl} alt={item.name} />
                            <div>
                              <strong>{item.name}</strong>
                              <p>{powerRankingEquipmentSlotLabels[item.slot]} · {item.effectSummary}</p>
                              <span>보유 {item.quantity}</span>
                            </div>
                            <button
                              type="button"
                              className="communityTopBarLink"
                              disabled={equipSubmittingCode === item.code}
                              onClick={() => void onEquipEquipment(item.code)}
                            >
                              {equipSubmittingCode === item.code ? "착용 중..." : "착용"}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            <span className="communityTopBarUser">{user.nickname}</span>
            <button type="button" className="communityTopBarLink" onClick={() => void logout()}>
              로그아웃
            </button>
          </>
        )}
        <NavLink to="/" className="communityTopBarLink isGhost">
          메인으로
        </NavLink>
        <span className="communityTopBarVisitor">오늘 방문자 {todayVisitors.toLocaleString("ko-KR")}</span>
      </nav>
    </div>
  );
};

export default CommunityTopBar;
