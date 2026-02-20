import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { usePublicOutlet } from "./context";

export interface SectionTabItem {
  label: string;
  to: string;
}

export const CompanySectionShell = ({
  title,
  children,
  sectionTitle,
  sectionSlogan,
  asideSubtitle,
  heroAriaLabel,
  asideAriaLabel,
  heroClassName,
  tabs
}: {
  title: string;
  children: ReactNode;
  sectionTitle?: string;
  sectionSlogan?: string;
  asideSubtitle?: string;
  heroAriaLabel?: string;
  asideAriaLabel?: string;
  heroClassName?: string;
  tabs?: SectionTabItem[];
}) => {
  const { t } = usePublicOutlet();
  const companyTabs = tabs ?? [
    { label: t("nav.company.ceo"), to: "/company/ceo" },
    { label: t("nav.company.vision"), to: "/company/vision" },
    { label: t("nav.company.location"), to: "/company/location" }
  ] as const;
  const resolvedSectionTitle = sectionTitle ?? t("section.company");
  const resolvedSectionSlogan = sectionSlogan ?? t("company.shell.slogan");
  const resolvedAsideSubtitle = asideSubtitle ?? "COMPANY INFO";
  const resolvedHeroAria = heroAriaLabel ?? t("company.shell.heroAria");
  const resolvedAsideAria = asideAriaLabel ?? t("company.shell.asideAria");
  const resolvedHeroClassName = heroClassName ?? "company-shell-hero";

  return (
    <section className="company-shell">
      <div className={resolvedHeroClassName} role="img" aria-label={resolvedHeroAria}>
        <div className="company-shell-hero-inner">
          <strong>{resolvedSectionTitle}</strong>
          <span>{resolvedSectionSlogan}</span>
        </div>
      </div>

      <div className="company-shell-body">
        <aside className="company-shell-aside" aria-label={resolvedAsideAria}>
          <div className="company-shell-aside-head">
            <p>{resolvedSectionTitle}</p>
            <small>{resolvedAsideSubtitle}</small>
          </div>
          <ul>
            {companyTabs.map((tab) => (
              <li key={tab.to}>
                <NavLink to={tab.to} className={({ isActive }) => (isActive ? "is-active" : "") }>
                  {tab.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>

        <article className="company-shell-content">
          <header>
            <h1>{title}</h1>
          </header>
          {children}
        </article>
      </div>
    </section>
  );
};
