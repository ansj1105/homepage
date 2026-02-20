export type AdminSectionId =
  | "dashboard"
  | "main"
  | "public-settings"
  | "cms-pages"
  | "resources"
  | "notices"
  | "inquiries";

export type MainEditorTab = "hero" | "about" | "solution" | "cards" | "footer";

export type RecentTarget = { section: AdminSectionId; tab?: MainEditorTab };

export type AdminNavGroup = {
  id: string;
  label: string;
  items: Array<{
    id: AdminSectionId;
    label: string;
    children?: Array<{ id: MainEditorTab; label: string }>;
  }>;
};

export const mainEditorTabs: Array<{ id: MainEditorTab; label: string }> = [
  { id: "hero", label: "배너" },
  { id: "about", label: "ABOUT" },
  { id: "solution", label: "SH SOLUTION" },
  { id: "cards", label: "하단 카드" },
  { id: "footer", label: "푸터" }
];

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "overview",
    label: "운영 대시보드",
    items: [{ id: "dashboard", label: "대시보드" }]
  },
  {
    id: "site",
    label: "사이트 관리",
    items: [
      { id: "main", label: "메인 페이지", children: mainEditorTabs },
      { id: "public-settings", label: "메타/헤더 설정" },
      { id: "cms-pages", label: "본문 CMS" }
    ]
  },
  {
    id: "board",
    label: "게시판 관리",
    items: [
      { id: "resources", label: "자료실" },
      { id: "notices", label: "공지사항" }
    ]
  },
  {
    id: "inquiry",
    label: "요청 관리",
    items: [{ id: "inquiries", label: "견적/Test 문의" }]
  }
];

export const getSectionLabel = (section: AdminSectionId, tab?: MainEditorTab): string => {
  if (section === "dashboard") return "대시보드";
  if (section === "main") {
    const sub = mainEditorTabs.find((item) => item.id === tab);
    return sub ? `메인 페이지 · ${sub.label}` : "메인 페이지";
  }
  if (section === "public-settings") return "메타/헤더 설정";
  if (section === "cms-pages") return "본문 CMS";
  if (section === "resources") return "자료실";
  if (section === "notices") return "공지사항";
  return "견적/Test 문의";
};
