import { z } from "zod";
import type {
  AdminLoginRequest,
  BoardPostCreateRequest,
  BoardPostUpdateRequest,
  BoardReplyCreateRequest,
  BoardReplyDeleteRequest,
  BoardReplyUpdateRequest,
  CmsPageUpsertRequest,
  InquiryCreatePayload,
  InquiryStatusRequest,
  MainPageUpsertRequest,
  PowerRankingNoteCreateRequest,
  PowerRankingNoteUpdateRequest,
  PowerRankingVoteActionRequest,
  PublicSiteSettingsUpsertRequest,
  NoticeUpsertRequest,
  ResourceUpsertRequest,
  UserLoginPayload,
  UserSignupPayload
} from "./types";

const heroSlideSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaTarget: z.string().min(1)
});

const applicationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  process: z.string().min(1),
  recommendedProductCategory: z.string().min(1)
});

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  manufacturer: z.string().min(1),
  wavelengthNm: z.string().min(1),
  powerW: z.number().nonnegative(),
  interface: z.string().min(1),
  benefit: z.string().min(1),
  datasheetUrl: z.string().min(1),
  cadUrl: z.string().min(1)
});

const partnerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["Laser", "Measurement", "Optics", "Vision"]),
  url: z.string().url()
});

const solutionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  overview: z.string().min(1),
  capabilities: z.array(z.string().min(1))
});

const quickLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url()
});

const contactSchema = z.object({
  headquarter: z.string().min(1),
  rdCenter: z.string().min(1),
  tel: z.string().min(1),
  fax: z.string().min(1),
  email: z.string().email(),
  website: z.string().min(1)
});

export const siteContentSchema = z.object({
  heroSlides: z.array(heroSlideSchema).min(1),
  applications: z.array(applicationSchema).min(1),
  products: z.array(productSchema).min(1),
  partners: z.array(partnerSchema).min(1),
  solutions: z.array(solutionSchema).min(1),
  quickLinks: z.array(quickLinkSchema),
  processSteps: z.array(z.string().min(1)).min(1),
  ceoMessage: z.string().min(1),
  visionItems: z.array(z.string().min(1)).min(1),
  contact: contactSchema
});

export const resourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["Catalog", "White Paper", "Certificate", "Case Study"]),
  fileUrl: z.string(),
  markdown: z.string()
});

export const noticeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  publishedAt: z.string().date(),
  markdown: z.string()
});

export const inquirySchema = z.object({
  id: z.string().min(1),
  inquiryType: z.enum(["quote", "test-demo"]),
  company: z.string().min(1),
  position: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  contactNumber: z.string(),
  requirements: z.string(),
  consent: z.boolean(),
  attachmentUrl: z.string().default(""),
  attachmentName: z.string().default(""),
  attachmentSize: z.number().int().nonnegative().default(0),
  attachmentMimeType: z.string().default(""),
  status: z.enum(["in-review", "done"]),
  isRead: z.boolean(),
  createdAt: z.string().datetime()
});

export const dbSchema = z.object({
  content: siteContentSchema,
  resources: z.array(resourceSchema),
  notices: z.array(noticeSchema),
  inquiries: z.array(inquirySchema)
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const resourceUpsertSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["Catalog", "White Paper", "Certificate", "Case Study"]),
  fileUrl: z.string().default(""),
  markdown: z.string().default("")
});

const noticeUpsertSchema = z.object({
  title: z.string().min(1),
  publishedAt: z.string().date(),
  markdown: z.string().default("")
});

const inquiryCreateSchema = z.object({
  inquiryType: z.enum(["quote", "test-demo"]),
  company: z.string().min(1),
  position: z.string().default(""),
  name: z.string().min(1),
  email: z.string().email(),
  contactNumber: z.string().default(""),
  requirements: z.string().default(""),
  consent: z.literal(true),
  attachmentUrl: z.string().default(""),
  attachmentName: z.string().default(""),
  attachmentSize: z.number().int().nonnegative().default(0),
  attachmentMimeType: z.string().default("")
});

const inquiryStatusSchema = z.object({
  status: z.enum(["in-review", "done"])
});

const powerRankingNoteSchema = z.object({
  content: z.string().trim().min(1).max(300)
});

const powerRankingVoteActionSchema = z.object({
  deviceId: z.string().trim().min(12).max(120),
  delta: z.union([z.literal(1), z.literal(-1)]),
  period: z.enum(["all", "weekly", "daily"]),
  faction: z.enum(["blue", "red"]).optional()
});

const powerRankingItemUseSchema = z.object({
  personId: z.string().uuid(),
  itemCode: z.enum([
    "byeokbangjun-blanket",
    "seoeuntaek-love",
    "kimdaseul-blessing",
    "blue-campus-badge",
    "red-campus-flare"
  ]),
  period: z.enum(["all", "weekly", "daily"])
});

