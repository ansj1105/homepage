import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  legacyAddress,
  legacyAppCards,
  legacyHeroSlides,
  legacyProductMega,
  legacyTopMenu,
  type LegacyMenuItem
} from "./data";
import "./legacy-main.css";

const openTarget = (target: LegacyMenuItem["target"]): "_self" | "_blank" => target ?? "_self";

const LegacyLink = ({
  item,
  className,
  onClick
}: {
  item: LegacyMenuItem;
  className?: string;
  onClick?: () => void;
}) => {
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

const LegacyMainPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % legacyHeroSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

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

  const currentSlide = useMemo(() => legacyHeroSlides[slideIndex], [slideIndex]);

  return (
    <div className="legacy-main-root">
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
                  <LegacyLink item={menu} className="legacy-main-nav-link" />
                  {menu.children ? (
                    <ul className="legacy-main-submenu">
                      {menu.children.map((child) => (
                        <li key={child.id}>
                          <LegacyLink item={child} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
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
                <LegacyLink item={menu} className="legacy-main-mega-title" />
                <ul>
                  {menu.children?.map((child) => (
                    <li key={child.id}>
                      <LegacyLink item={child} />
                    </li>
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
              <LegacyLink
                item={menu}
                className="legacy-main-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              />
              {menu.children ? (
                <ul>
                  {menu.children.map((child) => (
                    <li key={child.id}>
                      <LegacyLink
                        item={child}
                        className="legacy-main-mobile-sub-link"
                        onClick={() => setMobileMenuOpen(false)}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </aside>

      <button
        type="button"
        className={mobileMenuOpen ? "legacy-main-overlay is-open" : "legacy-main-overlay"}
        onClick={() => setMobileMenuOpen(false)}
        aria-label="메뉴 닫기"
      />

      <main className="legacy-main-content">
        <section
          className="legacy-main-hero"
          style={{ backgroundImage: `url(${currentSlide})` }}
          aria-label="메인 비주얼"
        >
          <div className="legacy-main-hero-dim" />
          <div className="legacy-main-hero-copy">
            <p className="hero-copy-top">SHINHOTEK</p>
            <p className="hero-copy-mid">Innovation Light Changes the World</p>
            <p className="hero-copy-bottom">BEST Technology Solution</p>
            <Link className="hero-copy-cta" to="/company/ceo">
              ABOUT SHINHOTEK
            </Link>
          </div>
          <div className="legacy-main-hero-dots" role="tablist" aria-label="Main slide control">
            {legacyHeroSlides.map((slide, idx) => (
              <button
                key={slide}
                type="button"
                className={slideIndex === idx ? "dot is-active" : "dot"}
                aria-label={`슬라이드 ${idx + 1}`}
                onClick={() => setSlideIndex(idx)}
              />
            ))}
          </div>
        </section>

        <section className="legacy-main-about">
          <div className="legacy-main-about-bg">
            <img src="/assets/legacy/images/section/main_part01_img01.jpg" alt="ABOUT SHINHOTEK" />
          </div>
          <div className="legacy-main-about-copy">
            <h2>ABOUT SHINHOTEK</h2>
            <p>
              광학은 앞으로 펼쳐질 미래 사회의 핵심 기술로서, 자율주행 자동차 등 광범위한 분야에 활용이 되고 있습니다.
            </p>
            <p>
              신호텍은 고객사의 요구에 대한 광학 컨설팅을 통해 최적의 제품을 공급함으로써 국내의 레이저 산업 및 연구 분야의
              발전에 앞장서고 있습니다.
            </p>
          </div>
        </section>

        <section className="legacy-main-solution">
          <img className="solution-fx before" src="/assets/legacy/images/section/main_part02_bg01.png" alt="" />
          <img className="solution-fx after" src="/assets/legacy/images/section/main_part02_bg02.png" alt="" />
          <h2>SH SOLUTION</h2>
          <ul className="solution-icons" aria-label="solution steps">
            <li>
              <img src="/assets/legacy/images/section/main_part02_img01.png" alt="step 1" />
            </li>
            <li>
              <img src="/assets/legacy/images/section/main_part02_img02.png" alt="step 2" />
            </li>
            <li>
              <img src="/assets/legacy/images/section/main_part02_img03.png" alt="step 3" />
            </li>
          </ul>
          <p>
            SHINHOTEK은 BPS(Business Partner System)을 기반으로 하여, 기성 광학 구성품 또는 모듈과 단품을 통합한
            광학계 솔루션을 고객사에 제안합니다.
          </p>
          <p>
            가격과 미 경험에 의한 실패 확률을 줄여 최선의 효율을 추구하고, 향후 고객 application 및 사양에 맞는 맞춤화된
            광학 솔루션을 제공하겠습니다.
          </p>
        </section>

        <section className="legacy-main-application">
          <ul>
            {legacyAppCards.map((card) => (
              <li key={card.id}>
                <Link to="/product" className="application-card">
                  <span
                    className="application-card-bg"
                    style={card.imagePath ? { backgroundImage: `url(${card.imagePath})` } : undefined}
                  />
                  <span className="application-card-copy">
                    <small>SHINHOTEK</small>
                    <strong>{card.label}</strong>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="legacy-main-footer">
        <div className="legacy-main-footer-inner">
          <Link to="/main" className="legacy-main-footer-logo">
            <img src="/assets/legacy/images/logo/f_logo.png" alt="SHINHOTEK" />
          </Link>
          <p>{legacyAddress}</p>
          <small>Copyright 2017 SHINHOTEK. All Rights Reserved.</small>
          <button
            type="button"
            className="legacy-main-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            TOP
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LegacyMainPage;
