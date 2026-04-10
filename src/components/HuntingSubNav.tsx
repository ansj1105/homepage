import { NavLink } from "react-router-dom";

const huntingSubNavItems = [
  { to: "/dongyeon-hunting-ground", label: "내 정보" },
  { to: "/dongyeon-hunting-status", label: "내 상태" },
  { to: "/dongyeon-hunting-profile", label: "내 프로필" },
  { to: "/dongyeon-hunting-guide", label: "소개" }
];

const HuntingSubNav = () => (
  <nav className="huntingSubNav" aria-label="사냥 서브 메뉴">
    {huntingSubNavItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) => `huntingSubNavLink ${isActive ? "isActive" : ""}`.trim()}
      >
        {item.label}
      </NavLink>
    ))}
  </nav>
);

export default HuntingSubNav;