const powerRankingEquipSchema = z.object({
  equipmentCode: z.enum([
    "training-branch",
    "iron-pickaxe",
    "fallen-order-blade",
    "crown-of-cheers",
    "star-visor",
    "mint-beret",
    "commander-jacket",
    "ribbon-cardigan",
    "golden-harness",
    "midnight-slacks",
    "wave-denim",
    "aurora-skirt",
    "thunder-boots",
    "crystal-sneakers",
    "ember-heels",
    "titan-gauntlet",
    "silk-gloves",
    "pulse-gloves"
  ])
});

const equipmentUnequipSchema = z.object({
  slot: z.enum(["weapon", "head", "top", "bottom", "shoes", "gloves"])
});

const itemSellSchema = z.object({
  inventoryType: z.enum(["equipment", "consumable"]),
  code: z.string().trim().min(1).max(80)
});

const equipmentEnhanceSchema = z.object({
  equipmentCode: z.enum([
    "training-branch",
    "iron-pickaxe",
    "fallen-order-blade",
    "crown-of-cheers",
    "star-visor",
    "mint-beret",
    "commander-jacket",
    "ribbon-cardigan",
    "golden-harness",
    "midnight-slacks",
    "wave-denim",
    "aurora-skirt",
    "thunder-boots",
    "crystal-sneakers",
    "ember-heels",
    "titan-gauntlet",
    "silk-gloves",
    "pulse-gloves"
  ]),
  currentLevel: z.number().int().min(0).max(10),
  useProtection: z.boolean()
});

const cardSelectSchema = z.object({
  cardId: z.string().trim().min(1).max(80)
});

const cardUpgradeSchema = z.object({
  cardId: z.string().trim().min(1).max(80),
  pointCost: z.number().int().min(1).max(999)
});

const shopBuySchema = z.object({
  itemId: z.string().trim().min(1).max(80)
});

const huntingCombatClickSchema = z.object({
  zoneId: z.string().trim().min(1).max(80),
  monsterId: z.string().trim().min(1).max(80),
  selectedCardId: z.string().trim().min(1).max(80).optional(),
  selectedCardLevel: z.number().int().min(1).max(50).optional()
});

const huntingCombatConsumableSchema = z.object({
  consumableCode: z.enum([
    "healing-potion",
    "medium-healing-potion",
    "power-potion",
    "berserk-tonic",
    "lucky-scroll",
    "harvest-booster",
    "energy-bar",
    "energy-drink",
    "fan-letter",
    "cheering-stick",
    "viral-ticket",
    "protection-scroll"
  ]),
  selectedCardId: z.string().trim().min(1).max(80).optional(),
  selectedCardLevel: z.number().int().min(1).max(50).optional()
});

const todayVisitorSchema = z.object({
  deviceId: z.string().trim().min(12).max(120),
  path: z.string().trim().min(1).max(300)
});

const userSignupSchema = z.object({
  username: z.string().trim().min(4).max(40),
  password: z.string().min(8).max(120),
  name: z.string().trim().min(1).max(40),
  nickname: z.string().trim().min(2).max(40)
});

const userLoginSchema = z.object({
  username: z.string().trim().min(1).max(40),
  password: z.string().min(1).max(120)
});

const boardPostCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(4000),
  fileUrl: z.string().default(""),
  fileName: z.string().default(""),
  fileSize: z.number().int().nonnegative().default(0),
  fileMimeType: z.string().default("")
});

const boardPostUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(4000)
});

const boardPasswordSchema = z.string().trim().min(1).max(80);

const boardReplyCreateSchema = z.object({
  authorName: z.string().trim().min(1).max(40),
  password: boardPasswordSchema,
  content: z.string().trim().min(1).max(1000)
});

const boardReplyUpdateSchema = z.object({
  password: boardPasswordSchema,
  content: z.string().trim().min(1).max(1000)
});

const boardReplyDeleteSchema = z.object({
  password: boardPasswordSchema
});

const mainPageSettingsSchema = z.object({
  heroCopyTop: z.string().min(1),
  heroCopyMid: z.string().min(1),
  heroCopyBottom: z.string().min(1),
  heroCtaLabel: z.string().min(1),
  heroCtaHref: z.string().min(1),
  aboutTitle: z.string().min(1),
  aboutBody1: z.string().min(1),
  aboutBody2: z.string().min(1),
  aboutImageUrl: z.string().min(1),
  solutionTitle: z.string().min(1),
  solutionBody1: z.string().min(1),
  solutionBody2: z.string().min(1),
  solutionStepImage1: z.string().min(1),
  solutionStepImage2: z.string().min(1),
  solutionStepImage3: z.string().min(1),
  footerAddress: z.string().min(1),
  footerCopyright: z.string().min(1)
});

const mainPageSlideSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().min(1),
  sortOrder: z.number().int().nonnegative()
});

const mainPageCardSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  imageUrl: z.string(),
  linkUrl: z.string().min(1),
  sortOrder: z.number().int().nonnegative()
});

const mainPageContentSchema = z.object({
  settings: mainPageSettingsSchema,
  slides: z.array(mainPageSlideSchema).min(1),
  applicationCards: z.array(mainPageCardSchema).min(1)
});

const routeMetaSchema = z.object({
  route: z.string().min(1),
  title: z.string().min(1),
  faviconUrl: z.string().min(1),
  ogImageUrl: z.string().min(1),
  subBannerImageUrl: z.string().optional()
});

