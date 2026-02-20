import type {
  CmsPage,
  InquiryCreateRequest,
  InquiryItem,
  MainPageContent,
  NoticeItem,
  PublicSiteSettings,
  ResourceItem,
  SiteContent
} from "../types";

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";

const request = async <T>(
  path: string,
  options?: RequestInit,
  token?: string
): Promise<T> => {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {})
    }
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // Ignore parsing errors for non-JSON responses.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const apiClient = {
  getContent: () => request<SiteContent>("/api/content"),
  getCmsPage: (slug: string) => request<CmsPage>(`/api/cms-pages/${slug}`),
  getPublicSettings: () => request<PublicSiteSettings>("/api/settings/public"),
  getMainPage: () => request<MainPageContent>("/api/main-page"),
  getResources: () => request<ResourceItem[]>("/api/resources"),
  getNotices: () => request<NoticeItem[]>("/api/notices"),
  submitInquiry: (payload: InquiryCreateRequest) =>
    request<InquiryItem>("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  adminLogin: (username: string, password: string) =>
    request<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    }),
  adminGetInquiries: (token: string) =>
    request<InquiryItem[]>("/api/admin/inquiries", { method: "GET" }, token),
  adminGetInquiryUnreadCount: (token: string) =>
    request<{ unreadCount: number }>("/api/admin/inquiries/unread-count", { method: "GET" }, token),
  adminMarkAllInquiriesRead: (token: string) =>
    request<{ updatedCount: number }>("/api/admin/inquiries/read-all", { method: "PUT" }, token),
  adminUpdateInquiryStatus: (id: string, status: InquiryItem["status"], token: string) =>
    request<InquiryItem>(
      `/api/admin/inquiries/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status })
      },
      token
    ),
  adminSaveContent: (content: SiteContent, token: string) =>
    request<SiteContent>(
      "/api/admin/content",
      {
        method: "PUT",
        body: JSON.stringify(content)
      },
      token
    ),
  adminGetMainPage: (token: string) =>
    request<MainPageContent>("/api/admin/main-page", { method: "GET" }, token),
  adminSaveMainPage: (content: MainPageContent, token: string) =>
    request<MainPageContent>(
      "/api/admin/main-page",
      {
        method: "PUT",
        body: JSON.stringify(content)
      },
      token
    ),
  adminGetPublicSettings: (token: string) =>
    request<PublicSiteSettings>("/api/admin/settings/public", { method: "GET" }, token),
  adminSavePublicSettings: (settings: PublicSiteSettings, token: string) =>
    request<PublicSiteSettings>(
      "/api/admin/settings/public",
      { method: "PUT", body: JSON.stringify(settings) },
      token
    ),
  adminGetCmsPages: (token: string) =>
    request<CmsPage[]>("/api/admin/cms-pages", { method: "GET" }, token),
  adminCreateCmsPage: (payload: Omit<CmsPage, "updatedAt">, token: string) =>
    request<CmsPage>(
      "/api/admin/cms-pages",
      { method: "POST", body: JSON.stringify(payload) },
      token
    ),
  adminUpdateCmsPage: (slug: string, payload: Omit<CmsPage, "updatedAt" | "slug">, token: string) =>
    request<CmsPage>(
      `/api/admin/cms-pages/${slug}`,
      { method: "PUT", body: JSON.stringify(payload) },
      token
    ),
  adminDeleteCmsPage: (slug: string, token: string) =>
    request<void>(`/api/admin/cms-pages/${slug}`, { method: "DELETE" }, token),
  adminCreateResource: (payload: Omit<ResourceItem, "id">, token: string) =>
    request<ResourceItem>(
      "/api/admin/resources",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      token
    ),
  adminUpdateResource: (id: string, payload: Omit<ResourceItem, "id">, token: string) =>
    request<ResourceItem>(
      `/api/admin/resources/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload)
      },
      token
    ),
  adminDeleteResource: (id: string, token: string) =>
    request<void>(`/api/admin/resources/${id}`, { method: "DELETE" }, token),
  adminCreateNotice: (payload: Omit<NoticeItem, "id">, token: string) =>
    request<NoticeItem>(
      "/api/admin/notices",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      token
    ),
  adminUpdateNotice: (id: string, payload: Omit<NoticeItem, "id">, token: string) =>
    request<NoticeItem>(
      `/api/admin/notices/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload)
      },
      token
    ),
  adminDeleteNotice: (id: string, token: string) =>
    request<void>(`/api/admin/notices/${id}`, { method: "DELETE" }, token)
};
