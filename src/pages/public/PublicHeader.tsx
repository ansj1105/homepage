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
  const { locale, setLocale, t } = useI18n();
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
    const label = menuLabel(item.id, item.label, t);
    if (item.href.startsWith("http")) {
      return (
        <a
          className={className}
          href={item.href}
          target={openTarget(item.target)}
          rel="noreferrer"
          onClick={onClick}
        >
          {label}
        </a>
      );
    }
    return (
      <Link className={className} to={item.href} onClick={onClick}>
        {label}
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
            aria-label={t("nav.menu.open")}
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
        aria-label={t("nav.menu.close")}
      />
    </>
  );
};

const menuLabel = (id: string, fallback: string, t: (key: string) => string): string => {
  switch (id) {
    case "be21e5fa":
      return t("nav.company");
    case "54ddbaf0":
      return t("nav.company.ceo");
    case "a8efd0b7":
      return t("nav.company.vision");
    case "f4984283":
      return t("nav.company.location");
    case "cd917f17":
      return t("nav.partner");
    case "sub2_1":
      return t("nav.partner.core");
    case "db4958d7":
      return t("nav.product");
    case "02708bea":
      return t("nav.inquiry");
    case "inquiry":
      return t("nav.inquiry.quote");
    case "testdemo":
      return t("nav.inquiry.testDemo");
    case "menual":
      return t("nav.inquiry.library");
    case "ff6078f4":
    case "b13e0b14":
      return t("nav.notice");
    case "6b5eebd7":
      return t("nav.product.laser");
    case "aa49a34a":
      return t("nav.product.laser.nanosecond");
    case "d9a8c320":
      return t("nav.product.laser.picosecond");
    case "b8f82ab3":
      return t("nav.product.laser.co2");
    case "336850dd":
      return t("nav.product.laser.excimer");
    case "5ea7cbd3":
      return t("nav.product.laser.diode");
    case "1f638fd0":
      return t("nav.product.optics");
    case "b451fed3":
      return t("nav.product.optics.monocle");
    case "23452345":
      return t("nav.product.optics.ulo");
    case "pro6_3":
      return t("nav.product.optics.green");
    case "pro6_4":
      return t("nav.product.optics.jenoptik");
    case "1f969dbb":
      return t("nav.product.scanner");
    case "176a9c95":
      return t("nav.product.scanner.scanlab");
    case "e158d94e":
      return t("nav.product.custom");
    case "28acbd82":
      return t("nav.product.custom.meopta");
    case "13300bde":
      return t("nav.product.custom.femtoprint");
    case "965c17c3":
      return t("nav.product.measurement");
    case "ee3098e3":
      return t("nav.product.measurement.point");
    case "1b1dd59a":
      return t("nav.product.measurement.metrolux");
    case "pro4_3":
      return t("nav.product.measurement.shinhotek");
    case "pro8_1":
    case "36bdb97f":
      return t("nav.product.others");
    case "6d145a0f":
      return t("nav.product.beam");
    case "bf7f57c7":
      return t("nav.product.beam.adloptica");
    case "6bea92d7":
      return t("nav.product.beam.power");
    case "pro5_1":
      return t("nav.product.beam.silios");
    default:
      return fallback;
  }
};