type HeaderMenuItemInput = {
  id: string;
  label: string;
  href: string;
  target?: "_self" | "_blank";
  children?: HeaderMenuItemInput[];
};

const headerMenuItemSchema: z.ZodType<HeaderMenuItemInput> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    href: z.string().min(1),
    target: z.enum(["_self", "_blank"]).optional(),
    children: z.array(headerMenuItemSchema).optional()
  })
);

const publicSiteSettingsSchema = z.object({
  routeMeta: z.array(routeMetaSchema).min(1),
  headerTopMenu: z.array(headerMenuItemSchema).min(1),
  headerProductMega: z.array(headerMenuItemSchema).min(1)
}).superRefine((value, ctx) => {
  const walk = (items: HeaderMenuItemInput[], path: string) => {
    items.forEach((item, index) => {
      const current = `${path}.${index}`;
      if ((item.href === "/inquiry/quote" || item.href === "/inquiry/test-demo") && item.children?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "견적요청 / TEST 및 DEMO 페이지는 하위 페이지를 둘 수 없습니다.",
          path: ["headerTopMenu", current, "children"]
        });
      }
      if (item.children?.length) {
        walk(item.children, `${current}.children`);
      }
    });
  };
  walk(value.headerTopMenu, "headerTopMenu");
});

const cmsPageUpsertSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  imageUrl: z.string().min(1),
  markdown: z.string()
});

export const parseLogin = (value: unknown): AdminLoginRequest => loginSchema.parse(value);
export const parseSiteContent = (value: unknown) => siteContentSchema.parse(value);
export const parseResourceUpsert = (value: unknown): ResourceUpsertRequest => resourceUpsertSchema.parse(value);
export const parseNoticeUpsert = (value: unknown): NoticeUpsertRequest => noticeUpsertSchema.parse(value);
export const parseInquiryCreate = (value: unknown): InquiryCreatePayload => inquiryCreateSchema.parse(value);
export const parseInquiryStatus = (value: unknown): InquiryStatusRequest => inquiryStatusSchema.parse(value);
export const parseMainPageUpsert = (value: unknown): MainPageUpsertRequest => mainPageContentSchema.parse(value);
export const parsePublicSiteSettingsUpsert = (value: unknown): PublicSiteSettingsUpsertRequest =>
  publicSiteSettingsSchema.parse(value);
export const parseCmsPageUpsert = (value: unknown): CmsPageUpsertRequest =>
  cmsPageUpsertSchema.parse(value);
export const parsePowerRankingNoteCreate = (value: unknown): PowerRankingNoteCreateRequest =>
  powerRankingNoteSchema.parse(value);
export const parsePowerRankingNoteUpdate = (value: unknown): PowerRankingNoteUpdateRequest =>
  powerRankingNoteSchema.parse(value);
export const parsePowerRankingVoteAction = (value: unknown): PowerRankingVoteActionRequest =>
  powerRankingVoteActionSchema.parse(value);
export const parsePowerRankingItemUse = (value: unknown): import("./types").PowerRankingItemUsePayload =>
  powerRankingItemUseSchema.parse(value);
export const parsePowerRankingEquip = (value: unknown): import("./types").PowerRankingEquipPayload =>
  powerRankingEquipSchema.parse(value);
export const parseEquipmentUnequip = (value: unknown) => equipmentUnequipSchema.parse(value);
export const parseItemSell = (value: unknown) => itemSellSchema.parse(value);
export const parseEquipmentEnhance = (value: unknown) => equipmentEnhanceSchema.parse(value);
export const parseCardSelect = (value: unknown) => cardSelectSchema.parse(value);
export const parseCardUpgrade = (value: unknown) => cardUpgradeSchema.parse(value);
export const parseShopBuy = (value: unknown) => shopBuySchema.parse(value);
export const parseHuntingCombatClick = (value: unknown) => huntingCombatClickSchema.parse(value);
export const parseHuntingCombatConsumable = (value: unknown) =>
  huntingCombatConsumableSchema.parse(value);
export const parseTodayVisitor = (value: unknown): import("./types").TodayVisitorPayload =>
  todayVisitorSchema.parse(value);
export const parseUserSignup = (value: unknown): UserSignupPayload => userSignupSchema.parse(value);
export const parseUserLogin = (value: unknown): UserLoginPayload => userLoginSchema.parse(value);
export const parseBoardPostCreate = (value: unknown): BoardPostCreateRequest =>
  boardPostCreateSchema.parse(value);
export const parseBoardPostUpdate = (value: unknown): BoardPostUpdateRequest =>
  boardPostUpdateSchema.parse(value);
export const parseBoardReplyCreate = (value: unknown): BoardReplyCreateRequest =>
  boardReplyCreateSchema.parse(value);
export const parseBoardReplyUpdate = (value: unknown): BoardReplyUpdateRequest =>
  boardReplyUpdateSchema.parse(value);
export const parseBoardReplyDelete = (value: unknown): BoardReplyDeleteRequest =>
  boardReplyDeleteSchema.parse(value);
