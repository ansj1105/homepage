import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import {
  getHuntingStorageKey,
  loadHuntingProgress,
  saveHuntingProgress,
  type HuntingProgress
} from "../features/huntingProgress";
import { useUserAuth } from "../auth/UserAuthContext";
import type { EquipmentEnhancePreview, PowerRankingEquippedItem, PowerRankingEquipmentSlot } from "../types";

const EquipmentEnhancementPage = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [equippedItems, setEquippedItems] = useState<Partial<Record<PowerRankingEquipmentSlot, PowerRankingEquippedItem>>>({});
  const [progress, setProgress] = useState<HuntingProgress | null>(null);
  const [previewByCode, setPreviewByCode] = useState<Record<string, EquipmentEnhancePreview | null>>({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.title = "장비 강화";
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/dongyeon-login");
      return;
    }

    const nextProgress = loadHuntingProgress(getHuntingStorageKey(user.id));
    setProgress(nextProgress);

    apiClient
      .getInventory()
      .then(async (payload) => {
        setEquippedItems(payload.equipment.equipped);
        const previews = await Promise.all(
          Object.values(payload.equipment.equipped).map(async (item) => {
            if (!item) {
              return null;
            }
            const currentLevel = nextProgress.enhancementLevels[item.code] ?? 0;
            try {
              return await apiClient.getEquipmentEnhancePreview(item.code, currentLevel);
            } catch {
              return null;
            }
          })
        );
        const nextMap: Record<string, EquipmentEnhancePreview | null> = {};
        previews.forEach((preview) => {
          if (preview) {
            nextMap[preview.equipmentCode] = preview;
          }
        });
        setPreviewByCode(nextMap);
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "강화 정보를 불러오지 못했습니다.");
      });
  }, [navigate, user]);

  useEffect(() => {
    if (!user || !progress) {
      return;
    }
    saveHuntingProgress(getHuntingStorageKey(user.id), progress);
  }, [progress, user]);

  const handleEnhance = async (item: PowerRankingEquippedItem) => {
    if (!progress) {
      return;
    }
    const preview = previewByCode[item.code];
    if (!preview) {
      setErrorMessage("강화 가능한 다음 단계가 없습니다.");
      return;
    }
    if (progress.materials["enhancement-stone"] < preview.stoneCost) {
      setErrorMessage("강화석이 부족합니다.");
      return;
    }
    if (progress.materials["club-coin"] < preview.goldCost) {
      setErrorMessage("동연 코인이 부족합니다.");
      return;
    }

    const useProtection = preview.nextLevel >= 8 && progress.consumables["protection-scroll"] > 0;

    try {
      const result = await apiClient.enhanceEquipment({
        equipmentCode: item.code,
        currentLevel: preview.currentLevel,
        useProtection
      });

      const nextProgress: HuntingProgress = {
        ...progress,
        materials: {
          ...progress.materials,
          "enhancement-stone": Math.max(0, progress.materials["enhancement-stone"] - result.preview.stoneCost),
          "club-coin": Math.max(0, progress.materials["club-coin"] - result.preview.goldCost),
          "refined-stone":
            !result.success && result.preview.failurePenalty === "강화석 추가 소모" && !useProtection
              ? Math.max(0, progress.materials["refined-stone"] - 1)
              : progress.materials["refined-stone"]
        },
        consumables: {
          ...progress.consumables,
          "protection-scroll":
            useProtection
              ? Math.max(0, progress.consumables["protection-scroll"] - 1)
              : progress.consumables["protection-scroll"]
        },
        enhancementLevels: {
          ...progress.enhancementLevels,
          [item.code]: result.nextLevel
        }
      };
      setProgress(nextProgress);

      try {
        const nextPreview = await apiClient.getEquipmentEnhancePreview(item.code, result.nextLevel);
        setPreviewByCode((current) => ({ ...current, [item.code]: nextPreview }));
      } catch {
        setPreviewByCode((current) => ({ ...current, [item.code]: null }));
      }

      setErrorMessage(result.success ? `${item.name} 강화 성공` : `${item.name} 강화 실패`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "강화에 실패했습니다.");
    }
  };

  const equippedList = Object.values(equippedItems).filter(Boolean) as PowerRankingEquippedItem[];

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <section className="powerRankingInventorySection">
          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Enhancement</p>
              <h1>강화 화면</h1>
            </div>
            <p className="powerRankingSectionHint">현재 등급, 다음 강화 효과, 재료, 성공 확률을 보고 강화합니다.</p>
          </div>

          {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

          <div className="powerRankingInventoryGrid">
            {equippedList.length === 0 ? (
              <article className="powerRankingInventoryEmpty">장착한 장비가 없어 강화할 수 없습니다.</article>
            ) : (
              equippedList.map((item) => {
                const currentLevel = progress?.enhancementLevels[item.code] ?? 0;
                const preview = previewByCode[item.code];
                return (
                  <article key={item.code} className="powerRankingInventoryCard huntingEnhancementCard">
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
                      {preview ? (
                        <div className="powerRankingInventoryTags">
                          <span className="powerRankingInventoryPill">다음 +{preview.nextLevel}</span>
                          <span className="powerRankingInventoryPill">성공 {Math.round(preview.successRate * 100)}%</span>
                          <span className="powerRankingInventoryPill">강화석 {preview.stoneCost}</span>
                          <span className="powerRankingInventoryPill">코인 {preview.goldCost}</span>
                          <span className="powerRankingInventoryPill isMuted">{preview.nextEffectSummary}</span>
                        </div>
                      ) : (
                        <div className="powerRankingInventoryTags">
                          <span className="powerRankingInventoryPill">최대 강화</span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="powerRankingItemButton isPositive"
                        disabled={!preview || !progress}
                        onClick={() => void handleEnhance(item)}
                      >
                        {preview ? `+${preview.nextLevel} 강화 시도` : "강화 완료"}
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

export default EquipmentEnhancementPage;
