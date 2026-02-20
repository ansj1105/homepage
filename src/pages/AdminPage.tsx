import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/client";
import { AdminPanel } from "../components/admin/AdminPanel";
import { AdminSectionTabs } from "../components/admin/AdminSectionTabs";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import {
  type AdminSectionId,
  type MainEditorTab,
  type RecentTarget,
  getSectionLabel,
  adminNavGroups,
  mainEditorTabs
} from "../components/admin/adminNavigation";
import { defaultCmsPages } from "../data/cmsPageDefaults";
import { defaultMainPageContent } from "../data/mainPageDefaults";
import { defaultPublicSiteSettings } from "../data/siteSettingsDefaults";
import { notices as initialNotices, resources as initialResources } from "../data/siteData";
import { useI18n } from "../i18n/I18nContext";
import { MarkdownBlock } from "./public/MarkdownBlock";
import type {
  CmsPage,
  InquiryItem,
  MainPageApplicationCard,
  MainPageContent,
  MainPageSlide,
  NoticeItem,
  PublicSiteSettings,
  ResourceItem
} from "../types";

const tokenStorageKey = "sh_admin_token";
const adminUiStorageKey = "sh_admin_ui_v1";
const visitorCounterStorageKey = "sh_admin_today_visitors_v1";
const visitorStatsStorageKey = "sh_admin_visitor_stats_v1";
const adminLoginHistoryStorageKey = "sh_admin_login_history_v1";

type PersistedAdminUi = {
  activeSection?: AdminSectionId;
  mainEditorTab?: MainEditorTab;
  expandedGroupId?: string;
  recentTargets?: RecentTarget[];
};

