import type {
  CmsPage,
  BoardPost,
  BoardPostCreateRequest,
  BoardPostUpdateRequest,
  BoardReply,
  BoardReplyCreateRequest,
  BoardReplyDeleteRequest,
  BoardReplyUpdateRequest,
  InquiryCreateRequest,
  InquiryItem,
  MainPageContent,
  NoticeItem,
  GameHomeResponse,
  PowerRankingEquipmentState,
  PowerRankingEquipRequest,
  PowerRankingEventLog,
  HuntingProfile,
  HuntingBattleRankingEntry,
  PowerRankingInventoryItem,
  PowerRankingItemUseRequest,
  PowerRankingItemUseResponse,
  PowerRankingNote,
  PowerRankingPeriod,
  PowerRankingPerson,
  PowerRankingVoteResponse,
  PowerRankingVoteRequest,
  PublicSiteSettings,
  ResourceItem,
  SiteContent,
  TodayVisitorRequest,
  TodayVisitorResponse,
  UserLoginRequest,
  UserProfile,
  UserSignupRequest,
  UploadedFileResponse
} from "../types";
import { getOrCreateDeviceId } from "../utils/deviceId";

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
let refreshPromise: Promise<void> | null = null;

const refreshUserSession = async (): Promise<void> => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${apiBase}/api/users/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": getOrCreateDeviceId()
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Refresh failed: ${response.status}`);
        }
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const request = async <T>(
  path: string,
  options?: RequestInit,
  token?: string,
  allowRefresh = true
): Promise<T> => {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": getOrCreateDeviceId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {})
    }
  });

  if (
    response.status === 401 &&
    allowRefresh &&
    path !== "/api/users/refresh" &&
    path !== "/api/users/login" &&
    path !== "/api/users/signup" &&
    path !== "/api/users/logout"
  ) {
    await refreshUserSession();
    return request<T>(path, options, token, false);
  }

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
  signupUser: (payload: UserSignupRequest) =>
    request<UserProfile>("/api/users/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  loginUser: (payload: UserLoginRequest) =>
    request<UserProfile>("/api/users/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getCurrentUser: () => request<UserProfile>("/api/users/me", { method: "GET" }),
  refreshCurrentUser: () => request<UserProfile>("/api/users/refresh", { method: "POST" }, undefined, false),
  logoutUser: () => request<void>("/api/users/logout", { method: "POST" }, undefined, false),
  getTodayVisitors: () => request<TodayVisitorResponse>("/api/visitors/today"),
  trackTodayVisitor: (payload: TodayVisitorRequest) =>
    request<TodayVisitorResponse>("/api/visitors/track", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getContent: () => request<SiteContent>("/api/content"),
  getCmsPage: (slug: string) => request<CmsPage>(`/api/cms-pages/${slug}`),
  getPublicSettings: () => request<PublicSiteSettings>("/api/settings/public"),
  getMainPage: () => request<MainPageContent>("/api/main-page"),
  getPowerRanking: (period: PowerRankingPeriod) =>
    request<PowerRankingPerson[]>(`/api/power-ranking?period=${period}`),
  getGameHome: () => request<GameHomeResponse>("/api/game/home"),
  getHuntingProfile: () => request<HuntingProfile>("/api/hunting/stage-1"),
  getUserResources: () => request<PowerRankingInventoryItem[]>("/api/user/resources"),
  getUserEquipment: () => request<PowerRankingEquipmentState>("/api/user/equipment"),
  getUserCards: () => request<PowerRankingPerson[]>("/api/user/cards"),
  getHuntingBattleRanking: () => request<HuntingBattleRankingEntry[]>("/api/hunting/ranking"),
  getPowerRankingInventory: () => request<PowerRankingInventoryItem[]>("/api/power-ranking/inventory"),
  getPowerRankingEquipment: () => request<PowerRankingEquipmentState>("/api/power-ranking/equipment"),
  getPowerRankingEvents: () => request<PowerRankingEventLog[]>("/api/power-ranking/events"),
  getBoardPosts: (search = "") =>
    request<BoardPost[]>(`/api/board/posts?search=${encodeURIComponent(search)}`),
  getResources: () => request<ResourceItem[]>("/api/resources"),
  getNotices: () => request<NoticeItem[]>("/api/notices"),
  submitPowerRankingVote: (personId: string, payload: PowerRankingVoteRequest) =>
    request<PowerRankingVoteResponse>(`/api/power-ranking/${personId}/votes`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  usePowerRankingItem: (payload: PowerRankingItemUseRequest) =>
    request<PowerRankingItemUseResponse>("/api/power-ranking/items/use", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  equipPowerRankingEquipment: (payload: PowerRankingEquipRequest) =>
    request<PowerRankingEquipmentState>("/api/power-ranking/equipment/equip", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  createPowerRankingNote: (personId: string, content: string) =>
    request<PowerRankingNote>(`/api/power-ranking/${personId}/notes`, {
      method: "POST",
      body: JSON.stringify({ content })
    }),
  updatePowerRankingNote: (noteId: string, content: string) =>
    request<PowerRankingNote>(`/api/power-ranking/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify({ content })
    }),
  deletePowerRankingNote: (noteId: string) =>
    request<void>(`/api/power-ranking/notes/${noteId}`, {
      method: "DELETE"
    }),
  updatePowerRankingProfileImage: (personId: string, profileImageUrl: string) =>
    request<PowerRankingPerson>(`/api/power-ranking/${personId}/profile-image`, {
      method: "PUT",
      body: JSON.stringify({ profileImageUrl })
    }),
  deletePowerRankingProfileImage: (personId: string) =>
    request<PowerRankingPerson>(`/api/power-ranking/${personId}/profile-image`, {
      method: "DELETE"
    }),
  createBoardPost: (payload: BoardPostCreateRequest) =>
    request<BoardPost>("/api/board/posts", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateBoardPost: (postId: string, payload: BoardPostUpdateRequest) =>
    request<BoardPost>(`/api/board/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteBoardPost: (postId: string) =>
    request<void>(`/api/board/posts/${postId}`, {
      method: "DELETE"
    }),
  recommendBoardPost: (postId: string) =>
    request<BoardPost>(`/api/board/posts/${postId}/recommend`, {
      method: "POST"
    }),
  createBoardReply: (postId: string, payload: BoardReplyCreateRequest) =>
    request<BoardReply>(`/api/board/posts/${postId}/replies`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateBoardReply: (replyId: string, payload: BoardReplyUpdateRequest) =>
    request<BoardReply>(`/api/board/replies/${replyId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteBoardReply: (replyId: string, password: string) =>
    request<void>(`/api/board/replies/${replyId}`, {
      method: "DELETE",
      body: JSON.stringify({ password } satisfies BoardReplyDeleteRequest)
    }),
  submitInquiry: (payload: InquiryCreateRequest) =>
    request<InquiryItem>("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  uploadPowerRankingProfileImage: async (file: File) => {
    const response = await fetch(`${apiBase}/api/uploads/power-ranking-profile`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Device-Id": getOrCreateDeviceId(),
        "X-File-Name": encodeURIComponent(file.name),
        "X-File-Type": file.type || "application/octet-stream"
      },
      body: file
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message || `Upload failed: ${response.status}`);
    }
    return (await response.json()) as UploadedFileResponse;
  },
  uploadBoardAttachment: async (file: File) => {
    const response = await fetch(`${apiBase}/api/uploads/board`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Device-Id": getOrCreateDeviceId(),
        "X-File-Name": encodeURIComponent(file.name),
        "X-File-Type": file.type || "application/octet-stream"
      },
      body: file
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message || `Upload failed: ${response.status}`);
    }
    return (await response.json()) as UploadedFileResponse;
  },
  uploadInquiryAttachment: async (file: File) => {
    const response = await fetch(`${apiBase}/api/uploads/inquiry`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Device-Id": getOrCreateDeviceId(),
        "X-File-Name": encodeURIComponent(file.name),
        "X-File-Type": file.type || "application/octet-stream"
      },
      body: file
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message || `Upload failed: ${response.status}`);
    }
    return (await response.json()) as UploadedFileResponse;
  },
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
  adminUploadResourceFile: async (file: File, token: string) => {
    const response = await fetch(`${apiBase}/api/admin/uploads/resource`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
        "X-File-Name": encodeURIComponent(file.name),
        "X-File-Type": file.type || "application/octet-stream"
      },
      body: file
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message || `Upload failed: ${response.status}`);
    }
    return (await response.json()) as UploadedFileResponse;
  },
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
