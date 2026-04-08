import { legacyProductMega, legacyTopMenu } from "../features/legacy-main/data";
import type { PublicSiteSettings } from "../types";

const yonseiFaviconUrl = "https://www.yonsei.ac.kr/favicon.ico";
const yonseiOgImageUrl = "https://yonsei.ac.kr/Web-home/_UI/images/img_symbol.png";

export const defaultPublicSiteSettings: PublicSiteSettings = {
  routeMeta: [
    {
      route: "/",
      title: "동연 파워랭킹",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: ""
    },
    {
      route: "/company",
      title: "신호텍 주식회사 회사소개",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: "/assets/legacy/images/sub01_-hoe-sa-so-gae_011499426360.jpg"
    },
    {
      route: "/application",
      title: "신호텍 주식회사 Application",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: "/assets/legacy/images/hero/main_011500862913.jpg"
    },
    {
      route: "/product",
      title: "신호텍 주식회사 제품",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: "/assets/legacy/images/sub01_-hoe-sa-so-gae_011499426360.jpg"
    },
    {
      route: "/solution",
      title: "신호텍 주식회사 광학솔루션",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: "/assets/legacy/images/section/main_part02_bg02.png"
    },
    {
      route: "/inquiry",
      title: "신호텍 주식회사 제품문의",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: "/assets/legacy/images/sub04_-je-pum-mun-ui_011499678045.jpg"
    },
    {
      route: "/notice",
      title: "신호텍 주식회사 NOTICES",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: "/assets/legacy/images/sub05_-gong-ji-sa-hang_011499515027.jpg"
    },
    {
      route: "/asgasdg124af/admin",
      title: "신호텍 관리자",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: ""
    }
  ],
  headerTopMenu: legacyTopMenu,
  headerProductMega: legacyProductMega
};
