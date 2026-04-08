import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../api/client";
import CommunityTopBar from "../../components/CommunityTopBar";
import { defaultMainPageContent } from "../../data/mainPageDefaults";
import { PublicHeader } from "../../pages/public/PublicHeader";
import { MarkdownBlock } from "../../pages/public/MarkdownBlock";
import type { MainPageContent, PowerRankingPerson } from "../../types";
import "./legacy-main.css";

const getInitials = (name: string): string => name.slice(0, 2) || "DY";

const getPodiumLabel = (rank: number): string => {
  if (rank === 1) return "Champion";
  if (rank === 2) return "Runner Up";
  return "Top 3";
};

const MainHonorCard = ({ person, rank }: { person: PowerRankingPerson; rank: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = (x - centerX) / 20;
      const rotateX = (centerY - y) / 20;
      container.style.transform = `perspective(960px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      container.style.transform = "";
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <article ref={containerRef} className={`legacy-main-honor-card rank-${rank}`}>
      <div className="legacy-main-honor-head">
        <span className="legacy-main-honor-rank">#{rank}</span>
        <span className="legacy-main-honor-label">{getPodiumLabel(rank)}</span>
      </div>
      <div className="legacy-main-honor-avatar">
        {person.profileImageUrl ? (
          <img src={person.profileImageUrl} alt={`${person.name} 프로필`} />
        ) : (
          <div className="legacy-main-honor-fallback">{getInitials(person.name)}</div>
        )}
      </div>
      <strong>{person.name}</strong>
      <p>현재 점수 {person.score}</p>
    </article>
  );
};

const LegacyMainPage = () => {
  const [mainPage, setMainPage] = useState<MainPageContent>(defaultMainPageContent);
  const [topRankingPeople, setTopRankingPeople] = useState<PowerRankingPerson[]>([]);
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
    apiClient
      .getPowerRanking("all")
      .then((items) => setTopRankingPeople(items.slice(0, 3)))
      .catch(() => {
        setTopRankingPeople([]);
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
      <div className="legacy-main-community-shell">
        <CommunityTopBar />
      </div>
      <PublicHeader />

      <main className="legacy-main-content">
        <section
          className="legacy-main-hero"
          style={{ backgroundImage: `linear-gradient(135deg, rgba(6, 8, 12, 0.66), rgba(6, 8, 12, 0.36)), url(/assets/main/office-lounge-wallpaper.svg)` }}
          aria-label="메인 비주얼"
        >
          <div className="legacy-main-hero-dim" />
          <div className="legacy-main-hero-copy">
            <p className="hero-copy-top">{settings.heroCopyTop}</p>
            <p className="hero-copy-mid">{settings.heroCopyMid}</p>
            <p className="hero-copy-bottom">{settings.heroCopyBottom}</p>
            <div className="hero-copy-actions">
              <Link className="hero-copy-cta" to={settings.heroCtaHref}>
                {settings.heroCtaLabel}
              </Link>
              <Link className="hero-copy-cta secondary" to="/inquiry/quote">
                REQUEST QUOTE
              </Link>
            </div>
            <div className="legacy-main-hero-panel" aria-label="메인 요약">
              <article>
                <span>Portfolio</span>
                <strong>Curated Product Lines</strong>
              </article>
              <article>
                <span>Approach</span>
                <strong>Selection to Validation</strong>
              </article>
              <article>
                <span>Focus</span>
                <strong>Industrial Optics Execution</strong>
              </article>
            </div>
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

        <section className="legacy-main-hall">
          <div className="legacy-main-section-intro">
            <p>Hall Of Fame</p>
            <h2>명예의 전당</h2>
          </div>
          <div className="legacy-main-hall-grid">
            {topRankingPeople.map((person, index) => (
              <MainHonorCard key={person.id} person={person} rank={index + 1} />
            ))}
          </div>
        </section>

        <section className="legacy-main-about">
          <div className="legacy-main-about-bg">
            <img src={settings.aboutImageUrl} alt={settings.aboutTitle} />
          </div>
          <div className="legacy-main-about-copy">
            <div className="legacy-main-section-intro">
              <p>Company Profile</p>
              <h2>{settings.aboutTitle}</h2>
            </div>
            <div className="legacy-main-about-grid">
              <div className="legacy-main-about-body">
                <MarkdownBlock markdown={settings.aboutBody1} />
                <MarkdownBlock markdown={settings.aboutBody2} />
              </div>
              <aside className="legacy-main-about-aside">
                <span>What SHINHOTEK Does</span>
                <strong>Technical curation with practical decision support.</strong>
                <p>복잡한 제품군을 한눈에 정리하고, 적용 판단이 빠르게 이뤄지도록 구조화합니다.</p>
              </aside>
            </div>
          </div>
        </section>

        <section className="legacy-main-trust">
          <div className="legacy-main-section-intro">
            <p>Why SHINHOTEK</p>
            <h2>Built For Clear Technical Decisions</h2>
          </div>
          <div className="legacy-main-trust-grid">
            <article className="legacy-main-trust-card">
              <span>01</span>
              <strong>Structured Portfolio</strong>
              <p>제품을 단순 나열하지 않고 검토 가능한 체계로 다시 정리합니다.</p>
            </article>
            <article className="legacy-main-trust-card">
              <span>02</span>
              <strong>Engineering Context</strong>
              <p>사양과 적용 흐름을 함께 보면서 실제 의사결정에 필요한 맥락을 제공합니다.</p>
            </article>
            <article className="legacy-main-trust-card">
              <span>03</span>
              <strong>Reliable Communication</strong>
              <p>견적과 기술 문의로 자연스럽게 이어질 수 있는 B2B 구조를 유지합니다.</p>
            </article>
          </div>
        </section>

        <section className="legacy-main-solution">
          <img className="solution-fx before" src="/assets/legacy/images/section/main_part02_bg01.png" alt="" />
          <img className="solution-fx after" src="/assets/legacy/images/section/main_part02_bg02.png" alt="" />
          <div className="legacy-main-section-intro">
            <p>Solution Flow</p>
            <h2>{settings.solutionTitle}</h2>
          </div>
          <div className="legacy-main-solution-panel">
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
            <div className="legacy-main-solution-copy">
              <MarkdownBlock markdown={settings.solutionBody1} />
              <MarkdownBlock markdown={settings.solutionBody2} />
            </div>
          </div>
        </section>

        <section className="legacy-main-application">
          <div className="legacy-main-section-intro">
            <p>Application</p>
            <h2>Industry-Oriented Entry Points</h2>
          </div>
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
