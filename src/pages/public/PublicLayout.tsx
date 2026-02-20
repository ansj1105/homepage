import { useEffect, useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { apiClient } from "../../api/client";
import { productTaxonomy } from "../../data/productTaxonomy";
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
  const phoneHref = `tel:${localizedContent.contact.tel.replace(/[^+\d]/g, "")}`;

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
          <section className="hero-band" aria-label="Site intro">
            <p>{t("site.hero.title")}</p>
            <h1>{t("site.hero.subtitle")}</h1>
            <div className="hero-band-actions">
              <Link className="primary-link" to="/product">
                {t("site.hero.primary")}
              </Link>
              <Link className="ghost-link" to="/inquiry/quote">
                {t("site.hero.secondary")}
              </Link>
            </div>
          </section>

          <section className="trust-strip" aria-label="Key metrics">
            <article>
              <strong>{localizedContent.partners.length}+</strong>
              <span>{t("site.metric.partners")}</span>
            </article>
            <article>
              <strong>{productTaxonomy.length}</strong>
              <span>{t("site.metric.categories")}</span>
            </article>
            <article>
              <strong>{localizedContent.contact.tel}</strong>
              <span>{t("site.metric.support")}</span>
            </article>
          </section>

          {loading ? <p className="status-banner">{t("site.loading")}</p> : null}
          {apiFallback ? <p className="status-banner warning">{t("site.apiFallback")}</p> : null}

          <Outlet context={outletContext} />
        </div>
      </main>

      <aside className="floating-quick" aria-label="Quick actions">
        <Link to="/inquiry/quote">{t("site.quick.quote")}</Link>
        <a href={phoneHref}>{t("site.quick.call")}</a>
        {localizedContent.quickLinks.slice(0, 2).map((item) => (
          <a key={item.label} href={item.url} target="_blank" rel="noreferrer">
            {item.label}
          </a>
        ))}
      </aside>

      <footer className="site-footer">
        <div className="container site-footer-inner">
          <div>
            <h3>SHINHOTEK Co., Ltd.</h3>
            <p>{localizedContent.contact.headquarter}</p>
            <p>
              Tel. {localizedContent.contact.tel} | Fax. {localizedContent.contact.fax}
            </p>
          </div>
          <div>
            <h3>R&D Center</h3>
            <p>{localizedContent.contact.rdCenter}</p>
            <p>
              {localizedContent.contact.email} | {localizedContent.contact.website}
            </p>
          </div>
          <div>
            <h3>{t("footer.policy")}</h3>
            <p>{t("footer.policyText")}</p>
          </div>
        </div>
      </footer>
    </>
  );
};
