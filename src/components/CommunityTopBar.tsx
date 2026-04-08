import { NavLink } from "react-router-dom";

const CommunityTopBar = () => (
  <div className="communityTopBar">
    <div className="communityTopBarBrand">
      <p>Community</p>
      <strong>동연 파워랭킹</strong>
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
      <NavLink
        to="/dongyeon-signup"
        className={({ isActive }) =>
          `communityTopBarLink ${isActive ? "isActive" : ""}`.trim()
        }
      >
        회원가입
      </NavLink>
      <NavLink to="/" className="communityTopBarLink isGhost">
        메인으로
      </NavLink>
    </nav>
  </div>
);

export default CommunityTopBar;
