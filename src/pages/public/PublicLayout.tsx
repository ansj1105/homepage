import { useEffect, useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { apiClient } from "../../api/client";
import {
  initialSiteContent,
  notices as initialNotices,
  resources as initialResources
} from "../../data/siteData";
import { useI18n } from "../../i18n/I18nContext";
import { localizeSiteContent } from "../../i18n/localizeSiteContent";
import type { NoticeItem, ResourceItem, SiteContent } from "../../types";
import type { PublicOutletContext } from "./context";
import { PublicHeader } from "./PublicHeader";

export const PublicLayout = () => {
  const { locale, t } = useI18n();
  const [content, setContent] = useState<SiteContent>(initialSiteContent);
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [apiFallback, setApiFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        const [fetchedContent, fetchedResources, fetchedNotices] = await Promise.all([
          apiClient.getContent(),
          apiClient.getResources(),
          apiClient.getNotices()
        ]);

        if (!isMounted) {
          return;
        }

        setContent(fetchedContent);
        setResources(fetchedResources);
        setNotices(fetchedNotices);
        setApiFallback(false);
      } catch {
        if (!isMounted) {
          return;
        }
        setApiFallback(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAll().catch(() => {
      if (isMounted) {
        setApiFallback(true);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const localizedContent = useMemo(() => localizeSiteContent(content, locale), [content, locale]);
  const outletContext: PublicOutletContext = {
    content: localizedContent,
    resources,
    notices,
    locale,
    t
  };

  return (
    <>
      <PublicHeader />

      <main className="site-main">
        <div className="container">
          {loading ? <p className="status-banner">{t("site.loading")}</p> : null}
          {apiFallback ? <p className="status-banner warning">{t("site.apiFallback")}</p> : null}

          <Outlet context={outletContext} />
        </div>
      </main>

      <div className="footer_wrap">
        <div className="footer wrap">
          <div className="f_logo">
            <Link to="/main">
              <img src="/assets/legacy/images/logo/f_logo.png" alt="SHINHOTEK" />
            </Link>
          </div>
          <div className="f_info">
            <p className="info01">
              {localizedContent.contact.headquarter} T {localizedContent.contact.tel} F{" "}
              {localizedContent.contact.fax}
            </p>
            <p className="info02">Copyright 2017 SHINHOTEK. All Right Reserved.</p>
          </div>
          <div className="top_btn t_center">
            <span role="button" tabIndex={0} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              TOP
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
