import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { apiClient } from "./api/client";
import { defaultPublicSiteSettings } from "./data/siteSettingsDefaults";
import MainPage from "./features/legacy-main/LegacyMainPage";
import AdminPage from "./pages/AdminPage";
import {
  CompanyCeoPage,
  CompanyLocationPage,
  CompanyVisionPage,
  InquiryLibraryDetailPage,
  InquiryLibraryPage,
  NotFoundPage,
  NoticeDetailPage,
  NoticePage,
  PartnerCorePage,
  ProductCategoryListPage,
  ProductCategoryPage,
  ProductItemPage,
  PublicLayout,
  QuoteInquiryPage,
  TestDemoPage
} from "./pages/PublicSite";
import type { RouteMetaSetting } from "./types";

const normalizePath = (pathname: string): string => {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
};

const resolveRouteMeta = (pathname: string, routeMeta: RouteMetaSetting[]): RouteMetaSetting => {
  const normalizedPath = normalizePath(pathname);
  const sorted = [...routeMeta].sort((a, b) => b.route.length - a.route.length);
  const matched = sorted.find((item) => {
    const route = normalizePath(item.route);
    if (route === "/") return true;
    return normalizedPath === route || normalizedPath.startsWith(`${route}/`);
  });
  return matched ?? defaultPublicSiteSettings.routeMeta[0];
};

const upsertMeta = (property: "og:image" | "twitter:image", content: string) => {
  let node = document.querySelector<HTMLMetaElement>(`meta[property='${property}']`);
  if (!node && property === "twitter:image") {
    node = document.querySelector<HTMLMetaElement>(`meta[name='twitter:image']`);
  }
  if (!node) {
    node = document.createElement("meta");
    if (property.startsWith("og:")) {
      node.setAttribute("property", property);
    } else {
      node.setAttribute("name", property);
    }
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
};

const upsertFavicon = (href: string) => {
  let icon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!icon) {
    icon = document.createElement("link");
    icon.setAttribute("rel", "icon");
    document.head.appendChild(icon);
  }
  icon.setAttribute("href", href);
};

const applyRouteSubBanner = (subBannerImageUrl?: string) => {
  if (subBannerImageUrl && subBannerImageUrl.trim()) {
    document.documentElement.setAttribute("data-has-route-sub-banner", "1");
    document.documentElement.style.setProperty(
      "--route-sub-banner-image",
      `url(\"${subBannerImageUrl}\")`
    );
  } else {
    document.documentElement.setAttribute("data-has-route-sub-banner", "0");
    document.documentElement.style.removeProperty("--route-sub-banner-image");
  }
};

const SiteMetaController = () => {
  const location = useLocation();
  const [routeMeta, setRouteMeta] = useState(defaultPublicSiteSettings.routeMeta);

  useEffect(() => {
    apiClient
      .getPublicSettings()
      .then((settings) => setRouteMeta(settings.routeMeta))
      .catch(() => {
        // Keep fallback defaults.
      });
  }, []);

  const matched = useMemo(
    () => resolveRouteMeta(location.pathname, routeMeta),
    [location.pathname, routeMeta]
  );

  useEffect(() => {
    document.title = matched.title;
    upsertFavicon(matched.faviconUrl);
    upsertMeta("og:image", matched.ogImageUrl);
    upsertMeta("twitter:image", matched.ogImageUrl);
    applyRouteSubBanner(matched.subBannerImageUrl);
  }, [matched]);

  return null;
};

const App = () => (
  <BrowserRouter>
    <SiteMetaController />
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/asgasdg124af/admin" element={<AdminPage />} />
      <Route path="/admin" element={<Navigate to="/asgasdg124af/admin" replace />} />

      <Route path="/" element={<PublicLayout />}>
        <Route path="company">
          <Route index element={<Navigate to="ceo" replace />} />
          <Route path="ceo" element={<CompanyCeoPage />} />
          <Route path="vision" element={<CompanyVisionPage />} />
          <Route path="location" element={<CompanyLocationPage />} />
        </Route>

        <Route path="partner">
          <Route path="core" element={<PartnerCorePage />} />
        </Route>

        <Route path="product">
          <Route index element={<ProductCategoryListPage />} />
          <Route path=":categorySlug" element={<ProductCategoryPage />} />
          <Route path=":categorySlug/:itemSlug" element={<ProductItemPage />} />
        </Route>

        <Route path="inquiry">
          <Route path="quote" element={<QuoteInquiryPage />} />
          <Route path="test-demo" element={<TestDemoPage />} />
          <Route path="library" element={<InquiryLibraryPage />} />
          <Route path="library/:resourceId" element={<InquiryLibraryDetailPage />} />
        </Route>

        <Route path="notice" element={<NoticePage />} />
        <Route path="notice/:noticeId" element={<NoticeDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
