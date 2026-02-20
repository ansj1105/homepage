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
  const singleMenuTitle = tabs ? resolvedSectionTitle : t("nav.company");

  return (
    <section className="company-shell" id="aside_nav">
      <div className={`${resolvedHeroClassName} sub_bg t_center`} role="img" aria-label={resolvedHeroAria}>
        <div className="company-shell-hero-inner wrap sub_bg_txt">
          <strong>{resolvedSectionTitle}</strong>
          <span>{resolvedSectionSlogan}</span>
        </div>
      </div>

      <div className="company-shell-body wrap">
        <div className="sub_nav">
          <aside className="company-shell-aside" aria-label={resolvedAsideAria}>
            <div className="aside_nav">
              <p className="aside_title bold">{resolvedSectionTitle}</p>
              <p className="aside_subtitle f_open">{resolvedAsideSubtitle}</p>
            </div>

            <div className="sub_navi">
              <ul className="dep1">
                <li className="on">
                  <span className="dep1_label">{singleMenuTitle}</span>
                  <div>
                    <ul className="dep2">
                      {companyTabs.map((tab) => (
                        <li key={tab.to}>
                          <NavLink to={tab.to} className={({ isActive }) => (isActive ? "on" : "")}>
                            <span>{tab.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          <article className="company-shell-content sub_cont">
            <div className="sub_name clr">
              <div className="sub_title t_center">
                <p>{title}</p>
              </div>
            </div>
            {children}
          </article>
        </div>
      </div>
    </section>
  );
};
