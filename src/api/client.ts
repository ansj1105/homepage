import type {
  InquiryCreateRequest,
  InquiryItem,
  NoticeItem,
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
  adminCreateResource: (payload: Omit<ResourceItem, "id">, token: string) =>
    request<ResourceItem>(
      "/api/admin/resources",
      {
        method: "POST",
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
  adminDeleteNotice: (id: string, token: string) =>
    request<void>(`/api/admin/notices/${id}`, { method: "DELETE" }, token)
};
