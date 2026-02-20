import { z } from "zod";
import type {
  AdminLoginRequest,
  CmsPageUpsertRequest,
  InquiryCreatePayload,
  InquiryStatusRequest,
  MainPageUpsertRequest,
  PublicSiteSettingsUpsertRequest,
  NoticeUpsertRequest,
  ResourceUpsertRequest
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
