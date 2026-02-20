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
  adminNavGroups,
  mainEditorTabs
} from "../components/admin/adminNavigation";
import { defaultCmsPages } from "../data/cmsPageDefaults";
import { defaultMainPageContent } from "../data/mainPageDefaults";
import { defaultPublicSiteSettings } from "../data/siteSettingsDefaults";
import { notices as initialNotices, resources as initialResources } from "../data/siteData";
import { useI18n } from "../i18n/I18nContext";
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
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState<ResourceItem["type"]>("Catalog");
  const [resourceFileUrl, setResourceFileUrl] = useState("");
  const [resourceUploadFile, setResourceUploadFile] = useState<File | null>(null);
  const [resourceFileInputKey, setResourceFileInputKey] = useState(0);
  const [resourceMarkdown, setResourceMarkdown] = useState("");
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().slice(0, 10));
  const [noticeMarkdown, setNoticeMarkdown] = useState("");
  const [unreadInquiryCount, setUnreadInquiryCount] = useState(0);
  const [activeSection, setActiveSection] = useState<AdminSectionId>(
    persistedUi.activeSection ?? "main"
  );
  const [mainEditorTab, setMainEditorTab] = useState<MainEditorTab>(
    persistedUi.mainEditorTab ?? "hero"
  );
  const [expandedGroupId, setExpandedGroupId] = useState<string>(
    persistedUi.expandedGroupId ?? "site"
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

  const sortedCards = useMemo(
    () => [...mainPage.applicationCards].sort((a, b) => a.sortOrder - b.sortOrder),
    [mainPage.applicationCards]
  );

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

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result = await apiClient.adminLogin(username, password);
      localStorage.setItem(tokenStorageKey, result.token);
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

  const createResource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    setMessage("");
    try {
      let resolvedFileUrl = resourceFileUrl.trim();
      if (resourceUploadFile) {
        const uploaded = await apiClient.adminUploadResourceFile(resourceUploadFile, token);
        resolvedFileUrl = uploaded.url;
      }
      await apiClient.adminCreateResource(
        {
          title: resourceTitle,
          type: resourceType,
          fileUrl: resolvedFileUrl,
          markdown: resourceMarkdown
        },
        token
      );
      setResourceTitle("");
      setResourceFileUrl("");
      setResourceUploadFile(null);
      setResourceFileInputKey((prev) => prev + 1);
      setResourceMarkdown("");
      await loadAdminData(token);
      setMessage(t("admin.msgResourceAddOk"));
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgResourceAddFail");
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

  const updateResourceEntry = async (resource: ResourceItem) => {
    if (!token) return;
    setBusy(true);
    try {
      await apiClient.adminUpdateResource(
        resource.id,
        {
          title: resource.title,
          type: resource.type,
          fileUrl: resource.fileUrl,
          markdown: resource.markdown
        },
        token
      );
      setMessage("자료실 항목을 수정했습니다.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "자료실 항목 수정 실패";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const createNotice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await apiClient.adminCreateNotice(
        { title: noticeTitle, publishedAt: noticeDate, markdown: noticeMarkdown },
        token
      );
      setNoticeTitle("");
      setNoticeMarkdown("");
      await loadAdminData(token);
      setMessage(t("admin.msgNoticeAddOk"));
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgNoticeAddFail");
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

  const updateNoticeEntry = async (notice: NoticeItem) => {
    if (!token) return;
    setBusy(true);
    try {
      await apiClient.adminUpdateNotice(
        notice.id,
        { title: notice.title, publishedAt: notice.publishedAt, markdown: notice.markdown },
        token
      );
      setMessage("공지사항 항목을 수정했습니다.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "공지사항 항목 수정 실패";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

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
          <h3>메인 배너 텍스트</h3>
          <div className="admin-inline-form">
            <input
              value={mainPage.settings.heroCopyTop}
              onChange={(event) => updateSettings("heroCopyTop", event.target.value)}
              placeholder="상단 문구"
            />
            <input
              value={mainPage.settings.heroCopyMid}
              onChange={(event) => updateSettings("heroCopyMid", event.target.value)}
              placeholder="중간 문구"
            />
            <input
              value={mainPage.settings.heroCopyBottom}
              onChange={(event) => updateSettings("heroCopyBottom", event.target.value)}
              placeholder="하단 문구"
            />
            <input
              value={mainPage.settings.heroCtaLabel}
              onChange={(event) => updateSettings("heroCtaLabel", event.target.value)}
              placeholder="CTA 라벨"
            />
            <input
              value={mainPage.settings.heroCtaHref}
              onChange={(event) => updateSettings("heroCtaHref", event.target.value)}
              placeholder="CTA 링크 (/company/ceo)"
            />
          </div>

          <h3>메인 배너 슬라이드 이미지</h3>
          <div className="admin-actions">
            <button type="button" onClick={addSlide} disabled={busy}>
              슬라이드 추가
            </button>
          </div>
          <ul className="admin-list">
            {sortedSlides.map((slide) => (
              <li key={slide.id}>
                <div>
                  <strong>{slide.id}</strong>
                  <span>정렬: {slide.sortOrder}</span>
                  <input
                    value={slide.imageUrl}
                    onChange={(event) => updateSlide(slide.id, { imageUrl: event.target.value })}
                    placeholder="/assets/... 또는 https://..."
                  />
                  <input
                    type="number"
                    min={0}
                    value={slide.sortOrder}
                    onChange={(event) =>
                      updateSlide(slide.id, { sortOrder: Number(event.target.value) || 0 })
                    }
                  />
                </div>
                <button type="button" onClick={() => removeSlide(slide.id)} disabled={busy}>
                  {t("admin.delete")}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {mainEditorTab === "about" ? (
        <>
          <h3>About 섹션</h3>
          <div className="admin-inline-form">
            <input
              value={mainPage.settings.aboutTitle}
              onChange={(event) => updateSettings("aboutTitle", event.target.value)}
              placeholder="About 제목"
            />
            <input
              value={mainPage.settings.aboutImageUrl}
              onChange={(event) => updateSettings("aboutImageUrl", event.target.value)}
              placeholder="About 이미지 URL"
            />
            <textarea
              value={mainPage.settings.aboutBody1}
              onChange={(event) => updateSettings("aboutBody1", event.target.value)}
              rows={3}
              placeholder="About 본문 1 (Markdown)"
            />
            <textarea
              value={mainPage.settings.aboutBody2}
              onChange={(event) => updateSettings("aboutBody2", event.target.value)}
              rows={3}
              placeholder="About 본문 2 (Markdown)"
            />
          </div>
        </>
      ) : null}

      {mainEditorTab === "solution" ? (
        <>
          <h3>하단(SH Solution) 섹션</h3>
          <div className="admin-inline-form">
            <input
              value={mainPage.settings.solutionTitle}
              onChange={(event) => updateSettings("solutionTitle", event.target.value)}
              placeholder="Solution 제목"
            />
            <input
              value={mainPage.settings.solutionStepImage1}
              onChange={(event) => updateSettings("solutionStepImage1", event.target.value)}
              placeholder="Step 이미지 1"
            />
            <input
              value={mainPage.settings.solutionStepImage2}
              onChange={(event) => updateSettings("solutionStepImage2", event.target.value)}
              placeholder="Step 이미지 2"
            />
            <input
              value={mainPage.settings.solutionStepImage3}
              onChange={(event) => updateSettings("solutionStepImage3", event.target.value)}
              placeholder="Step 이미지 3"
            />
            <textarea
              value={mainPage.settings.solutionBody1}
              onChange={(event) => updateSettings("solutionBody1", event.target.value)}
              rows={3}
              placeholder="Solution 본문 1 (Markdown)"
            />
            <textarea
              value={mainPage.settings.solutionBody2}
              onChange={(event) => updateSettings("solutionBody2", event.target.value)}
              rows={3}
              placeholder="Solution 본문 2 (Markdown)"
            />
          </div>
        </>
      ) : null}

      {mainEditorTab === "cards" ? (
        <>
          <h3>하단 카드 영역</h3>
          <div className="admin-actions">
            <button type="button" onClick={addCard} disabled={busy}>
              카드 추가
            </button>
          </div>
          <ul className="admin-list">
            {sortedCards.map((card) => (
              <li key={card.id}>
                <div>
                  <strong>{card.id}</strong>
                  <input
                    value={card.label}
                    onChange={(event) => updateCard(card.id, { label: event.target.value })}
                    placeholder="카드 라벨"
                  />
                  <input
                    value={card.imageUrl}
                    onChange={(event) => updateCard(card.id, { imageUrl: event.target.value })}
                    placeholder="카드 이미지 URL"
                  />
                  <input
                    value={card.linkUrl}
                    onChange={(event) => updateCard(card.id, { linkUrl: event.target.value })}
                    placeholder="카드 링크 (/product)"
                  />
                  <input
                    type="number"
                    min={0}
                    value={card.sortOrder}
                    onChange={(event) =>
                      updateCard(card.id, { sortOrder: Number(event.target.value) || 0 })
                    }
                  />
                </div>
                <button type="button" onClick={() => removeCard(card.id)} disabled={busy}>
                  {t("admin.delete")}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {mainEditorTab === "footer" ? (
        <>
          <h3>푸터</h3>
          <div className="admin-inline-form">
            <input
              value={mainPage.settings.footerAddress}
              onChange={(event) => updateSettings("footerAddress", event.target.value)}
              placeholder="푸터 주소"
            />
            <input
              value={mainPage.settings.footerCopyright}
              onChange={(event) => updateSettings("footerCopyright", event.target.value)}
              placeholder="푸터 저작권 문구"
            />
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
      description="대상: `company-ceo`, `company-vision`, `partner-core` (필요 시 추가 가능)"
    >
      <div className="admin-actions">
        <button type="button" onClick={createCmsPageEntry} disabled={busy}>
          CMS 페이지 추가
        </button>
      </div>
      <ul className="admin-list">
        {cmsPages.map((page) => (
          <li key={page.slug}>
            <div>
              <strong>{page.slug}</strong>
              <input
                value={page.title}
                onChange={(event) =>
                  setCmsPages((prev) =>
                    prev.map((item) =>
                      item.slug === page.slug ? { ...item, title: event.target.value } : item
                    )
                  )
                }
                placeholder="페이지 제목"
              />
              <input
                value={page.imageUrl}
                onChange={(event) =>
                  setCmsPages((prev) =>
                    prev.map((item) =>
                      item.slug === page.slug ? { ...item, imageUrl: event.target.value } : item
                    )
                  )
                }
                placeholder="대표 이미지 URL"
              />
              <textarea
                rows={8}
                value={page.markdown}
                onChange={(event) =>
                  setCmsPages((prev) =>
                    prev.map((item) =>
                      item.slug === page.slug ? { ...item, markdown: event.target.value } : item
                    )
                  )
                }
                placeholder="Markdown 본문"
              />
              <span>최종수정: {new Date(page.updatedAt).toLocaleString()}</span>
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
    </AdminPanel>
  );

  const renderResourcesSection = () => (
    <AdminPanel title={t("admin.resources")}>
      <form onSubmit={createResource} className="admin-inline-form">
        <input
          value={resourceTitle}
          onChange={(event) => setResourceTitle(event.target.value)}
          placeholder={t("admin.resourcePlaceholder")}
          required
        />
        <select
          value={resourceType}
          onChange={(event) => setResourceType(event.target.value as ResourceItem["type"])}
        >
          <option value="Catalog">Catalog</option>
          <option value="White Paper">White Paper</option>
          <option value="Certificate">Certificate</option>
          <option value="Case Study">Case Study</option>
        </select>
        <input
          value={resourceFileUrl}
          onChange={(event) => setResourceFileUrl(event.target.value)}
          placeholder="다운로드 파일 URL 또는 경로"
        />
        <input
          key={resourceFileInputKey}
          type="file"
          onChange={(event) => setResourceUploadFile(event.target.files?.[0] ?? null)}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.zip,.hwp,.txt,.md"
        />
        <textarea
          rows={4}
          value={resourceMarkdown}
          onChange={(event) => setResourceMarkdown(event.target.value)}
          placeholder="자료 설명 Markdown"
        />
        <button type="submit" disabled={busy}>
          {t("admin.add")}
        </button>
      </form>
      <ul className="admin-list">
        {resources.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.id}</strong>
              <input
                value={item.title}
                onChange={(event) =>
                  setResources((prev) =>
                    prev.map((r) => (r.id === item.id ? { ...r, title: event.target.value } : r))
                  )
                }
                placeholder="자료 제목"
              />
              <select
                value={item.type}
                onChange={(event) =>
                  setResources((prev) =>
                    prev.map((r) =>
                      r.id === item.id
                        ? { ...r, type: event.target.value as ResourceItem["type"] }
                        : r
                    )
                  )
                }
              >
                <option value="Catalog">Catalog</option>
                <option value="White Paper">White Paper</option>
                <option value="Certificate">Certificate</option>
                <option value="Case Study">Case Study</option>
              </select>
              <input
                value={item.fileUrl}
                onChange={(event) =>
                  setResources((prev) =>
                    prev.map((r) => (r.id === item.id ? { ...r, fileUrl: event.target.value } : r))
                  )
                }
                placeholder="파일 URL"
              />
              <textarea
                rows={4}
                value={item.markdown}
                onChange={(event) =>
                  setResources((prev) =>
                    prev.map((r) => (r.id === item.id ? { ...r, markdown: event.target.value } : r))
                  )
                }
                placeholder="Markdown 본문"
              />
            </div>
            <div className="admin-actions">
              <button type="button" onClick={() => updateResourceEntry(item)} disabled={busy}>
                저장
              </button>
              <button type="button" onClick={() => deleteResource(item.id)} disabled={busy}>
                {t("admin.delete")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </AdminPanel>
  );

  const renderNoticesSection = () => (
    <AdminPanel title={t("admin.notices")}>
      <form onSubmit={createNotice} className="admin-inline-form">
        <input
          value={noticeTitle}
          onChange={(event) => setNoticeTitle(event.target.value)}
          placeholder={t("admin.noticePlaceholder")}
          required
        />
        <input
          type="date"
          value={noticeDate}
          onChange={(event) => setNoticeDate(event.target.value)}
          required
        />
        <textarea
          rows={4}
          value={noticeMarkdown}
          onChange={(event) => setNoticeMarkdown(event.target.value)}
          placeholder="공지 본문 Markdown"
        />
        <button type="submit" disabled={busy}>
          {t("admin.add")}
        </button>
      </form>
      <ul className="admin-list">
        {notices.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.id}</strong>
              <input
                value={item.title}
                onChange={(event) =>
                  setNotices((prev) =>
                    prev.map((n) => (n.id === item.id ? { ...n, title: event.target.value } : n))
                  )
                }
                placeholder="공지 제목"
              />
              <input
                type="date"
                value={item.publishedAt}
                onChange={(event) =>
                  setNotices((prev) =>
                    prev.map((n) =>
                      n.id === item.id ? { ...n, publishedAt: event.target.value } : n
                    )
                  )
                }
              />
              <textarea
                rows={4}
                value={item.markdown}
                onChange={(event) =>
                  setNotices((prev) =>
                    prev.map((n) => (n.id === item.id ? { ...n, markdown: event.target.value } : n))
                  )
                }
                placeholder="공지 본문 Markdown"
              />
            </div>
            <div className="admin-actions">
              <button type="button" onClick={() => updateNoticeEntry(item)} disabled={busy}>
                저장
              </button>
              <button type="button" onClick={() => deleteNotice(item.id)} disabled={busy}>
                {t("admin.delete")}
              </button>
            </div>
          </li>
        ))}
      </ul>
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
        return renderMainPageSection();
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
        <h1>{t("admin.title")}</h1>
        <div>
          <button type="button" onClick={refreshAdminData} disabled={busy}>
            새로고침
          </button>
          <button type="button" onClick={logout}>
            {t("admin.logout")}
          </button>
          <Link to="/main">{t("admin.publicSite")}</Link>
        </div>
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
          recentTargets={recentTargets}
          onClearRecent={() => setRecentTargets([])}
          onToggleGroup={(groupId) => setExpandedGroupId((prev) => (prev === groupId ? "" : groupId))}
          onNavigate={navigateToSection}
        />

        <section className="admin-content">{renderActiveSection()}</section>
      </div>
    </main>
  );
};

export default AdminPage;
