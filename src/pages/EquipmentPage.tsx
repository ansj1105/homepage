import { useEffect } from "react";
import { Link } from "react-router-dom";
import CommunityTopBar from "../components/CommunityTopBar";

const EquipmentPage = () => {
  useEffect(() => {
    document.title = "장비 허브";
  }, []);

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Equipment Hub</p>
            <h1>장비 허브</h1>
            <p className="powerRankingLead">
              인벤토리와 강화가 한 화면에 몰려 있던 구조를 분리했습니다. 여기서는 장비 관리 경로만 나눠서 보여줍니다.
            </p>
          </div>
        </header>

        <section className="powerRankingInventorySection">
          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Split Routes</p>
              <h2>장비 관리 경로</h2>
            </div>
          </div>

          <div className="gameHomeQuickGrid">
            <Link to="/dongyeon-inventory" className="powerRankingItemButton isPositive gameHomeQuickLink">
              인벤토리 화면
            </Link>
            <Link to="/dongyeon-equipment-enhancement" className="powerRankingItemButton isPositive gameHomeQuickLink">
              강화 화면
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EquipmentPage;
