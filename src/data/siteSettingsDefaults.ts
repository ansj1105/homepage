import { legacyProductMega, legacyTopMenu } from "../features/legacy-main/data";
import type { PublicSiteSettings } from "../types";

const yonseiFaviconUrl = "https://www.yonsei.ac.kr/favicon.ico";
const yonseiOgImageUrl = "https://yonsei.ac.kr/Web-home/_UI/images/img_symbol.png";
const baeknongHallBannerUrl = "/assets/sub/baeknong-hall-sign-banner-photo.jpg";

export const defaultPublicSiteSettings: PublicSiteSettings = {
  routeMeta: [
    {
      route: "/",
      title: "동아리연합회",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: ""
    },
    {
      route: "/company",
      title: "신호텍 주식회사 회사소개",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: baeknongHallBannerUrl
    },
    {
      route: "/application",
      title: "신호텍 주식회사 Application",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: baeknongHallBannerUrl
    },
    {
      route: "/product",
      title: "신호텍 주식회사 제품",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: baeknongHallBannerUrl
    },
    {
      route: "/solution",
      title: "신호텍 주식회사 광학솔루션",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: baeknongHallBannerUrl
    },
    {
      route: "/inquiry",
      title: "신호텍 주식회사 제품문의",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: baeknongHallBannerUrl
    },
    {
      route: "/notice",
      title: "신호텍 주식회사 NOTICES",
      faviconUrl: yonseiFaviconUrl,
      ogImageUrl: yonseiOgImageUrl,
      subBannerImageUrl: baeknongHallBannerUrl
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
