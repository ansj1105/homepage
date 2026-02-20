import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";
import {
  legacyProductMega,
  legacyTopMenu,
  type LegacyMenuItem
} from "../../features/legacy-main/data";
import "../../features/legacy-main/legacy-main.css";

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

export const PublicHeader = () => {
  const { locale, setLocale } = useI18n();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const openTarget = (target: LegacyMenuItem["target"]): "_self" | "_blank" => target ?? "_self";
  const renderMenuLink = (item: LegacyMenuItem, className?: string, onClick?: () => void) => {
    if (item.href.startsWith("http")) {
      return (
        <a
          className={className}
          href={item.href}
          target={openTarget(item.target)}
          rel="noreferrer"
          onClick={onClick}
        >
          {item.label}
        </a>
      );
    }
    return (
      <Link className={className} to={item.href} onClick={onClick}>
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <header className={headerScrolled ? "legacy-main-header is-scrolled" : "legacy-main-header"}>
        <div className="legacy-main-header-inner">
          <Link className="legacy-main-logo" to="/main" aria-label="SHINHOTEK home">
            <img src="/assets/legacy/images/logo/h_logo.png" alt="SHINHOTEK" />
          </Link>

          <nav className="legacy-main-nav" aria-label="Main navigation">
            <ul>
              {legacyTopMenu.map((menu) => (
                <li
                  key={menu.id}
                  className="legacy-main-nav-item"
                  onMouseEnter={() => {
                    if (menu.id === "db4958d7") {
                      setProductMenuOpen(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (menu.id === "db4958d7") {
                      setProductMenuOpen(false);
                    }
                  }}
                >
                  {renderMenuLink(menu, "legacy-main-nav-link")}
                  {menu.children ? (
                    <ul className="legacy-main-submenu">
                      {menu.children.map((child) => (
                        <li key={child.id}>{renderMenuLink(child)}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
              <li className="legacy-lang-switch">
                <LanguageSwitch />
              </li>
            </ul>
          </nav>

          <button
            type="button"
            className={mobileMenuOpen ? "legacy-main-menu-btn is-open" : "legacy-main-menu-btn"}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="메뉴 열기"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div
          className={productMenuOpen ? "legacy-main-mega is-open" : "legacy-main-mega"}
          onMouseEnter={() => setProductMenuOpen(true)}
          onMouseLeave={() => setProductMenuOpen(false)}
        >
          <div className="legacy-main-mega-inner">
            {legacyProductMega.map((menu) => (
              <div key={menu.id} className="legacy-main-mega-group">
                {renderMenuLink(menu, "legacy-main-mega-title")}
                <ul>
                  {menu.children?.map((child) => (
                    <li key={child.id}>{renderMenuLink(child)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </header>

      <aside className={mobileMenuOpen ? "legacy-main-mobile is-open" : "legacy-main-mobile"}>
        <ul>
          {legacyTopMenu.map((menu) => (
            <li key={menu.id}>
              {renderMenuLink(menu, "legacy-main-mobile-link", () => setMobileMenuOpen(false))}
              {menu.children ? (
                <ul>
                  {menu.children.map((child) => (
                    <li key={child.id}>
                      {renderMenuLink(child, "legacy-main-mobile-sub-link", () => setMobileMenuOpen(false))}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
          <li className="legacy-main-mobile-lang">
            <LanguageSwitch />
          </li>
        </ul>
      </aside>

      <button
        type="button"
        className={mobileMenuOpen ? "legacy-main-overlay is-open" : "legacy-main-overlay"}
        onClick={() => setMobileMenuOpen(false)}
        aria-label="메뉴 닫기"
      />
    </>
  );
};
