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
  unreadInquiryCount: number;
  recentCount: number;
  onToggleGroup: (groupId: string) => void;
  onNavigate: (section: AdminSectionId, tab?: MainEditorTab) => void;
};

const groupMeta: Record<string, { eyebrow: string; summary: string }> = {
  overview: { eyebrow: "Overview", summary: "운영 현황과 최근 상태를 확인합니다." },
  site: { eyebrow: "Site Ops", summary: "홈페이지 콘텐츠와 헤더 구성을 관리합니다." },
  board: { eyebrow: "Boards", summary: "공지와 자료 게시 흐름을 정리합니다." },
  inquiry: { eyebrow: "Pipeline", summary: "유입 문의와 처리 상태를 추적합니다." }
};

export const AdminSidebar = ({
  groups,
  activeSection,
  mainEditorTab,
  expandedGroupId,
  unreadInquiryCount,
  recentCount,
  onToggleGroup,
  onNavigate
}: AdminSidebarProps) => {
  return (
    <aside className="admin-sidebar" aria-label="관리자 메뉴">
      <div className="admin-sidebar-brand">
        <p className="admin-sidebar-kicker">SHINHOTEK CMS</p>
        <strong>Admin Console</strong>
        <span>홈페이지 운영, 공지, 문의 관리를 한 화면에서 다룹니다.</span>
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

      {groups.map((group) => (
        <div key={group.id} className={`admin-nav-group admin-nav-group--${group.id}`}>
          <div className="admin-nav-group-copy">
            <p>{groupMeta[group.id]?.eyebrow ?? "Section"}</p>
            <span>{groupMeta[group.id]?.summary ?? group.label}</span>
          </div>
          <button
            type="button"
            className={expandedGroupId === group.id ? "admin-nav-group-toggle is-open" : "admin-nav-group-toggle"}
            onClick={() => onToggleGroup(group.id)}
            aria-expanded={expandedGroupId === group.id}
          >
            <span>{group.label}</span>
            <span>{expandedGroupId === group.id ? "열림" : "펼침"}</span>
          </button>
          {expandedGroupId === group.id ? (
            <ul>
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
                  >
                    {item.label}
                    {item.id === "inquiries" && unreadInquiryCount > 0 ? (
                      <span className="admin-nav-badge">{unreadInquiryCount}</span>
                    ) : null}
                  </button>
                  {item.id === "main" && item.children ? (
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
    </aside>
  );
};
