export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaTarget: string;
}

export interface PartnerBrand {
  id: string;
  name: string;
  category: "Laser" | "Measurement" | "Optics" | "Vision";
  url: string;
}

export interface ApplicationCategory {
  id: string;
  name: string;
  summary: string;
  process: string;
  recommendedProductCategory: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  wavelengthNm: string;
  powerW: number;
  interface: string;
  benefit: string;
  datasheetUrl: string;
  cadUrl: string;
}

export interface SolutionArea {
  id: string;
  title: string;
  overview: string;
  capabilities: string[];
}

export interface ResourceItem {
  id: string;
  title: string;
  type: "Catalog" | "White Paper" | "Certificate" | "Case Study";
  fileUrl: string;
  markdown: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  publishedAt: string;
  markdown: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuickLink {
  label: string;
  url: string;
}

export interface SiteContact {
  headquarter: string;
  rdCenter: string;
  tel: string;
  fax: string;
  email: string;
  website: string;
}

export interface SiteContent {
  heroSlides: HeroSlide[];
  applications: ApplicationCategory[];
  products: Product[];
  partners: PartnerBrand[];
  solutions: SolutionArea[];
  quickLinks: QuickLink[];
  processSteps: string[];
  ceoMessage: string;
  visionItems: string[];
  contact: SiteContact;
}

export interface InquiryCreateRequest {
  inquiryType: "quote" | "test-demo";
  company: string;
  position: string;
  name: string;
  email: string;
  contactNumber: string;
  requirements: string;
  consent: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
}

export interface InquiryItem extends InquiryCreateRequest {
  id: string;
  status: "in-review" | "done";
  isRead: boolean;
  createdAt: string;
}

export interface UploadedFileResponse {
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface MainPageSettings {
  heroCopyTop: string;
  heroCopyMid: string;
  heroCopyBottom: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  aboutTitle: string;
  aboutBody1: string;
  aboutBody2: string;
  aboutImageUrl: string;
  solutionTitle: string;
  solutionBody1: string;
  solutionBody2: string;
  solutionStepImage1: string;
  solutionStepImage2: string;
  solutionStepImage3: string;
  footerAddress: string;
  footerCopyright: string;
}

export interface MainPageSlide {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface MainPageApplicationCard {
  id: string;
  label: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
}

export interface MainPageContent {
  settings: MainPageSettings;
  slides: MainPageSlide[];
  applicationCards: MainPageApplicationCard[];
}

export interface HeaderMenuItem {
  id: string;
  label: string;
  href: string;
  target?: "_self" | "_blank";
  children?: HeaderMenuItem[];
}

export interface RouteMetaSetting {
  route: string;
  title: string;
  faviconUrl: string;
  ogImageUrl: string;
  subBannerImageUrl?: string;
}

export interface PublicSiteSettings {
  routeMeta: RouteMetaSetting[];
  headerTopMenu: HeaderMenuItem[];
  headerProductMega: HeaderMenuItem[];
}

export interface CmsPage {
  slug: string;
  title: string;
  imageUrl: string;
  markdown: string;
  updatedAt: string;
}

export interface ProductFilterCriteria {
  search?: string;
  category?: string;
  manufacturer?: string;
  maxWavelengthNm?: number;
  minPowerW?: number;
}

export interface PowerRankingNote {
  id: string;
  personId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type PowerRankingPeriod = "all" | "weekly" | "daily";
export type PowerRankingVoteDelta = 1 | -1;
export type PowerRankingItemCode = "byeokbangjun-blanket" | "seoeuntaek-love";
export type PowerRankingEventType = "vote_up" | "vote_down" | "item_drop" | "item_use";
export type PowerRankingEquipmentSlot = "head" | "top" | "bottom" | "shoes" | "gloves";
export type PowerRankingEquipmentCode =
  | "crown-of-cheers"
  | "star-visor"
  | "mint-beret"
  | "commander-jacket"
  | "ribbon-cardigan"
  | "golden-harness"
  | "midnight-slacks"
  | "wave-denim"
  | "aurora-skirt"
  | "thunder-boots"
  | "crystal-sneakers"
  | "ember-heels"
  | "titan-gauntlet"
  | "silk-gloves"
  | "pulse-gloves";

export interface PowerRankingVoteRequest {
  deviceId: string;
  delta: PowerRankingVoteDelta;
  period: PowerRankingPeriod;
}

export interface PowerRankingItemCatalogEntry {
  code: PowerRankingItemCode;
  name: string;
  description: string;
  effectDelta: number;
  imageUrl: string;
}

export interface PowerRankingEquipmentCatalogEntry {
  code: PowerRankingEquipmentCode;
  slot: PowerRankingEquipmentSlot;
  name: string;
  description: string;
  imageUrl: string;
  effectSummary: string;
}

export interface PowerRankingEquipmentInventoryItem extends PowerRankingEquipmentCatalogEntry {
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface PowerRankingEquippedItem extends PowerRankingEquipmentCatalogEntry {
  equippedAt: string;
  updatedAt: string;
}

export interface PowerRankingEquipmentState {
  inventory: PowerRankingEquipmentInventoryItem[];
  equipped: Partial<Record<PowerRankingEquipmentSlot, PowerRankingEquippedItem>>;
}

export interface HuntingProfile {
  recommendationCoefficient: number;
  weaponAttack: number;
  battlePower: number;
  apparelMultiplier: number;
  setMultiplier: number;
  effectMultiplier: number;
  flatBonus: number;
  dropRateMultiplier: number;
  bossBonusRollRate: number;
  autoGrowthMultiplier: number;
  cardGrowthMultiplier: number;
  effectBreakdown: string[];
  equipmentInventory: PowerRankingEquipmentInventoryItem[];
  equippedItems: Partial<Record<PowerRankingEquipmentSlot, PowerRankingEquippedItem>>;
}

export interface HuntingBattleRankingEntry {
  userId: string;
  username: string;
  name: string;
  nickname: string;
  rank: number;
  battlePower: number;
  recommendationCoefficient: number;
  weaponAttack: number;
  equippedCount: number;
  apparelMultiplier: number;
  setMultiplier: number;
  updatedAt: string;
}

export interface HuntingZoneSummary {
  id: string;
  badge: string;
  chapterLabel: string;
  name: string;
  description: string;
  unlockLevel: number;
  recommendedPower: number;
  clickCost: number;
  monsterNames: string[];
  previewDrops: string[];
  hasBoss: boolean;
}

export interface HuntingMonsterView {
  id: string;
  name: string;
  imageUrl: string;
  typeLabel: string;
  rarityLabel: string;
  patternLabel: string;
  flavor: string;
  maxHp: number;
  currentHp: number;
  defense: number;
  expReward: number;
  isBoss: boolean;
  rewardSummary: string;
}

export interface HuntingZoneDropEntry {
  kind: "material" | "consumable";
  code: string;
  label: string;
  rate: number;
  min: number;
  max: number;
}

export interface HuntingZoneDetail extends HuntingZoneSummary {
  monsters: Array<HuntingMonsterView & { dropTable: HuntingZoneDropEntry[] }>;
}

export interface HuntingCombatReward {
  kind: "material" | "consumable";
  code: string;
  label: string;
  quantity: number;
}

export interface HuntingCombatState {
  zoneId: string;
  zoneName: string;
  monster: HuntingMonsterView;
  estimatedDamage: number;
  remainingClicks: number;
  totalClicks: number;
  clickCost: number;
  critRate: number;
  attackBuffCharges: number;
  dropBuffKills: number;
  protectionCharges: number;
  logs: string[];
  recentDrops: HuntingCombatReward[];
}

export interface HuntingCombatClickRequest {
  zoneId: string;
  monsterId: string;
}

export interface HuntingCombatConsumableRequest {
  consumableCode: "healing-potion" | "berserk-tonic" | "lucky-scroll" | "protection-scroll";
}

export interface HuntingCombatClickResponse {
  state: HuntingCombatState;
  damage: number;
  wasCritical: boolean;
  defeated: boolean;
  expGained: number;
  rewards: HuntingCombatReward[];
}

export interface GameHomeResponse {
  user: UserProfile;
  huntingProfile: HuntingProfile;
  equipment: PowerRankingEquipmentState;
  inventory: PowerRankingInventoryItem[];
  cards: PowerRankingPerson[];
}

export interface PowerRankingInventoryItem extends PowerRankingItemCatalogEntry {
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface PowerRankingEventLog {
  id: string;
  eventType: PowerRankingEventType;
  actorUserId: string | null;
  actorNickname: string;
  actorDeviceId: string;
  personId: string;
  personName: string;
  delta: number;
  itemCode: PowerRankingItemCode | null;
  itemName: string | null;
  itemImageUrl: string | null;
  createdAt: string;
}

export interface PowerRankingVoteResponse {
  person: PowerRankingPerson;
  droppedItem: PowerRankingInventoryItem | null;
  droppedEquipment: PowerRankingEquipmentInventoryItem | null;
}

export interface PowerRankingItemUseRequest {
  personId: string;
  itemCode: PowerRankingItemCode;
  period: PowerRankingPeriod;
}

export interface PowerRankingItemUseResponse {
  person: PowerRankingPerson;
  inventory: PowerRankingInventoryItem[];
  usedItem: PowerRankingInventoryItem;
}

export interface PowerRankingEquipRequest {
  equipmentCode: PowerRankingEquipmentCode;
}

export interface TodayVisitorRequest {
  deviceId: string;
  path: string;
}

export interface TodayVisitorResponse {
  todayVisitors: number;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  nickname: string;
  createdAt: string;
}

export interface UserSignupRequest {
  username: string;
  password: string;
  name: string;
  nickname: string;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface PowerRankingPerson {
  id: string;
  name: string;
  profileImageUrl: string;
  score: number;
  rank: number;
  createdAt: string;
  updatedAt: string;
  notes: PowerRankingNote[];
}

export interface BoardReply {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardPost {
  id: string;
  userId: string | null;
  authorName: string;
  title: string;
  content: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  recommendationCount: number;
  isBest: boolean;
  isRecommendedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
  replies: BoardReply[];
}

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
