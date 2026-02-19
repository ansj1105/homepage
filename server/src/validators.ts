import { z } from "zod";
import type { AdminLoginRequest, InquiryCreatePayload, InquiryStatusRequest, NoticeUpsertRequest, ResourceUpsertRequest } from "./types";

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
  type: z.enum(["Catalog", "White Paper", "Certificate", "Case Study"])
});

export const noticeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  publishedAt: z.string().date()
});

export const inquirySchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  position: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  contactNumber: z.string(),
  requirements: z.string(),
  consent: z.boolean(),
  status: z.enum(["received", "in-review", "done"]),
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
  type: z.enum(["Catalog", "White Paper", "Certificate", "Case Study"])
});

const noticeUpsertSchema = z.object({
  title: z.string().min(1),
  publishedAt: z.string().date()
});

const inquiryCreateSchema = z.object({
  company: z.string().min(1),
  position: z.string().default(""),
  name: z.string().min(1),
  email: z.string().email(),
  contactNumber: z.string().default(""),
  requirements: z.string().default(""),
  consent: z.literal(true)
});

const inquiryStatusSchema = z.object({
  status: z.enum(["received", "in-review", "done"])
});

export const parseLogin = (value: unknown): AdminLoginRequest => loginSchema.parse(value);
export const parseSiteContent = (value: unknown) => siteContentSchema.parse(value);
export const parseResourceUpsert = (value: unknown): ResourceUpsertRequest => resourceUpsertSchema.parse(value);
export const parseNoticeUpsert = (value: unknown): NoticeUpsertRequest => noticeUpsertSchema.parse(value);
export const parseInquiryCreate = (value: unknown): InquiryCreatePayload => inquiryCreateSchema.parse(value);
export const parseInquiryStatus = (value: unknown): InquiryStatusRequest => inquiryStatusSchema.parse(value);
