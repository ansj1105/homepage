import { legacyProductMega, legacyTopMenu } from "../features/legacy-main/data";
import type { PublicSiteSettings } from "../types";

export const defaultPublicSiteSettings: PublicSiteSettings = {
  routeMeta: [
    {
      route: "/",
      title: "신호텍 주식회사",
      faviconUrl: "/favicon.ico",
      ogImageUrl: "/assets/legacy/images/hero/main_011498524747.jpg",
      subBannerImageUrl: ""
    },
    {
      route: "/company",
      title: "신호텍 주식회사 회사소개",
      faviconUrl: "/favicon.ico",
      ogImageUrl: "/assets/legacy/images/sub01_-hoe-sa-so-gae_011499426360.jpg",
      subBannerImageUrl: "/assets/legacy/images/sub01_-hoe-sa-so-gae_011499426360.jpg"
    },
    {
      route: "/partner",
      title: "신호텍 주식회사 파트너",
      faviconUrl: "/favicon.ico",
      ogImageUrl: "/assets/legacy/images/seul-ra-i-deu11573621207.jpg",
      subBannerImageUrl: "/assets/legacy/images/sub2_1_img011499513447.jpg"
    },
    {
      route: "/product",
      title: "신호텍 주식회사 제품",
      faviconUrl: "/favicon.ico",
      ogImageUrl: "/assets/legacy/images/hero/main2_011498524728.jpg",
      subBannerImageUrl: "/assets/legacy/images/sub01_-hoe-sa-so-gae_011499426360.jpg"
    },
    {
      route: "/inquiry",
      title: "신호텍 주식회사 제품문의",
      faviconUrl: "/favicon.ico",
      ogImageUrl: "/assets/legacy/images/sub04_-je-pum-mun-ui_011499678045.jpg",
      subBannerImageUrl: "/assets/legacy/images/sub04_-je-pum-mun-ui_011499678045.jpg"
    },
    {
      route: "/notice",
      title: "신호텍 주식회사 NOTICES",
      faviconUrl: "/favicon.ico",
      ogImageUrl: "/assets/legacy/images/sub05_-gong-ji-sa-hang_011499515027.jpg",
      subBannerImageUrl: "/assets/legacy/images/sub05_-gong-ji-sa-hang_011499515027.jpg"
    },
    {
      route: "/asgasdg124af/admin",
      title: "신호텍 관리자",
      faviconUrl: "/favicon.ico",
      ogImageUrl: "/assets/legacy/images/hero/main_011498524747.jpg",
      subBannerImageUrl: ""
    }
  ],
  headerTopMenu: legacyTopMenu,
  headerProductMega: legacyProductMega
};
