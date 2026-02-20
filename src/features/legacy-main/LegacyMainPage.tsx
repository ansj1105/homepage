import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/client";
import { defaultMainPageContent } from "../../data/mainPageDefaults";
import { PublicHeader } from "../../pages/public/PublicHeader";
import { MarkdownBlock } from "../../pages/public/MarkdownBlock";
import type { MainPageContent } from "../../types";
import "./legacy-main.css";

const LegacyMainPage = () => {
  const [mainPage, setMainPage] = useState<MainPageContent>(defaultMainPageContent);
  const [slideIndex, setSlideIndex] = useState(0);
  const orderedSlides = useMemo(
    () => [...mainPage.slides].sort((a, b) => a.sortOrder - b.sortOrder),
    [mainPage.slides]
  );
  const orderedCards = useMemo(
    () => [...mainPage.applicationCards].sort((a, b) => a.sortOrder - b.sortOrder),
    [mainPage.applicationCards]
  );

  useEffect(() => {
    apiClient
      .getMainPage()
      .then((payload) => {
        if (payload.slides.length > 0) {
          setMainPage(payload);
        }
      })
      .catch(() => {
        // Keep fallback defaults when API is unavailable.
      });
  }, []);

  useEffect(() => {
    if (orderedSlides.length === 0) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % orderedSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [orderedSlides.length]);

  const currentSlide = useMemo(
    () => orderedSlides[slideIndex]?.imageUrl ?? defaultMainPageContent.slides[0].imageUrl,
    [orderedSlides, slideIndex]
  );
  const settings = mainPage.settings;

  return (
    <div className="legacy-main-root">
      <PublicHeader />

      <main className="legacy-main-content">
        <section
          className="legacy-main-hero"
          style={{ backgroundImage: `url(${currentSlide})` }}
          aria-label="메인 비주얼"
        >
          <div className="legacy-main-hero-dim" />
          <div className="legacy-main-hero-copy">
            <p className="hero-copy-top">{settings.heroCopyTop}</p>
            <p className="hero-copy-mid">{settings.heroCopyMid}</p>
            <p className="hero-copy-bottom">{settings.heroCopyBottom}</p>
            <Link className="hero-copy-cta" to={settings.heroCtaHref}>
              {settings.heroCtaLabel}
            </Link>
          </div>
          <div className="legacy-main-hero-dots" role="tablist" aria-label="Main slide control">
            {orderedSlides.map((slide, idx) => (
              <button
                key={slide.id}
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
            <img src={settings.aboutImageUrl} alt={settings.aboutTitle} />
          </div>
          <div className="legacy-main-about-copy">
            <h2>{settings.aboutTitle}</h2>
            <MarkdownBlock markdown={settings.aboutBody1} />
            <MarkdownBlock markdown={settings.aboutBody2} />
          </div>
        </section>

        <section className="legacy-main-solution">
          <img className="solution-fx before" src="/assets/legacy/images/section/main_part02_bg01.png" alt="" />
          <img className="solution-fx after" src="/assets/legacy/images/section/main_part02_bg02.png" alt="" />
          <h2>{settings.solutionTitle}</h2>
          <ul className="solution-icons" aria-label="solution steps">
            <li>
              <img src={settings.solutionStepImage1} alt="step 1" />
            </li>
            <li>
              <img src={settings.solutionStepImage2} alt="step 2" />
            </li>
            <li>
              <img src={settings.solutionStepImage3} alt="step 3" />
            </li>
          </ul>
          <MarkdownBlock markdown={settings.solutionBody1} />
          <MarkdownBlock markdown={settings.solutionBody2} />
        </section>

        <section className="legacy-main-application">
          <ul>
            {orderedCards.map((card) => (
              <li key={card.id}>
                <Link to={card.linkUrl} className="application-card">
                  <span
                    className="application-card-bg"
                    style={card.imageUrl ? { backgroundImage: `url(${card.imageUrl})` } : undefined}
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
          <p>{settings.footerAddress}</p>
          <small>{settings.footerCopyright}</small>
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
