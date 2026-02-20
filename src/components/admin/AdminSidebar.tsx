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
  onToggleGroup: (groupId: string) => void;
  onNavigate: (section: AdminSectionId, tab?: MainEditorTab) => void;
};

export const AdminSidebar = ({
  groups,
  activeSection,
  mainEditorTab,
  expandedGroupId,
  unreadInquiryCount,
  onToggleGroup,
  onNavigate
}: AdminSidebarProps) => {
  return (
    <aside className="admin-sidebar" aria-label="관리자 메뉴">
      {groups.map((group) => (
        <div key={group.id} className={`admin-nav-group admin-nav-group--${group.id}`}>
          <button
            type="button"
            className={expandedGroupId === group.id ? "admin-nav-group-toggle is-open" : "admin-nav-group-toggle"}
            onClick={() => onToggleGroup(group.id)}
            aria-expanded={expandedGroupId === group.id}
          >
            <span>{group.label}</span>
            <span>{expandedGroupId === group.id ? "−" : "+"}</span>
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
