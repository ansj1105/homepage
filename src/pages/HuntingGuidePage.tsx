import { useEffect } from "react";
import { Link } from "react-router-dom";
import CommunityTopBar from "../components/CommunityTopBar";
import HuntingSubNav from "../components/HuntingSubNav";

const guideItems = [
  {
    title: "사냥터 선택",
    body: "지역별 권장 전투력과 드랍 테이블을 먼저 보고 진입합니다."
  },
  {
    title: "전투 진행",
    body: "클릭 1회는 행동 1회이며, 지역마다 클릭과 피로도 소모량이 다릅니다."
  },
  {
    title: "드랍과 성장",
    body: "드랍된 재화와 아이템은 인벤토리와 강화, 카드 성장으로 이어집니다."
  },
  {
    title: "피로도 관리",
    body: "피로도는 공격 시 닳고, 시간마다 조금씩 회복됩니다. 소비 아이템으로 빠르게 회복할 수 있습니다."
  }
];

const HuntingGuidePage = () => {
  useEffect(() => {
    document.title = "사냥 소개";
  }, []);

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <HuntingSubNav />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">Guide</p>
            <h1>소개</h1>
            <p className="powerRankingLead">사냥 시스템을 한 번에 훑는 설명용 페이지입니다. 정보 페이지와 전투 페이지는 분리돼 있습니다.</p>
          </div>
        </header>

        <section className="powerRankingInventorySection">
          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Flow</p>
              <h2>사냥 흐름</h2>
            </div>
          </div>

          <div className="powerRankingInventoryGrid">
            {guideItems.map((item) => (
              <article key={item.title} className="powerRankingLogCard">
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="powerRankingInventorySection">
          <div className="powerRankingSectionHead">
            <div>
              <p className="powerRankingSectionEyebrow">Move</p>
              <h2>바로 이동</h2>
            </div>
          </div>

          <div className="gameHomeQuickGrid">
            <Link to="/dongyeon-hunting-zones" className="powerRankingItemButton isPositive gameHomeQuickLink">
              사냥터 선택
            </Link>
            <Link to="/dongyeon-hunting-combat" className="powerRankingItemButton isPositive gameHomeQuickLink">
              전투 화면
            </Link>
            <Link to="/dongyeon-inventory" className="powerRankingItemButton isPositive gameHomeQuickLink">
              인벤토리
            </Link>
            <Link to="/dongyeon-equipment" className="powerRankingItemButton isPositive gameHomeQuickLink">
              내 장비
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HuntingGuidePage;
