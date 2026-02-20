import type {
  InquiryCreateRequest,
  InquiryItem,
  CmsPage,
  MainPageApplicationCard,
  MainPageContent,
  MainPageSettings,
  PublicSiteSettings,
  NoticeItem,
  ResourceItem,
  SiteContent
} from "../../src/types";

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface ResourceUpsertRequest {
  title: string;
  type: ResourceItem["type"];
  fileUrl: string;
  markdown: string;
}

export interface NoticeUpsertRequest {
  title: string;
  publishedAt: string;
  markdown: string;
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
  file_url: string;
  markdown: string;
}

export interface NoticeRow {
  id: string;
  title: string;
  published_at: string;
  markdown: string;
}

export interface InquiryRow {
  id: string;
  inquiry_type: InquiryItem["inquiryType"];
  company: string;
  position: string;
  name: string;
  email: string;
  contact_number: string;
  requirements: string;
  consent: boolean;
  attachment_url: string;
  attachment_name: string;
  attachment_size: string;
  attachment_mime_type: string;
  status: InquiryItem["status"];
  is_read: boolean;
  created_at: string;
}

export interface MainPageSettingsRow {
  hero_copy_top: string;
  hero_copy_mid: string;
  hero_copy_bottom: string;
  hero_cta_label: string;
  hero_cta_href: string;
  about_title: string;
  about_body_1: string;
  about_body_2: string;
  about_image_url: string;
  solution_title: string;
  solution_body_1: string;
  solution_body_2: string;
  solution_step_image_1: string;
  solution_step_image_2: string;
  solution_step_image_3: string;
  footer_address: string;
  footer_copyright: string;
}

export interface MainPageSlideRow {
  id: string;
  image_url: string;
  sort_order: number;
}

export interface MainPageApplicationCardRow {
  id: string;
  label: string;
  image_url: string;
  link_url: string;
  sort_order: number;
}

export type MainPageUpsertRequest = MainPageContent;

export type MainPageSlideUpsert = Omit<MainPageSlideRow, "id"> & { id?: string };
export type MainPageApplicationCardUpsert = Omit<MainPageApplicationCard, "id"> & { id?: string };
export type MainPageSettingsUpsert = MainPageSettings;

export interface PublicSiteSettingsRow {
  payload: PublicSiteSettings;
}

export type PublicSiteSettingsUpsertRequest = PublicSiteSettings;

export interface CmsPageRow {
  slug: string;
  title: string;
  image_url: string;
  markdown: string;
  updated_at: string;
}

export interface CmsPageUpsertRequest {
  slug: string;
  title: string;
  imageUrl: string;
  markdown: string;
}

export type CmsPageUpdateRequest = Omit<CmsPage, "updatedAt">;
