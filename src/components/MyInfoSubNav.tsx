import { NavLink } from "react-router-dom";

const myInfoSubNavItems = [
  { to: "/dongyeon-game-home", label: "내 정보" },
  { to: "/dongyeon-cards", label: "카드" },
  { to: "/dongyeon-collection", label: "도감" }
];

const MyInfoSubNav = () => (
  <nav className="huntingSubNav myInfoSubNav" aria-label="내 정보 서브 메뉴">
    {myInfoSubNavItems.map((item) => (
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

export default MyInfoSubNav;
