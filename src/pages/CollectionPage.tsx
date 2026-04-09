import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import { getHuntingStorageKey, loadHuntingProgress } from "../features/huntingProgress";
import { useUserAuth } from "../auth/UserAuthContext";
import type { MonsterCollectionEntry, SetCollectionEntry } from "../types";

const CollectionPage = () => {
  const { user } = useUserAuth();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [monsters, setMonsters] = useState<MonsterCollectionEntry[]>([]);
  const [sets, setSets] = useState<SetCollectionEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [equippedCount, setEquippedCount] = useState(0);

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

  const progress = useMemo(() => {
    if (!user) return null;
    return loadHuntingProgress(getHuntingStorageKey(user.id));
  }, [user]);

  const discoveredMonsterCount = progress?.totalDefeated ? Math.min(monsters.length, Math.max(1, Math.floor(progress.totalDefeated / 3))) : 0;

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
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
              <p>장착 부위 수에 따라 세트 보너스 달성 여부가 바뀝니다.</p>
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
                    <span>{equippedCount >= Number(setItem.id.split("-")[1]) ? "달성" : "미달성"}</span>
                  </div>
                  <p>{setItem.requirement}</p>
                  <div className="powerRankingInventoryTags">
                    <span className="powerRankingInventoryPill">{setItem.bonusSummary}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CollectionPage;
