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
      route: "/application",
      title: "신호텍 주식회사 Application",
      faviconUrl: "/favicon.ico",
      ogImageUrl: "/assets/legacy/images/hero/main_011500862913.jpg",
      subBannerImageUrl: "/assets/legacy/images/hero/main_011500862913.jpg"
    },
    {
      route: "/product",
      title: "신호텍 주식회사 제품",
      faviconUrl: "/favicon.ico",
      ogImageUrl: "/assets/legacy/images/hero/main2_011498524728.jpg",
      subBannerImageUrl: "/assets/legacy/images/sub01_-hoe-sa-so-gae_011499426360.jpg"
    },
    {
      route: "/solution",
      title: "신호텍 주식회사 광학솔루션",
      faviconUrl: "/favicon.ico",
      ogImageUrl: "/assets/legacy/images/section/main_part02_bg02.png",
      subBannerImageUrl: "/assets/legacy/images/section/main_part02_bg02.png"
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
