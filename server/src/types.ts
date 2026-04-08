import type {
  BoardPost,
  BoardReply,
  InquiryCreateRequest,
  InquiryItem,
  CmsPage,
  MainPageApplicationCard,
  MainPageContent,
  MainPageSettings,
  PublicSiteSettings,
  NoticeItem,
  PowerRankingEquipmentCode,
  PowerRankingEquipmentInventoryItem,
  PowerRankingEquipmentSlot,
  PowerRankingEquipmentState,
  PowerRankingEquippedItem,
  PowerRankingEventLog,
  PowerRankingEventType,
  HuntingProfile,
  PowerRankingInventoryItem,
  PowerRankingItemCode,
  PowerRankingEquipRequest,
  PowerRankingItemUseRequest,
  PowerRankingNote,
  PowerRankingPeriod,
  PowerRankingPerson,
  PowerRankingVoteDelta,
  PowerRankingVoteResponse,
  PowerRankingVoteRequest,
  ResourceItem,
  SiteContent,
  TodayVisitorRequest,
  TodayVisitorResponse,
  UserLoginRequest,
  UserProfile,
  UserSignupRequest
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

export interface PowerRankingNoteCreateRequest {
  content: string;
}

export interface PowerRankingNoteUpdateRequest {
  content: string;
}

export interface PowerRankingVoteActionRequest extends PowerRankingVoteRequest {}
export interface PowerRankingItemUsePayload extends PowerRankingItemUseRequest {}
export interface PowerRankingEquipPayload extends PowerRankingEquipRequest {}
export interface TodayVisitorPayload extends TodayVisitorRequest {}
export interface HuntingProfileResponse extends HuntingProfile {}

export interface UserSignupPayload extends UserSignupRequest {}
export interface UserLoginPayload extends UserLoginRequest {}

export interface BoardPostCreateRequest {
  title: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
}

export interface BoardPostUpdateRequest {
  title: string;
  content: string;
}

export interface BoardReplyCreateRequest {
  authorName: string;
  password: string;
  content: string;
}

export interface BoardReplyUpdateRequest {
  password: string;
  content: string;
}

export interface BoardReplyDeleteRequest {
  password: string;
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

export interface PowerRankingPersonRow {
  id: string;
  name: string;
  profile_image_url: string;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface PowerRankingNoteRow {
  id: string;
  person_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PowerRankingVoteRow {
  id: string;
  person_id: string;
  user_id?: string | null;
  device_id: string;
  delta: PowerRankingVoteDelta;
  created_at: string;
}

export interface PowerRankingUserItemRow {
  id: string;
  user_id: string;
  item_code: PowerRankingItemCode;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface PowerRankingEquipmentInventoryRow {
  id: string;
  user_id: string;
  equipment_code: PowerRankingEquipmentCode;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface PowerRankingEquippedRow {
  user_id: string;
  slot_code: PowerRankingEquipmentSlot;
  equipment_code: PowerRankingEquipmentCode;
  equipped_at: string;
  updated_at: string;
}

export interface PowerRankingEventLogRow {
  id: string;
  event_type: PowerRankingEventType;
  actor_user_id: string | null;
  actor_nickname: string | null;
  actor_device_id: string;
  person_id: string;
  person_name: string;
  delta: number;
  item_code: PowerRankingItemCode | null;
  created_at: string;
}

export interface PowerRankingPeriodMeta {
  period: PowerRankingPeriod;
  whereSql: string;
  params: string[];
}

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}

export interface UserSessionRow {
  id: string;
  user_id: string;
  device_id: string;
  refresh_token_hash: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  last_used_at: string;
}

export type UserItem = UserProfile;

export type PowerRankingPersonWithNotes = PowerRankingPerson;
export type PowerRankingNoteItem = PowerRankingNote;
export type PowerRankingInventoryEntry = PowerRankingInventoryItem;
export type PowerRankingEventEntry = PowerRankingEventLog;
export type PowerRankingVoteResult = PowerRankingVoteResponse;
export type PowerRankingEquipmentInventoryEntry = PowerRankingEquipmentInventoryItem;
export type PowerRankingEquippedEntry = PowerRankingEquippedItem;
export type PowerRankingEquipmentStatus = PowerRankingEquipmentState;
export type TodayVisitorStats = TodayVisitorResponse;

export interface VisitorDailyVisitRow {
  id: string;
  visit_date: string;
  device_id: string;
  first_path: string;
  first_visited_at: string;
  last_visited_at: string;
}

export interface BoardPostRow {
  id: string;
  user_id: string | null;
  author_name: string;
  password: string;
  title: string;
  content: string;
  file_url: string;
  file_name: string;
  file_size: string;
  file_mime_type: string;
  recommendation_count: number;
  is_recommended_by_current_user?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardReplyRow {
  id: string;
  post_id: string;
  author_name: string;
  password: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface BoardReplyRow {
  id: string;
  post_id: string;
  author_name: string;
  password: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type BoardPostItem = BoardPost;
export type BoardReplyItem = BoardReply;
