import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
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

const TopNavLink = ({
  to,
  label,
  activePrefix
}: {
  to: string;
  label: string;
  activePrefix: string;
}) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(activePrefix);
  return (
    <Link className={isActive ? "top-nav-link active" : "top-nav-link"} to={to}>
      {label}
    </Link>
  );
};

const LanguageSwitch = () => {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="lang-switch" aria-label={t("lang.label")}>
      <button
        type="button"
        className={locale === "ko" ? "active" : ""}
        onClick={() => setLocale("ko")}
      >
        {t("lang.ko")}
      </button>
      <button
        type="button"
        className={locale === "en" ? "active" : ""}
        onClick={() => setLocale("en")}
      >
        {t("lang.en")}
      </button>
    </div>
  );
};

export const PublicLayout = () => {
  const { locale, t } = useI18n();
  const location = useLocation();
  const [content, setContent] = useState<SiteContent>(initialSiteContent);
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [apiFallback, setApiFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
      <header className="site-header">
        <div className="container site-header-inner">
          <Link className="brand" to="/company/ceo">
            SHINHOTEK
            <span>{t("brand.tagline")}</span>
          </Link>

          <button
            className="mobile-menu-button"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={mobileMenuOpen ? "site-nav open" : "site-nav"} aria-label="Main navigation">
            <ul>
              <li className="has-submenu">
                <TopNavLink to="/company/ceo" activePrefix="/company" label={t("nav.company")} />
                <ul className="submenu">
                  <li>
                    <NavLink to="/company/ceo">{t("nav.company.ceo")}</NavLink>
                  </li>
                  <li>
                    <NavLink to="/company/vision">{t("nav.company.vision")}</NavLink>
                  </li>
                  <li>
                    <NavLink to="/company/location">{t("nav.company.location")}</NavLink>
                  </li>
                </ul>
              </li>
              <li>
                <TopNavLink to="/partner/core" activePrefix="/partner" label={t("nav.partner")} />
              </li>
              <li>
                <TopNavLink to="/product" activePrefix="/product" label={t("nav.product")} />
              </li>
              <li className="has-submenu">
                <TopNavLink to="/inquiry/quote" activePrefix="/inquiry" label={t("nav.inquiry")} />
                <ul className="submenu">
                  <li>
                    <NavLink to="/inquiry/quote">{t("nav.inquiry.quote")}</NavLink>
                  </li>
                  <li>
                    <NavLink to="/inquiry/test-demo">{t("nav.inquiry.testDemo")}</NavLink>
                  </li>
                  <li>
                    <NavLink to="/inquiry/library">{t("nav.inquiry.library")}</NavLink>
                  </li>
                </ul>
              </li>
              <li>
                <TopNavLink to="/notice" activePrefix="/notice" label={t("nav.notice")} />
              </li>
              <li>
                <NavLink className="top-nav-link admin-link" to="/admin">
                  {t("nav.admin")}
                </NavLink>
              </li>
              <li>
                <LanguageSwitch />
              </li>
            </ul>
          </nav>
        </div>
      </header>

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
