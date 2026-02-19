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
}

export interface NoticeItem {
  id: string;
  title: string;
  publishedAt: string;
}

export interface ReferenceLink {
  name: string;
  url: string;
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
  benchmarkReferences: ReferenceLink[];
  quickLinks: QuickLink[];
  processSteps: string[];
  ceoMessage: string;
  visionItems: string[];
  contact: SiteContact;
}

export interface InquiryCreateRequest {
  company: string;
  position: string;
  name: string;
  email: string;
  contactNumber: string;
  requirements: string;
  consent: boolean;
}

export interface InquiryItem extends InquiryCreateRequest {
  id: string;
  status: "received" | "in-review" | "done";
  createdAt: string;
}

export interface ProductFilterCriteria {
  search?: string;
  category?: string;
  manufacturer?: string;
  maxWavelengthNm?: number;
  minPowerW?: number;
}