const loadPersistedAdminUi = (): PersistedAdminUi => {
  try {
    const raw = localStorage.getItem(adminUiStorageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedAdminUi;
    return parsed ?? {};
  } catch {
    return {};
  }
};

const createClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const defaultResourceForm = {
  title: "",
  type: "Catalog" as ResourceItem["type"],
  fileUrl: "",
  markdown: ""
};

const createDefaultNoticeForm = () => ({
  title: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  markdown: ""
});

type NoticeSearchField = "title" | "markdown" | "id";
type VisitorStatPoint = { date: string; count: number };
type AdminLoginHistoryItem = { id: string; username: string; loggedInAt: string; userAgent: string };

const loadVisitorStats = (): VisitorStatPoint[] => {
  try {
    const raw = localStorage.getItem(visitorStatsStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VisitorStatPoint[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.date === "string" && typeof item.count === "number")
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch {
    return [];
  }
};

const loadLoginHistory = (): AdminLoginHistoryItem[] => {
  try {
    const raw = localStorage.getItem(adminLoginHistoryStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AdminLoginHistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.username === "string" &&
          typeof item.loggedInAt === "string"
      )
      .slice(0, 30);
  } catch {
    return [];
  }
};

const AdminPage = () => {
  const persistedUi = loadPersistedAdminUi();
  const { t } = useI18n();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(tokenStorageKey));
  const [mainPage, setMainPage] = useState<MainPageContent>(defaultMainPageContent);
  const [cmsPages, setCmsPages] = useState<CmsPage[]>(defaultCmsPages);
  const [publicSettings, setPublicSettings] = useState<PublicSiteSettings>(defaultPublicSiteSettings);
  const [publicSettingsJson, setPublicSettingsJson] = useState(
    JSON.stringify(defaultPublicSiteSettings, null, 2)
  );
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [resourceModalMode, setResourceModalMode] = useState<"create" | "edit" | null>(null);
  const [resourceEditingId, setResourceEditingId] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState(defaultResourceForm);
  const [resourceUploadFile, setResourceUploadFile] = useState<File | null>(null);
  const [resourceFileInputKey, setResourceFileInputKey] = useState(0);
  const [noticeModalMode, setNoticeModalMode] = useState<"create" | "edit" | null>(null);
  const [noticeEditingId, setNoticeEditingId] = useState<string | null>(null);
  const [noticeForm, setNoticeForm] = useState(createDefaultNoticeForm);
  const [heroPreviewSlideId, setHeroPreviewSlideId] = useState<string>("");
  const [noticeSearchField, setNoticeSearchField] = useState<NoticeSearchField>("title");
  const [noticeSearchQuery, setNoticeSearchQuery] = useState("");
  const [noticePage, setNoticePage] = useState(1);
  const [todayVisitorCount, setTodayVisitorCount] = useState(0);
  const [visitorStats, setVisitorStats] = useState<VisitorStatPoint[]>([]);
  const [visitorStatsDate, setVisitorStatsDate] = useState(new Date().toISOString().slice(0, 10));
  const [loginHistory, setLoginHistory] = useState<AdminLoginHistoryItem[]>(loadLoginHistory);
  const [unreadInquiryCount, setUnreadInquiryCount] = useState(0);
  const [activeSection, setActiveSection] = useState<AdminSectionId>(
    persistedUi.activeSection ?? "dashboard"
  );
  const [mainEditorTab, setMainEditorTab] = useState<MainEditorTab>(
    persistedUi.mainEditorTab ?? "hero"
  );
  const [expandedGroupId, setExpandedGroupId] = useState<string>(
    persistedUi.expandedGroupId ?? "overview"
  );
  const [recentTargets, setRecentTargets] = useState<RecentTarget[]>(
    persistedUi.recentTargets ?? []
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const sortedInquiries = useMemo(
    () =>
      [...inquiries].sort((a, b) => {
        if (a.createdAt > b.createdAt) return -1;
        if (a.createdAt < b.createdAt) return 1;
        return 0;
      }),
    [inquiries]
  );

  const sortedSlides = useMemo(
    () => [...mainPage.slides].sort((a, b) => a.sortOrder - b.sortOrder),
    [mainPage.slides]
  );

  const sortedResources = useMemo(
    () => [...resources].sort((a, b) => a.title.localeCompare(b.title, "ko")),
    [resources]
  );

  const sortedNotices = useMemo(() => {
    const toTime = (item: NoticeItem) => {
      if (item.createdAt) {
        const parsedCreatedAt = new Date(item.createdAt).getTime();
        if (!Number.isNaN(parsedCreatedAt)) return parsedCreatedAt;
      }
      const parsedPublishedAt = new Date(item.publishedAt).getTime();
      return Number.isNaN(parsedPublishedAt) ? 0 : parsedPublishedAt;
    };
    return [...notices].sort((a, b) => toTime(b) - toTime(a));
  }, [notices]);

  const filteredNotices = useMemo(() => {
    const keyword = noticeSearchQuery.trim().toLowerCase();
    if (!keyword) return sortedNotices;
    return sortedNotices.filter((item) => {
      if (noticeSearchField === "title") return item.title.toLowerCase().includes(keyword);
      if (noticeSearchField === "markdown") return item.markdown.toLowerCase().includes(keyword);
      return item.id.toLowerCase().includes(keyword);
    });
  }, [noticeSearchField, noticeSearchQuery, sortedNotices]);

  const noticeTotalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredNotices.length / 10)),
    [filteredNotices.length]
  );

  const pagedNotices = useMemo(() => {
    const startIndex = (noticePage - 1) * 10;
    return filteredNotices.slice(startIndex, startIndex + 10);
  }, [filteredNotices, noticePage]);

  const selectedVisitorCount = useMemo(
    () => visitorStats.find((item) => item.date === visitorStatsDate)?.count ?? 0,
    [visitorStats, visitorStatsDate]
  );

  const maxVisitorCount = useMemo(
    () => Math.max(1, ...visitorStats.map((item) => item.count)),
    [visitorStats]
  );

  const requestAlertItems = useMemo(() => sortedInquiries.slice(0, 5), [sortedInquiries]);
  const pendingInquiryCount = useMemo(
    () => inquiries.filter((item) => item.status === "in-review").length,
    [inquiries]
  );
  const unreadInquiryItemsCount = useMemo(
    () => inquiries.filter((item) => !item.isRead).length,
    [inquiries]
  );

  const sortedCards = useMemo(
    () => [...mainPage.applicationCards].sort((a, b) => a.sortOrder - b.sortOrder),
    [mainPage.applicationCards]
  );

  const companyCmsPages = useMemo(
    () => cmsPages.filter((item) => item.slug.startsWith("company-")),
    [cmsPages]
  );

  const otherCmsPages = useMemo(
    () => cmsPages.filter((item) => !item.slug.startsWith("company-")),
    [cmsPages]
  );

  const heroPreviewSlide = useMemo(() => {
    if (sortedSlides.length === 0) return null;
    return sortedSlides.find((item) => item.id === heroPreviewSlideId) ?? sortedSlides[0];
  }, [heroPreviewSlideId, sortedSlides]);

  const recordRecentTarget = (section: AdminSectionId, tab?: MainEditorTab) => {
    setRecentTargets((prev) => {
      const next: RecentTarget = section === "main" ? { section, tab: tab ?? "hero" } : { section };
      const nextKey = `${next.section}:${next.tab ?? ""}`;
      const deduped = prev.filter((item) => `${item.section}:${item.tab ?? ""}` !== nextKey);
      return [next, ...deduped].slice(0, 6);
    });
  };

  const navigateToSection = (section: AdminSectionId, tab?: MainEditorTab) => {
    setActiveSection(section);
    if (section === "main") {
      setMainEditorTab(tab ?? mainEditorTab);
      recordRecentTarget(section, tab ?? mainEditorTab);
    } else {
      recordRecentTarget(section);
    }
    const group = adminNavGroups.find((item) => item.items.some((menu) => menu.id === section));
    if (group) setExpandedGroupId(group.id);
  };

  const loadAdminData = async (adminToken: string) => {
    const [
      latestMainPage,
      latestPublicSettings,
      latestCmsPages,
      unreadCountResult,
      latestResources,
      latestNotices,
      latestInquiries
    ] = await Promise.all([
      apiClient.adminGetMainPage(adminToken),
      apiClient.adminGetPublicSettings(adminToken),
      apiClient.adminGetCmsPages(adminToken),
      apiClient.adminGetInquiryUnreadCount(adminToken),
      apiClient.getResources(),
      apiClient.getNotices(),
      apiClient.adminGetInquiries(adminToken)
    ]);
    setMainPage(latestMainPage);
    setPublicSettings(latestPublicSettings);
    setPublicSettingsJson(JSON.stringify(latestPublicSettings, null, 2));
    setCmsPages(latestCmsPages);
    setUnreadInquiryCount(unreadCountResult.unreadCount);
    setResources(latestResources);
    setNotices(latestNotices);
    setInquiries(latestInquiries);
    setLastSyncedAt(new Date().toISOString());
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    loadAdminData(token).catch((error) => {
      const text = error instanceof Error ? error.message : t("admin.msgLoadFail");
      setMessage(text);
    });
  }, [t, token]);

  useEffect(() => {
    const payload: PersistedAdminUi = {
      activeSection,
      mainEditorTab,
      expandedGroupId,
      recentTargets
    };
    localStorage.setItem(adminUiStorageKey, JSON.stringify(payload));
  }, [activeSection, expandedGroupId, mainEditorTab, recentTargets]);

  useEffect(() => {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const nextStats = loadVisitorStats();
    const existing = nextStats.find((item) => item.date === todayKey);
    if (existing) {
      existing.count += 1;
    } else {
      nextStats.push({ date: todayKey, count: 1 });
    }
    nextStats.sort((a, b) => (a.date < b.date ? 1 : -1));
    localStorage.setItem(visitorStatsStorageKey, JSON.stringify(nextStats));
    const todayCount = nextStats.find((item) => item.date === todayKey)?.count ?? 1;
    localStorage.setItem(visitorCounterStorageKey, JSON.stringify({ date: todayKey, count: todayCount }));
    setTodayVisitorCount(todayCount);
    setVisitorStats(nextStats.slice(0, 30));
    setVisitorStatsDate(todayKey);
  }, []);

  useEffect(() => {
    if (visitorStats.length === 0) return;
    if (!visitorStats.some((item) => item.date === visitorStatsDate)) {
      setVisitorStatsDate(visitorStats[0].date);
    }
  }, [visitorStats, visitorStatsDate]);

  useEffect(() => {
    if (sortedSlides.length === 0) {
      setHeroPreviewSlideId("");
      return;
    }
    if (!sortedSlides.some((slide) => slide.id === heroPreviewSlideId)) {
      setHeroPreviewSlideId(sortedSlides[0].id);
    }
  }, [heroPreviewSlideId, sortedSlides]);

  useEffect(() => {
    setNoticePage(1);
  }, [noticeSearchField, noticeSearchQuery]);

  useEffect(() => {
    if (noticePage > noticeTotalPages) {
      setNoticePage(noticeTotalPages);
    }
  }, [noticePage, noticeTotalPages]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result = await apiClient.adminLogin(username, password);
      localStorage.setItem(tokenStorageKey, result.token);
      const nextHistory: AdminLoginHistoryItem[] = [
        {
          id: createClientId(),
          username,
          loggedInAt: new Date().toISOString(),
          userAgent: typeof navigator === "undefined" ? "-" : navigator.userAgent
        },
        ...loadLoginHistory()
      ].slice(0, 30);
      localStorage.setItem(adminLoginHistoryStorageKey, JSON.stringify(nextHistory));
      setLoginHistory(nextHistory);
      setToken(result.token);
      setMessage(t("admin.msgLoginOk"));
      setPassword("");
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgLoginFail");
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(tokenStorageKey);
    setToken(null);
    setMessage(t("admin.msgLoggedOut"));
  };

  const refreshAdminData = async () => {
    if (!token) return;
    setBusy(true);
    setMessage("");
    try {
      await loadAdminData(token);
      setMessage("최신 데이터를 불러왔습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "데이터 새로고침 실패");
    } finally {
      setBusy(false);
    }
  };

  const updateSettings = (key: keyof MainPageContent["settings"], value: string) => {
    setMainPage((prev) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  };

  const updateSlide = (id: string, patch: Partial<MainPageSlide>) => {
    setMainPage((prev) => ({
      ...prev,
      slides: prev.slides.map((slide) => (slide.id === id ? { ...slide, ...patch } : slide))
    }));
  };

  const addSlide = () => {
    const nextOrder = mainPage.slides.length;
    setMainPage((prev) => ({
      ...prev,
      slides: [...prev.slides, { id: createClientId(), imageUrl: "", sortOrder: nextOrder }]
    }));
  };

  const removeSlide = (id: string) => {
    setMainPage((prev) => {
      if (prev.slides.length <= 1) return prev;
      return { ...prev, slides: prev.slides.filter((slide) => slide.id !== id) };
    });
  };

  const updateCard = (id: string, patch: Partial<MainPageApplicationCard>) => {
    setMainPage((prev) => ({
      ...prev,
      applicationCards: prev.applicationCards.map((card) =>
        card.id === id ? { ...card, ...patch } : card
      )
    }));
  };

  const addCard = () => {
    const nextOrder = mainPage.applicationCards.length;
    setMainPage((prev) => ({
      ...prev,
      applicationCards: [
        ...prev.applicationCards,
        { id: createClientId(), label: "", imageUrl: "", linkUrl: "/product", sortOrder: nextOrder }
      ]
    }));
  };

  const removeCard = (id: string) => {
    setMainPage((prev) => {
      if (prev.applicationCards.length <= 1) return prev;
      return { ...prev, applicationCards: prev.applicationCards.filter((card) => card.id !== id) };
    });
  };

  const resetSettingToDefault = (key: keyof MainPageContent["settings"]) => {
    updateSettings(key, defaultMainPageContent.settings[key]);
  };

  const resetSlideImageToDefault = (slideId: string, order: number) => {
    const defaultSlide = defaultMainPageContent.slides[order] ?? defaultMainPageContent.slides[0];
    updateSlide(slideId, { imageUrl: defaultSlide?.imageUrl ?? "" });
  };

  const resetCardImageToDefault = (cardId: string, order: number) => {
    const defaultCard = defaultMainPageContent.applicationCards[order] ?? defaultMainPageContent.applicationCards[0];
    updateCard(cardId, { imageUrl: defaultCard?.imageUrl ?? "" });
  };

  const saveMainPage = async () => {
    if (!token) return;
    setBusy(true);
    setMessage("");
    try {
      const normalized: MainPageContent = {
        settings: mainPage.settings,
        slides: [...mainPage.slides]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((slide, index) => ({ ...slide, sortOrder: index })),
        applicationCards: [...mainPage.applicationCards]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((card, index) => ({ ...card, sortOrder: index }))
      };
      const saved = await apiClient.adminSaveMainPage(normalized, token);
      setMainPage(saved);
      setMessage("메인 페이지 변경사항을 저장했습니다.");
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgSaveFail");
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const savePublicSettings = async () => {
    if (!token) return;
    setBusy(true);
    setMessage("");
    try {
      const parsed = JSON.parse(publicSettingsJson) as PublicSiteSettings;
      const saved = await apiClient.adminSavePublicSettings(parsed, token);
      setPublicSettings(saved);
      setPublicSettingsJson(JSON.stringify(saved, null, 2));
      setMessage("페이지 메타/헤더 설정을 저장했습니다.");
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgSaveFail");
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const markInquiriesAsRead = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const result = await apiClient.adminMarkAllInquiriesRead(token);
      setUnreadInquiryCount(0);
      setInquiries((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setMessage(`알림 ${result.updatedCount}건을 읽음 처리했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "알림 읽음 처리 실패");
    } finally {
      setBusy(false);
    }
  };

  const createCmsPageEntry = async () => {
    if (!token) return;
    const slug = prompt("새 페이지 slug를 입력하세요. (예: company-ceo-custom)");
    if (!slug) return;
    const trimmed = slug.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await apiClient.adminCreateCmsPage(
        {
          slug: trimmed,
          title: trimmed,
          imageUrl: "/assets/legacy/images/sub01_-hoe-sa-so-gae_011499426360.jpg",
          markdown: ""
        },
        token
      );
      await loadAdminData(token);
      setMessage("CMS 페이지를 추가했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "CMS 페이지 추가 실패");
    } finally {
      setBusy(false);
    }
  };

  const saveCmsPageEntry = async (page: CmsPage) => {
    if (!token) return;
    setBusy(true);
    try {
      await apiClient.adminUpdateCmsPage(
        page.slug,
        { title: page.title, imageUrl: page.imageUrl, markdown: page.markdown },
        token
      );
      await loadAdminData(token);
      setMessage(`CMS 페이지(${page.slug})를 저장했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "CMS 페이지 저장 실패");
    } finally {
      setBusy(false);
    }
  };

  const deleteCmsPageEntry = async (slug: string) => {
    if (!token) return;
    if (!confirm(`${slug} 페이지를 삭제할까요?`)) return;
    setBusy(true);
    try {
      await apiClient.adminDeleteCmsPage(slug, token);
      setCmsPages((prev) => prev.filter((item) => item.slug !== slug));
      setMessage(`CMS 페이지(${slug})를 삭제했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "CMS 페이지 삭제 실패");
    } finally {
      setBusy(false);
    }
  };

  const updateCmsPageField = (slug: string, patch: Partial<CmsPage>) => {
    setCmsPages((prev) => prev.map((item) => (item.slug === slug ? { ...item, ...patch } : item)));
  };

  const openCreateResourceModal = () => {
    setResourceModalMode("create");
    setResourceEditingId(null);
    setResourceForm(defaultResourceForm);
    setResourceUploadFile(null);
    setResourceFileInputKey((prev) => prev + 1);
  };

  const openEditResourceModal = (item: ResourceItem) => {
    setResourceModalMode("edit");
    setResourceEditingId(item.id);
    setResourceForm({
      title: item.title,
      type: item.type,
      fileUrl: item.fileUrl,
      markdown: item.markdown
    });
    setResourceUploadFile(null);
    setResourceFileInputKey((prev) => prev + 1);
  };

  const closeResourceModal = () => {
    if (busy) return;
    setResourceModalMode(null);
    setResourceEditingId(null);
    setResourceUploadFile(null);
  };

  const submitResourceModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !resourceModalMode) return;
    setBusy(true);
    setMessage("");
    try {
      let resolvedFileUrl = resourceForm.fileUrl.trim();
      if (resourceUploadFile) {
        const uploaded = await apiClient.adminUploadResourceFile(resourceUploadFile, token);
        resolvedFileUrl = uploaded.url;
      }
      const payload = {
        title: resourceForm.title.trim(),
        type: resourceForm.type,
        fileUrl: resolvedFileUrl,
        markdown: resourceForm.markdown
      };
      if (resourceModalMode === "create") {
        await apiClient.adminCreateResource(payload, token);
      } else if (resourceEditingId) {
        await apiClient.adminUpdateResource(resourceEditingId, payload, token);
      }
      setResourceForm(defaultResourceForm);
      setResourceUploadFile(null);
      setResourceFileInputKey((prev) => prev + 1);
      setResourceModalMode(null);
      setResourceEditingId(null);
      await loadAdminData(token);
      setMessage(resourceModalMode === "create" ? t("admin.msgResourceAddOk") : "자료실 항목을 수정했습니다.");
    } catch (error) {
      const text =
        error instanceof Error
          ? error.message
          : resourceModalMode === "create"
            ? t("admin.msgResourceAddFail")
            : "자료실 항목 수정 실패";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const deleteResource = async (id: string) => {
    if (!token) return;
    setBusy(true);
    try {
      await apiClient.adminDeleteResource(id, token);
      setResources((prev) => prev.filter((item) => item.id !== id));
      setMessage(t("admin.msgResourceDelOk"));
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgResourceDelFail");
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const openCreateNoticeModal = () => {
    setNoticeModalMode("create");
    setNoticeEditingId(null);
    setNoticeForm(createDefaultNoticeForm());
  };

  const openEditNoticeModal = (item: NoticeItem) => {
    setNoticeModalMode("edit");
    setNoticeEditingId(item.id);
    setNoticeForm({
      title: item.title,
      publishedAt: item.publishedAt,
      markdown: item.markdown
    });
  };

  const closeNoticeModal = () => {
    if (busy) return;
    setNoticeModalMode(null);
    setNoticeEditingId(null);
  };

  const submitNoticeModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !noticeModalMode) return;
    setBusy(true);
    try {
      const payload = {
        title: noticeForm.title.trim(),
        publishedAt: noticeForm.publishedAt,
        markdown: noticeForm.markdown
      };
      if (noticeModalMode === "create") {
        await apiClient.adminCreateNotice(payload, token);
      } else if (noticeEditingId) {
        await apiClient.adminUpdateNotice(noticeEditingId, payload, token);
      }
      setNoticeModalMode(null);
      setNoticeEditingId(null);
      setNoticeForm(createDefaultNoticeForm());
      await loadAdminData(token);
      setMessage(
        noticeModalMode === "create" ? t("admin.msgNoticeAddOk") : "공지사항 항목을 수정했습니다."
      );
    } catch (error) {
      const text =
        error instanceof Error
          ? error.message
          : noticeModalMode === "create"
            ? t("admin.msgNoticeAddFail")
            : "공지사항 항목 수정 실패";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const deleteNotice = async (id: string) => {
    if (!token) return;
    setBusy(true);
    try {
      await apiClient.adminDeleteNotice(id, token);
      setNotices((prev) => prev.filter((item) => item.id !== id));
      setMessage(t("admin.msgNoticeDelOk"));
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgNoticeDelFail");
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const formatDateLabel = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString();
  };

  const formatDateTimeLabel = (value?: string) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
  };

  const formatInquiryStatusLabel = (status: InquiryItem["status"]) =>
    status === "in-review" ? "처리중" : "처리완료";

  const truncateText = (value: string, maxLength = 48) =>
    value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

  const renderDashboardSection = () => (
    <>
      <AdminPanel title="운영 대시보드" description="방문자, 문의, 콘텐츠, 동기화 상태를 한 번에 확인합니다.">
        <div className="admin-dashboard-kpis">
          <article>
            <strong>오늘 방문자</strong>
            <p>{todayVisitorCount}명</p>
          </article>
          <article>
            <strong>미확인 요청</strong>
            <p>{unreadInquiryItemsCount}건</p>
          </article>
          <article>
            <strong>처리중 문의</strong>
            <p>{pendingInquiryCount}건</p>
          </article>
          <article>
            <strong>콘텐츠 합계</strong>
            <p>{resources.length + notices.length + cmsPages.length}건</p>
          </article>
        </div>
        <div className="admin-actions">
          <button type="button" onClick={() => navigateToSection("inquiries")}>
            문의 관리
          </button>
          <button type="button" onClick={() => navigateToSection("notices")}>
            공지 관리
          </button>
          <button type="button" onClick={() => navigateToSection("resources")}>
            메뉴얼 관리
          </button>
        </div>
      </AdminPanel>

      <AdminPanel
        title="방문자 통계"
        description="일자별 시계열 방문자 집계"
        actions={
          <select
            value={visitorStatsDate}
            onChange={(event) => setVisitorStatsDate(event.target.value)}
            disabled={visitorStats.length === 0}
          >
            {visitorStats.length === 0 ? <option value={visitorStatsDate}>데이터 없음</option> : null}
            {visitorStats.map((item) => (
              <option key={item.date} value={item.date}>
                {item.date}
              </option>
            ))}
          </select>
        }
      >
        <p>기준일({visitorStatsDate}) 방문자: {selectedVisitorCount}명</p>
        {visitorStats.length === 0 ? (
          <p>방문자 데이터가 없습니다.</p>
        ) : (
          <ul className="admin-visitor-series" aria-label="방문자 시계열">
            {visitorStats.map((item) => (
              <li key={item.date}>
                <span>{item.date}</span>
                <div>
                  <em style={{ width: `${Math.round((item.count / maxVisitorCount) * 100)}%` }} />
                </div>
                <strong>{item.count}</strong>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <AdminPanel
        title="요청 알림 영역"
        description={`미확인 ${unreadInquiryItemsCount}건 · 처리중 ${pendingInquiryCount}건`}
        actions={
          <button type="button" onClick={() => navigateToSection("inquiries")}>
            요청 목록 이동
          </button>
        }
      >
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>생성일시</th>
                <th>회사</th>
                <th>이름</th>
                <th>상태</th>
                <th>확인</th>
              </tr>
            </thead>
            <tbody>
              {requestAlertItems.length === 0 ? (
                <tr>
                  <td colSpan={5}>요청 데이터가 없습니다.</td>
                </tr>
              ) : (
                requestAlertItems.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTimeLabel(item.createdAt)}</td>
                    <td>{item.company || "-"}</td>
                    <td>{item.name || "-"}</td>
                    <td>{formatInquiryStatusLabel(item.status)}</td>
                    <td>{item.isRead ? "확인" : "미확인"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <AdminPanel title="관리자 로그인 이력" description="최근 관리자 로그인 기록 30건">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>로그인 시각</th>
                <th>아이디</th>
                <th>브라우저</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.length === 0 ? (
                <tr>
                  <td colSpan={3}>로그인 이력이 없습니다.</td>
                </tr>
              ) : (
                loginHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTimeLabel(item.loggedInAt)}</td>
                    <td>{item.username}</td>
                    <td title={item.userAgent}>{truncateText(item.userAgent)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </>
  );

  const updateInquiryStatus = async (id: string, status: InquiryItem["status"]) => {
    if (!token) return;
    try {
      const updated = await apiClient.adminUpdateInquiryStatus(id, status, token);
      setInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setMessage(t("admin.msgInquiryStatusOk"));
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgInquiryStatusFail");
      setMessage(text);
    }
  };

  const renderMainPageSection = () => (
    <AdminPanel
      title="메인 페이지 관리"
      description="배너, 대표 소개(About), SH Solution, 하단 카드/푸터를 수정하고 저장합니다."
      className="admin-panel-main"
      actions={
        <button type="button" onClick={saveMainPage} disabled={busy}>
          메인 페이지 저장
        </button>
      }
    >
      <AdminSectionTabs
        label="메인 페이지 편집 탭"
        value={mainEditorTab}
        tabs={mainEditorTabs}
        onChange={setMainEditorTab}
      />

      {mainEditorTab === "hero" ? (
        <>
          <h3>메인 배너 텍스트/미리보기</h3>
          <div className="admin-main-preview">
            <p>{mainPage.settings.heroCopyTop || "상단 문구"}</p>
            <h4>{mainPage.settings.heroCopyMid || "중간 문구"}</h4>
            <p>{mainPage.settings.heroCopyBottom || "하단 문구"}</p>
            <span>{mainPage.settings.heroCtaLabel || "CTA"}</span>
          </div>
          <div className="admin-labeled-grid">
            <label className="admin-field">
              <span>상단 텍스트</span>
              <input
                value={mainPage.settings.heroCopyTop}
                onChange={(event) => updateSettings("heroCopyTop", event.target.value)}
                placeholder="SHINHOTEK"
              />
            </label>
            <label className="admin-field">
              <span>중간 텍스트</span>
              <input
                value={mainPage.settings.heroCopyMid}
                onChange={(event) => updateSettings("heroCopyMid", event.target.value)}
                placeholder="Innovation Light Changes the World"
              />
            </label>
            <label className="admin-field">
              <span>하단 텍스트</span>
              <input
                value={mainPage.settings.heroCopyBottom}
                onChange={(event) => updateSettings("heroCopyBottom", event.target.value)}
                placeholder="BEST Technology Solution"
              />
            </label>
            <label className="admin-field">
              <span>버튼 텍스트</span>
              <input
                value={mainPage.settings.heroCtaLabel}
                onChange={(event) => updateSettings("heroCtaLabel", event.target.value)}
                placeholder="ABOUT SHINHOTEK"
              />
            </label>
            <label className="admin-field">
              <span>버튼 링크</span>
              <input
                value={mainPage.settings.heroCtaHref}
                onChange={(event) => updateSettings("heroCtaHref", event.target.value)}
                placeholder="/company/ceo"
              />
            </label>
          </div>

          <h3>메인 배너 슬라이드 이미지</h3>
          <div className="admin-actions">
            <label className="admin-field admin-field-inline">
              <span>해당 슬라이드 이미지 선택(미리보기)</span>
              <select
                value={heroPreviewSlide?.id ?? ""}
                onChange={(event) => setHeroPreviewSlideId(event.target.value)}
              >
                {sortedSlides.map((slide) => (
                  <option key={slide.id} value={slide.id}>
                    Slide {slide.sortOrder + 1}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={addSlide} disabled={busy}>
              새 이미지 추가
            </button>
          </div>
          <div className="admin-image-preview-card">
            {heroPreviewSlide?.imageUrl ? (
              <img src={heroPreviewSlide.imageUrl} alt="선택된 배너 슬라이드 미리보기" />
            ) : (
              <p>선택된 슬라이드 이미지가 없습니다.</p>
            )}
          </div>
          <ul className="admin-main-image-list">
            {sortedSlides.map((slide) => (
              <li key={slide.id}>
                <div className="admin-image-preview-card small">
                  {slide.imageUrl ? <img src={slide.imageUrl} alt={`슬라이드 ${slide.sortOrder + 1}`} /> : <p>이미지 없음</p>}
                </div>
                <div className="admin-labeled-grid">
                  <label className="admin-field">
                    <span>슬라이드 이미지 URL</span>
                    <input
                      value={slide.imageUrl}
                      onChange={(event) => updateSlide(slide.id, { imageUrl: event.target.value })}
                      placeholder="/assets/... 또는 https://..."
                    />
                  </label>
                  <label className="admin-field">
                    <span>정렬 순서</span>
                    <input
                      type="number"
                      min={0}
                      value={slide.sortOrder}
                      onChange={(event) =>
                        updateSlide(slide.id, { sortOrder: Number(event.target.value) || 0 })
                      }
                    />
                  </label>
                </div>
                <div className="admin-actions">
                  <button type="button" onClick={() => resetSlideImageToDefault(slide.id, slide.sortOrder)} disabled={busy}>
                    기본 이미지로 변경
                  </button>
                  <button type="button" onClick={() => setHeroPreviewSlideId(slide.id)} disabled={busy}>
                    해당 슬라이드 선택
                  </button>
                  <button type="button" onClick={() => removeSlide(slide.id)} disabled={busy}>
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {mainEditorTab === "about" ? (
        <>
          <h3>About 섹션 미리보기</h3>
          <div className="admin-main-preview alt">
            <h4>{mainPage.settings.aboutTitle || "ABOUT SHINHOTEK"}</h4>
            <p>{mainPage.settings.aboutBody1 || "본문 1"}</p>
            <p>{mainPage.settings.aboutBody2 || "본문 2"}</p>
          </div>
          <div className="admin-image-preview-card">
            {mainPage.settings.aboutImageUrl ? (
              <img src={mainPage.settings.aboutImageUrl} alt="About 이미지 미리보기" />
            ) : (
              <p>About 이미지가 없습니다.</p>
            )}
          </div>
          <div className="admin-labeled-grid">
            <label className="admin-field">
              <span>About 제목</span>
              <input
                value={mainPage.settings.aboutTitle}
                onChange={(event) => updateSettings("aboutTitle", event.target.value)}
                placeholder="ABOUT SHINHOTEK"
              />
            </label>
            <label className="admin-field">
              <span>About 이미지 URL</span>
              <input
                value={mainPage.settings.aboutImageUrl}
                onChange={(event) => updateSettings("aboutImageUrl", event.target.value)}
                placeholder="/assets/... 또는 https://..."
              />
            </label>
            <label className="admin-field">
              <span>About 본문 1</span>
              <textarea
                value={mainPage.settings.aboutBody1}
                onChange={(event) => updateSettings("aboutBody1", event.target.value)}
                rows={3}
                placeholder="본문 1"
              />
            </label>
            <label className="admin-field">
              <span>About 본문 2</span>
              <textarea
                value={mainPage.settings.aboutBody2}
                onChange={(event) => updateSettings("aboutBody2", event.target.value)}
                rows={3}
                placeholder="본문 2"
              />
            </label>
          </div>
          <div className="admin-actions">
            <button type="button" onClick={() => resetSettingToDefault("aboutImageUrl")} disabled={busy}>
              기본 이미지로 변경
            </button>
          </div>
        </>
      ) : null}

      {mainEditorTab === "solution" ? (
        <>
          <h3>SH Solution 섹션 미리보기</h3>
          <div className="admin-main-preview alt">
            <h4>{mainPage.settings.solutionTitle || "SH SOLUTION"}</h4>
            <p>{mainPage.settings.solutionBody1 || "본문 1"}</p>
            <p>{mainPage.settings.solutionBody2 || "본문 2"}</p>
          </div>
          <div className="admin-labeled-grid">
            <label className="admin-field">
              <span>Solution 제목</span>
              <input
                value={mainPage.settings.solutionTitle}
                onChange={(event) => updateSettings("solutionTitle", event.target.value)}
                placeholder="SH SOLUTION"
              />
            </label>
            <label className="admin-field">
              <span>Solution 본문 1</span>
              <textarea
                value={mainPage.settings.solutionBody1}
                onChange={(event) => updateSettings("solutionBody1", event.target.value)}
                rows={3}
                placeholder="본문 1"
              />
            </label>
            <label className="admin-field">
              <span>Solution 본문 2</span>
              <textarea
                value={mainPage.settings.solutionBody2}
                onChange={(event) => updateSettings("solutionBody2", event.target.value)}
                rows={3}
                placeholder="본문 2"
              />
            </label>
          </div>
          <h3>Step 이미지 미리보기</h3>
          <ul className="admin-main-image-list">
            {[
              { key: "solutionStepImage1" as const, label: "Step 이미지 1" },
              { key: "solutionStepImage2" as const, label: "Step 이미지 2" },
              { key: "solutionStepImage3" as const, label: "Step 이미지 3" }
            ].map((item) => (
              <li key={item.key}>
                <div className="admin-image-preview-card small">
                  {mainPage.settings[item.key] ? (
                    <img src={mainPage.settings[item.key]} alt={`${item.label} 미리보기`} />
                  ) : (
                    <p>이미지 없음</p>
                  )}
                </div>
                <label className="admin-field">
                  <span>{item.label} URL</span>
                  <input
                    value={mainPage.settings[item.key]}
                    onChange={(event) => updateSettings(item.key, event.target.value)}
                    placeholder="/assets/... 또는 https://..."
                  />
                </label>
                <div className="admin-actions">
                  <button type="button" onClick={() => resetSettingToDefault(item.key)} disabled={busy}>
                    기본 이미지로 변경
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {mainEditorTab === "cards" ? (
        <>
          <h3>하단 카드 영역 미리보기</h3>
          <div className="admin-actions">
            <button type="button" onClick={addCard} disabled={busy}>
              새 이미지 추가
            </button>
          </div>
          <ul className="admin-main-image-list">
            {sortedCards.map((card) => (
              <li key={card.id}>
                <div className="admin-image-preview-card small">
                  {card.imageUrl ? <img src={card.imageUrl} alt={`${card.label || card.id} 카드 이미지`} /> : <p>이미지 없음</p>}
                </div>
                <div className="admin-labeled-grid">
                  <label className="admin-field">
                    <span>카드 제목</span>
                    <input
                      value={card.label}
                      onChange={(event) => updateCard(card.id, { label: event.target.value })}
                      placeholder="카드 라벨"
                    />
                  </label>
                  <label className="admin-field">
                    <span>카드 이미지 URL</span>
                    <input
                      value={card.imageUrl}
                      onChange={(event) => updateCard(card.id, { imageUrl: event.target.value })}
                      placeholder="/assets/... 또는 https://..."
                    />
                  </label>
                  <label className="admin-field">
                    <span>카드 링크</span>
                    <input
                      value={card.linkUrl}
                      onChange={(event) => updateCard(card.id, { linkUrl: event.target.value })}
                      placeholder="/product"
                    />
                  </label>
                  <label className="admin-field">
                    <span>정렬 순서</span>
                    <input
                      type="number"
                      min={0}
                      value={card.sortOrder}
                      onChange={(event) =>
                        updateCard(card.id, { sortOrder: Number(event.target.value) || 0 })
                      }
                    />
                  </label>
                </div>
                <div className="admin-actions">
                  <button type="button" onClick={() => resetCardImageToDefault(card.id, card.sortOrder)} disabled={busy}>
                    기본 이미지로 변경
                  </button>
                  <button type="button" onClick={() => removeCard(card.id)} disabled={busy}>
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {mainEditorTab === "footer" ? (
        <>
          <h3>푸터 미리보기</h3>
          <div className="admin-main-preview footer">
            <p>{mainPage.settings.footerAddress || "푸터 주소"}</p>
            <p>{mainPage.settings.footerCopyright || "저작권 문구"}</p>
          </div>
          <div className="admin-labeled-grid">
            <label className="admin-field">
              <span>주소 텍스트</span>
              <input
                value={mainPage.settings.footerAddress}
                onChange={(event) => updateSettings("footerAddress", event.target.value)}
                placeholder="푸터 주소"
              />
            </label>
            <label className="admin-field">
              <span>저작권 텍스트</span>
              <input
                value={mainPage.settings.footerCopyright}
                onChange={(event) => updateSettings("footerCopyright", event.target.value)}
                placeholder="푸터 저작권 문구"
              />
            </label>
          </div>
        </>
      ) : null}
    </AdminPanel>
  );

  const renderPublicSettingsSection = () => (
    <AdminPanel
      title="페이지 메타/헤더 설정"
      description="`routeMeta`는 경로 접두어 기준으로 가장 긴 매칭을 우선 적용합니다. 예: `/company/introduce`는 `/company` 설정을 상속하고, 별도 `/company/introduce`가 있으면 그것이 우선합니다. `subBannerImageUrl`을 비워두면 기존 CSS 배너 이미지를 fallback으로 사용합니다."
    >
      <textarea
        value={publicSettingsJson}
        onChange={(event) => setPublicSettingsJson(event.target.value)}
        rows={20}
        aria-label="public settings json"
      />
      <div className="admin-actions">
        <button type="button" onClick={savePublicSettings} disabled={busy}>
          페이지 메타/헤더 저장
        </button>
        <button
          type="button"
          onClick={() => setPublicSettingsJson(JSON.stringify(publicSettings, null, 2))}
          disabled={busy}
        >
          JSON 되돌리기
        </button>
      </div>
    </AdminPanel>
  );

  const renderCmsPagesSection = () => (
    <AdminPanel
      title="페이지 본문 CMS (Markdown)"
      description="회사 소개 영역을 우선 관리하고, 기타 페이지를 별도 영역에서 관리합니다."
    >
      <div className="admin-actions">
        <button type="button" onClick={createCmsPageEntry} disabled={busy}>
          CMS 페이지 추가
        </button>
      </div>
      <section className="admin-cms-group">
        <h3>회사 소개 영역</h3>
        <p>slug가 `company-`로 시작하는 페이지</p>
        <ul className="admin-cms-list">
          {companyCmsPages.map((page) => (
            <li key={page.slug} className="admin-cms-item">
              <div className="admin-cms-item-head">
                <strong>{page.slug}</strong>
                <span>최종수정: {new Date(page.updatedAt).toLocaleString()}</span>
              </div>
              <div className="admin-labeled-grid">
                <label className="admin-field">
                  <span>페이지 제목</span>
                  <input
                    value={page.title}
                    onChange={(event) => updateCmsPageField(page.slug, { title: event.target.value })}
                    placeholder="페이지 제목"
                  />
                </label>
                <label className="admin-field">
                  <span>대표 이미지 URL</span>
                  <input
                    value={page.imageUrl}
                    onChange={(event) => updateCmsPageField(page.slug, { imageUrl: event.target.value })}
                    placeholder="/assets/... 또는 https://..."
                  />
                </label>
              </div>
              <div className="admin-image-preview-card small">
                {page.imageUrl ? <img src={page.imageUrl} alt={`${page.slug} 대표 이미지 미리보기`} /> : <p>이미지 없음</p>}
              </div>
              <div className="admin-markdown-editor">
                <label className="admin-field">
                  <span>Markdown 에디터</span>
                  <textarea
                    rows={10}
                    value={page.markdown}
                    onChange={(event) => updateCmsPageField(page.slug, { markdown: event.target.value })}
                    placeholder="Markdown 본문"
                  />
                </label>
                <div className="admin-markdown-preview">
                  <p>미리보기</p>
                  <MarkdownBlock markdown={page.markdown || "미리보기 내용이 없습니다."} />
                </div>
              </div>
              <div className="admin-actions">
                <button type="button" onClick={() => saveCmsPageEntry(page)} disabled={busy}>
                  저장
                </button>
                <button type="button" onClick={() => deleteCmsPageEntry(page.slug)} disabled={busy}>
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-cms-group">
        <h3>기타 본문 영역</h3>
        <p>회사 소개 외 페이지</p>
        <ul className="admin-cms-list">
          {otherCmsPages.map((page) => (
            <li key={page.slug} className="admin-cms-item">
              <div className="admin-cms-item-head">
                <strong>{page.slug}</strong>
                <span>최종수정: {new Date(page.updatedAt).toLocaleString()}</span>
              </div>
              <div className="admin-labeled-grid">
                <label className="admin-field">
                  <span>페이지 제목</span>
                  <input
                    value={page.title}
                    onChange={(event) => updateCmsPageField(page.slug, { title: event.target.value })}
                    placeholder="페이지 제목"
                  />
                </label>
                <label className="admin-field">
                  <span>대표 이미지 URL</span>
                  <input
                    value={page.imageUrl}
                    onChange={(event) => updateCmsPageField(page.slug, { imageUrl: event.target.value })}
                    placeholder="/assets/... 또는 https://..."
                  />
                </label>
              </div>
              <div className="admin-image-preview-card small">
                {page.imageUrl ? <img src={page.imageUrl} alt={`${page.slug} 대표 이미지 미리보기`} /> : <p>이미지 없음</p>}
              </div>
              <div className="admin-markdown-editor">
                <label className="admin-field">
                  <span>Markdown 에디터</span>
                  <textarea
                    rows={8}
                    value={page.markdown}
                    onChange={(event) => updateCmsPageField(page.slug, { markdown: event.target.value })}
                    placeholder="Markdown 본문"
                  />
                </label>
                <div className="admin-markdown-preview">
                  <p>미리보기</p>
                  <MarkdownBlock markdown={page.markdown || "미리보기 내용이 없습니다."} />
                </div>
              </div>
              <div className="admin-actions">
                <button type="button" onClick={() => saveCmsPageEntry(page)} disabled={busy}>
                  저장
                </button>
                <button type="button" onClick={() => deleteCmsPageEntry(page.slug)} disabled={busy}>
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AdminPanel>
  );

  const renderResourcesSection = () => (
    <AdminPanel
      title="제품 메뉴얼 등록"
      actions={
        <button type="button" onClick={openCreateResourceModal} disabled={busy}>
          작성
        </button>
      }
    >
      <p>총 {sortedResources.length}건</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>유형</th>
              <th>파일</th>
              <th>생성일시</th>
              <th>수정일시</th>
              <th>수정</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {sortedResources.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.type}</td>
                <td>
                  {item.fileUrl ? (
                    <a href={item.fileUrl} target="_blank" rel="noreferrer">
                      열기
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{formatDateTimeLabel(item.createdAt)}</td>
                <td>{formatDateTimeLabel(item.updatedAt)}</td>
                <td className="admin-table-action-cell">
                  <button type="button" onClick={() => openEditResourceModal(item)} disabled={busy}>
                    수정
                  </button>
                </td>
                <td className="admin-table-action-cell">
                  <button type="button" onClick={() => deleteResource(item.id)} disabled={busy}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {resourceModalMode ? (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeResourceModal();
          }}
        >
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="resource-modal-title">
            <h3 id="resource-modal-title">
              {resourceModalMode === "create" ? "제품 메뉴얼 작성" : "제품 메뉴얼 수정"}
            </h3>
            <form onSubmit={submitResourceModal} className="admin-modal-form">
              <input
                value={resourceForm.title}
                onChange={(event) => setResourceForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder={t("admin.resourcePlaceholder")}
                required
              />
              <select
                value={resourceForm.type}
                onChange={(event) =>
                  setResourceForm((prev) => ({
                    ...prev,
                    type: event.target.value as ResourceItem["type"]
                  }))
                }
              >
                <option value="Catalog">Catalog</option>
                <option value="White Paper">White Paper</option>
                <option value="Certificate">Certificate</option>
                <option value="Case Study">Case Study</option>
              </select>
              <input
                value={resourceForm.fileUrl}
                onChange={(event) => setResourceForm((prev) => ({ ...prev, fileUrl: event.target.value }))}
                placeholder="다운로드 파일 URL 또는 경로"
              />
              <input
                key={resourceFileInputKey}
                type="file"
                onChange={(event) => setResourceUploadFile(event.target.files?.[0] ?? null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.zip,.hwp,.txt,.md"
              />
              <textarea
                rows={5}
                value={resourceForm.markdown}
                onChange={(event) => setResourceForm((prev) => ({ ...prev, markdown: event.target.value }))}
                placeholder="자료 설명 Markdown"
              />
              <div className="admin-actions">
                <button type="submit" disabled={busy}>
                  저장
                </button>
                <button type="button" onClick={closeResourceModal} disabled={busy}>
                  취소
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </AdminPanel>
  );

  const renderNoticesSection = () => (
    <AdminPanel
      title="공지사항"
      actions={
        <div className="admin-table-toolbar">
          <select
            value={noticeSearchField}
            onChange={(event) => setNoticeSearchField(event.target.value as NoticeSearchField)}
          >
            <option value="title">제목</option>
            <option value="markdown">본문</option>
            <option value="id">ID</option>
          </select>
          <input
            value={noticeSearchQuery}
            onChange={(event) => setNoticeSearchQuery(event.target.value)}
            placeholder="공지 검색어 입력"
            aria-label="공지 검색어"
          />
          <button type="button" onClick={openCreateNoticeModal} disabled={busy}>
            작성
          </button>
        </div>
      }
    >
      <p>총 {filteredNotices.length}건 (정렬: 생성일시 DESC)</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>게시일</th>
              <th>생성일시</th>
              <th>수정일시</th>
              <th>수정</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {pagedNotices.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{formatDateLabel(item.publishedAt)}</td>
                <td>{formatDateTimeLabel(item.createdAt)}</td>
                <td>{formatDateTimeLabel(item.updatedAt)}</td>
                <td className="admin-table-action-cell">
                  <button type="button" onClick={() => openEditNoticeModal(item)} disabled={busy}>
                    수정
                  </button>
                </td>
                <td className="admin-table-action-cell">
                  <button type="button" onClick={() => deleteNotice(item.id)} disabled={busy}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-pagination">
        <button type="button" onClick={() => setNoticePage((prev) => Math.max(1, prev - 1))} disabled={noticePage === 1}>
          이전
        </button>
        <span>
          {noticePage} / {noticeTotalPages}
        </span>
        <button
          type="button"
          onClick={() => setNoticePage((prev) => Math.min(noticeTotalPages, prev + 1))}
          disabled={noticePage >= noticeTotalPages}
        >
          다음
        </button>
      </div>
      {noticeModalMode ? (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeNoticeModal();
          }}
        >
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="notice-modal-title">
            <h3 id="notice-modal-title">{noticeModalMode === "create" ? "공지사항 작성" : "공지사항 수정"}</h3>
            <form onSubmit={submitNoticeModal} className="admin-modal-form">
              <input
                value={noticeForm.title}
                onChange={(event) => setNoticeForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder={t("admin.noticePlaceholder")}
                required
              />
              <input
                type="date"
                value={noticeForm.publishedAt}
                onChange={(event) =>
                  setNoticeForm((prev) => ({ ...prev, publishedAt: event.target.value }))
                }
                required
              />
              <textarea
                rows={8}
                value={noticeForm.markdown}
                onChange={(event) => setNoticeForm((prev) => ({ ...prev, markdown: event.target.value }))}
                placeholder="공지 본문 Markdown"
              />
              <div className="admin-actions">
                <button type="submit" disabled={busy}>
                  저장
                </button>
                <button type="button" onClick={closeNoticeModal} disabled={busy}>
                  취소
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </AdminPanel>
  );

  const renderInquiriesSection = () => (
    <AdminPanel title={t("admin.inquiries")}>
      <div className="admin-actions">
        <span>미확인 알림: {unreadInquiryCount}건</span>
        <button type="button" onClick={markInquiriesAsRead} disabled={busy || unreadInquiryCount === 0}>
          알림 확인(읽음 처리)
        </button>
      </div>
      <p>{t("admin.inquiryTotal", { count: sortedInquiries.length })}</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.tableCreatedAt")}</th>
              <th>유형</th>
              <th>{t("admin.tableCompany")}</th>
              <th>{t("admin.tableName")}</th>
              <th>{t("admin.tableEmail")}</th>
              <th>첨부파일</th>
              <th>{t("admin.tableStatus")}</th>
              <th>{t("admin.tableRequirements")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedInquiries.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>{item.inquiryType === "quote" ? "견적요청" : "TEST 및 DEMO"}</td>
                <td>{item.company}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>
                  {item.attachmentUrl ? (
                    <a href={item.attachmentUrl} target="_blank" rel="noreferrer">
                      {item.attachmentName || "다운로드"}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <select
                    value={item.status}
                    onChange={(event) =>
                      updateInquiryStatus(item.id, event.target.value as InquiryItem["status"])
                    }
                  >
                    <option value="in-review">처리중</option>
                    <option value="done">처리완료</option>
                  </select>
                </td>
                <td>{item.requirements || "-"}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
    </AdminPanel>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardSection();
      case "main":
        return renderMainPageSection();
      case "public-settings":
        return renderPublicSettingsSection();
      case "cms-pages":
        return renderCmsPagesSection();
      case "resources":
        return renderResourcesSection();
      case "notices":
        return renderNoticesSection();
      case "inquiries":
        return renderInquiriesSection();
      default:
        return renderDashboardSection();
    }
  };

  if (!token) {
    return (
      <main className="admin-shell">
        <section className="admin-login">
          <h1>{t("admin.loginTitle")}</h1>
          <form onSubmit={login}>
            <label>
              {t("admin.username")}
              <input value={username} onChange={(event) => setUsername(event.target.value)} />
            </label>
            <label>
              {t("admin.password")}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button type="submit" disabled={busy}>
              {busy ? t("admin.signingIn") : t("admin.signIn")}
            </button>
          </form>
          <p className="admin-hint">{t("admin.defaultCred")}</p>
          {message ? <p className="admin-message">{message}</p> : null}
          <Link to="/company/ceo">{t("admin.backToSite")}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <div className="admin-top-main">
          <h1>{t("admin.title")}</h1>
          <p>오늘 방문자: {todayVisitorCount}</p>
        </div>
        <nav className="admin-top-nav" aria-label="관리자 상단 메뉴">
          <button type="button" onClick={refreshAdminData} disabled={busy}>
            새로고침
          </button>
          <button type="button" onClick={logout}>
            {t("admin.logout")}
          </button>
          <Link to="/main">{t("admin.publicSite")}</Link>
        </nav>
      </header>

      {lastSyncedAt ? (
        <p className="admin-sync-time">최근 동기화: {new Date(lastSyncedAt).toLocaleString()}</p>
      ) : null}

      {message ? <p className="admin-message">{message}</p> : null}

      <div className="admin-layout">
        <AdminSidebar
          groups={adminNavGroups}
          activeSection={activeSection}
          mainEditorTab={mainEditorTab}
          expandedGroupId={expandedGroupId}
          unreadInquiryCount={unreadInquiryCount}
          onToggleGroup={(groupId) => setExpandedGroupId((prev) => (prev === groupId ? "" : groupId))}
          onNavigate={navigateToSection}
        />

        <section className="admin-content">{renderActiveSection()}</section>
      </div>

      <footer className="admin-recent-footer">
        <div className="admin-recent-footer-head">
          <strong>최근 접근</strong>
          {recentTargets.length > 0 ? (
            <button type="button" onClick={() => setRecentTargets([])}>
              비우기
            </button>
          ) : null}
        </div>
        {recentTargets.length === 0 ? (
          <p>아직 없음</p>
        ) : (
          <ul>
            {recentTargets.map((target, index) => (
              <li key={`${target.section}:${target.tab ?? ""}:${index}`}>
                <button type="button" onClick={() => navigateToSection(target.section, target.tab)}>
                  {getSectionLabel(target.section, target.tab)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </footer>
    </main>
  );
};

export default AdminPage;
