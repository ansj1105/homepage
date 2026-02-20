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
}

export interface NoticeItem {
  id: string;
  title: string;
  publishedAt: string;
  markdown: string;
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
