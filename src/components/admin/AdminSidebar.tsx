import {
  type AdminNavGroup,
  type AdminSectionId,
  type MainEditorTab
} from "./adminNavigation";

type AdminSidebarProps = {
  groups: AdminNavGroup[];
  activeSection: AdminSectionId;
  mainEditorTab: MainEditorTab;
  expandedGroupId: string;
  isCollapsed: boolean;
  unreadInquiryCount: number;
  recentCount: number;
  onSidebarToggle: () => void;
  onToggleGroup: (groupId: string) => void;
  onNavigate: (section: AdminSectionId, tab?: MainEditorTab) => void;
};

const groupMeta: Record<string, { eyebrow: string; summary: string }> = {
  overview: { eyebrow: "Overview", summary: "운영 현황과 최근 상태를 확인합니다." },
  site: { eyebrow: "Site Ops", summary: "홈페이지 콘텐츠와 헤더 구성을 관리합니다." },
  board: { eyebrow: "Boards", summary: "공지와 자료 게시 흐름을 정리합니다." },
  inquiry: { eyebrow: "Pipeline", summary: "유입 문의와 처리 상태를 추적합니다." }
};

const groupGlyph: Record<string, string> = {
  overview: "DB",
  site: "ST",
  board: "BD",
  inquiry: "IN"
};

const sectionGlyph: Record<AdminSectionId, string> = {
  dashboard: "OV",
  main: "HM",
  "public-settings": "MT",
  "cms-pages": "CM",
  resources: "RS",
  notices: "NT",
  inquiries: "IQ"
};

export const AdminSidebar = ({
  groups,
  activeSection,
  mainEditorTab,
  expandedGroupId,
  isCollapsed,
  unreadInquiryCount,
  recentCount,
  onSidebarToggle,
  onToggleGroup,
  onNavigate
}: AdminSidebarProps) => {
  return (
    <aside className={isCollapsed ? "admin-sidebar is-collapsed" : "admin-sidebar"} aria-label="관리자 메뉴">
      <button
        type="button"
        className="admin-sidebar-toggle"
        onClick={onSidebarToggle}
        aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
      >
        <span>{isCollapsed ? ">>" : "<<"}</span>
      </button>

      <div className="admin-sidebar-brand">
        <p className="admin-sidebar-kicker">{isCollapsed ? "SH" : "SHINHOTEK CMS"}</p>
        <strong>{isCollapsed ? "CMS" : "Admin Console"}</strong>
        <span>
          {isCollapsed ? "운영" : "홈페이지 운영, 공지, 문의 관리를 한 화면에서 다룹니다."}
        </span>
      </div>

      <div className="admin-sidebar-overview">
        <div>
          <span>Unread</span>
          <strong>{unreadInquiryCount}</strong>
        </div>
        <div>
          <span>Recent</span>
          <strong>{recentCount}</strong>
        </div>
      </div>

      <div className="admin-sidebar-nav">
        {groups.map((group) => (
          <div key={group.id} className={`admin-nav-group admin-nav-group--${group.id}`}>
          {!isCollapsed ? (
            <div className="admin-nav-group-copy">
              <p>{groupMeta[group.id]?.eyebrow ?? "Section"}</p>
              <span>{groupMeta[group.id]?.summary ?? group.label}</span>
            </div>
          ) : null}
          <button
            type="button"
            className={expandedGroupId === group.id ? "admin-nav-group-toggle is-open" : "admin-nav-group-toggle"}
            onClick={() => onToggleGroup(group.id)}
            aria-expanded={expandedGroupId === group.id}
            title={group.label}
          >
            <span className="admin-menu-item-content">
              <span className="admin-menu-icon">{groupGlyph[group.id] ?? group.label.slice(0, 2)}</span>
              <span className="admin-menu-label">
                {isCollapsed ? (groupMeta[group.id]?.eyebrow ?? group.label.slice(0, 2)) : group.label}
              </span>
            </span>
            {!isCollapsed ? <span>{expandedGroupId === group.id ? "열림" : "펼침"}</span> : null}
          </button>
          {expandedGroupId === group.id ? (
            <ul className="admin-submenu">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={item.id === activeSection ? "admin-depth1-btn is-active" : "admin-depth1-btn"}
                    onClick={() =>
                      onNavigate(
                        item.id,
                        item.id === "main" && item.children?.length ? item.children[0].id : undefined
                      )
                    }
                    title={item.label}
                  >
                    <span className="admin-menu-item-content">
                      <span className="admin-menu-icon">{sectionGlyph[item.id]}</span>
                      <span className="admin-menu-label">
                        {isCollapsed ? item.label.slice(0, 2) : item.label}
                      </span>
                    </span>
                    {item.id === "inquiries" && unreadInquiryCount > 0 ? (
                      <span className="admin-nav-badge">{unreadInquiryCount}</span>
                    ) : null}
                  </button>
                  {item.id === "main" && item.children && !isCollapsed ? (
                    <ul className={item.id === activeSection ? "admin-subdepth is-open" : "admin-subdepth"}>
                      {item.children.map((sub) => (
                        <li key={sub.id}>
                          <button
                            type="button"
                            className={
                              item.id === activeSection && mainEditorTab === sub.id
                                ? "admin-depth2-btn is-active"
                                : "admin-depth2-btn"
                            }
                            onClick={() => onNavigate("main", sub.id)}
                          >
                            {sub.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          </div>
        ))}
      </div>
    </aside>
  );
};
