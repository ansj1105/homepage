import type { InquiryCreateRequest, InquiryItem, NoticeItem, ResourceItem, SiteContent } from "../../src/types";

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface ResourceUpsertRequest {
  title: string;
  type: ResourceItem["type"];
}

export interface NoticeUpsertRequest {
  title: string;
  publishedAt: string;
}

export interface InquiryStatusRequest {
  status: InquiryItem["status"];
}

export type InquiryCreatePayload = InquiryCreateRequest;

export interface ContentRow {
  payload: SiteContent;
}

export interface ResourceRow {
  id: string;
  title: string;
  type: ResourceItem["type"];
}

export interface NoticeRow {
  id: string;
  title: string;
  published_at: string;
}

export interface InquiryRow {
  id: string;
  company: string;
  position: string;
  name: string;
  email: string;
  contact_number: string;
  requirements: string;
  consent: boolean;
  status: InquiryItem["status"];
  created_at: string;
}
