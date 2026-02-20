import { type FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { apiClient } from "../../api/client";
import {
  getCategoryBySlug,
  getItemBySlug,
  getLabel,
  productTaxonomy
} from "../../data/productTaxonomy";
import type { InquiryCreateRequest, InquiryItem, ResourceItem } from "../../types";
import { usePublicOutlet } from "./context";
import { findRelatedProducts, resourceTypeLabel } from "./helpers";
import { SectionHeading } from "./SectionHeading";
import { CompanySectionShell } from "./CompanySectionShell";

export const CompanyCeoPage = () => {
  const { t } = usePublicOutlet();

  return (
    <CompanySectionShell title={t("company.ceo.pageTitle")}>
      <div className="company-ceo-visual">
        <img src="/assets/legacy/images/sub1_1_img02.png" alt={t("company.ceo.visualAlt")} />
      </div>

      <dl className="company-ceo-copy">
        <dt>{t("company.ceo.headline")}</dt>
        <dd>{t("company.ceo.description")}</dd>
      </dl>

      <div className="company-ceo-sign">
        <img src="/assets/legacy/images/sub1_1_img03.png" alt={t("company.ceo.signatureAlt")} />
      </div>
    </CompanySectionShell>
  );
};

export const CompanyVisionPage = () => {
  const { t } = usePublicOutlet();

  return (
    <CompanySectionShell title={t("company.title.vision")}>
      <section className="company-vision">
        <div className="company-vision-section-title">
          <p>{t("company.vision.section.vision")}</p>
        </div>

        <div className="company-vision-intro">
          <p>
            {t("company.vision.intro.prefix")}
            <span className="is-blue">{t("company.vision.intro.blue")}</span>
            <br />
            {t("company.vision.intro.middle")}
            <span className="is-green">{t("company.vision.intro.green")}</span>
            <br />
            {t("company.vision.intro.suffixPrefix")}
            <span className="is-quote">{t("company.vision.intro.quote")}</span>
            {t("company.vision.intro.suffix")}
          </p>
        </div>

        <div className="company-vision-section-title">
          <p>{t("company.vision.section.vision2030")}</p>
        </div>
        <div className="company-vision-image-wrap">
          <img
            src="/assets/legacy/images/sub1_2_img02_m.jpg"
            alt={t("company.vision.vision2030AltMobile")}
            className="mobile_img"
          />
          <img
            src="/assets/legacy/images/sub1_2_img02.png"
            alt={t("company.vision.vision2030AltDesktop")}
            className="pc_img"
          />
        </div>

        <div className="company-vision-section-title">
          <p>{t("company.vision.section.fourw")}</p>
        </div>
        <div className="company-vision-image-wrap">
          <img
            src="/assets/legacy/images/sub1_2_img03_m.jpg"
            alt={t("company.vision.fourWAltMobile")}
            className="mobile_img"
          />
          <img
            src="/assets/legacy/images/sub1_2_img03.png"
            alt={t("company.vision.fourWAltDesktop")}
            className="pc_img"
          />
        </div>
      </section>
    </CompanySectionShell>
  );
};

export const CompanyLocationPage = () => {
  const { t } = usePublicOutlet();

  return (
    <CompanySectionShell title={t("company.title.location")}>
      <div className="sub1_3">
        <div className="map">
          <iframe
            title={t("company.location.mapTitle")}
            src="https://maps.google.com/maps?q=19%20Gasan%20digital%201-ro%2C%20Geumcheon-gu%2C%20Seoul&t=&z=16&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
            className="location-map"
          />
        </div>
        <div className="map_info">
          <dl>
            <dt className="medium">Add.</dt>
            <dd>{t("company.location.addValue")}</dd>
          </dl>
          <dl>
            <dt className="medium">Tel.</dt>
            <dd>{t("company.location.telValue")}</dd>
          </dl>
          <dl>
            <dt className="medium">Fax.</dt>
            <dd>{t("company.location.faxValue")}</dd>
          </dl>
        </div>
      </div>
    </CompanySectionShell>
  );
};

export const PartnerCorePage = () => {
  const { t } = usePublicOutlet();

  return (
    <CompanySectionShell
      title={t("partner.title")}
      sectionTitle={t("section.partner")}
      sectionSlogan={t("company.shell.slogan")}
      asideSubtitle={t("partner.shell.subtitle")}
      heroAriaLabel={t("partner.shell.heroAria")}
      asideAriaLabel={t("partner.shell.asideAria")}
      heroClassName="company-shell-hero partner-shell-hero"
      tabs={[{ label: t("nav.partner.core"), to: "/partner/core" }]}
    >
      <div className="partner-core-content">
        <div className="sub2_1" />
        <img src="/assets/legacy/images/seul-ra-i-deu11573621207.jpg" alt={t("partner.core.imageAlt")} />
      </div>
    </CompanySectionShell>
  );
};

export const ProductCategoryListPage = () => {
  const { locale, t } = usePublicOutlet();

  return (
    <section className="page-section">
      <SectionHeading title={t("product.title")} subtitle={t("section.product")} />
      <h2 className="subheading">{t("product.categoryList")}</h2>
      <div className="category-grid">
        {productTaxonomy.map((category) => (
          <Link key={category.slug} to={`/product/${category.slug}`} className="category-card">
            <h3>{getLabel(category.label, locale)}</h3>
            <p>{t("product.itemsCount", { count: category.items.length })}</p>
            <ul>
              {category.items.slice(0, 3).map((item) => (
                <li key={item.slug}>{getLabel(item.label, locale)}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </section>
  );
};

export const ProductCategoryPage = () => {
  const { content, locale, t } = usePublicOutlet();
  const { categorySlug } = useParams();
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return (
      <section className="page-section">
        <SectionHeading title={t("product.title")} subtitle={t("section.product")} />
        <article className="content-card">
          <p>{t("product.unknownCategory")}</p>
          <Link className="text-link" to="/product">
            {t("site.backHome")}
          </Link>
        </article>
      </section>
    );
  }

  const relatedProducts = findRelatedProducts(content.products, category);

  return (
    <section className="page-section">
      <SectionHeading
        title={getLabel(category.label, locale)}
        subtitle={`${t("section.product")} / ${t("product.subList")}`}
      />

      <div className="category-grid compact">
        {category.items.map((item) => (
          <Link
            key={item.slug}
            to={`/product/${category.slug}/${item.slug}`}
            className="category-card compact"
          >
            <h3>{getLabel(item.label, locale)}</h3>
          </Link>
        ))}
      </div>

      <h2 className="subheading">{t("product.related")}</h2>
      {relatedProducts.length === 0 ? (
        <p className="section-description">{t("product.empty")}</p>
      ) : (
        <div className="related-grid">
          {relatedProducts.slice(0, 8).map((product) => (
            <article key={product.id} className="related-card">
              <h3>{product.name}</h3>
              <p>{product.benefit}</p>
              <ul>
                <li>{product.category}</li>
                <li>{product.manufacturer}</li>
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export const ProductItemPage = () => {
  const { content, locale, t } = usePublicOutlet();
  const { categorySlug, itemSlug } = useParams();
  const category = getCategoryBySlug(categorySlug);
  const item = getItemBySlug(category, itemSlug);

  if (!category) {
    return (
      <section className="page-section">
        <SectionHeading title={t("product.title")} subtitle={t("section.product")} />
        <article className="content-card">
          <p>{t("product.unknownCategory")}</p>
          <Link className="text-link" to="/product">
            {t("site.backHome")}
          </Link>
        </article>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="page-section">
        <SectionHeading title={getLabel(category.label, locale)} subtitle={t("section.product")} />
        <article className="content-card">
          <p>{t("product.unknownItem")}</p>
          <Link className="text-link" to={`/product/${category.slug}`}>
            {t("product.goCategory")}
          </Link>
        </article>
      </section>
    );
  }

  const relatedProducts = findRelatedProducts(content.products, category);

  return (
    <section className="page-section">
      <SectionHeading
        title={getLabel(item.label, locale)}
        subtitle={`${getLabel(category.label, locale)} / ${t("product.detailTitle")}`}
      />

      <article className="content-card">
        <dl className="info-grid">
          <div>
            <dt>{t("section.product")}</dt>
            <dd>{getLabel(category.label, locale)}</dd>
          </div>
          <div>
            <dt>{t("product.subList")}</dt>
            <dd>{getLabel(item.label, locale)}</dd>
          </div>
        </dl>

        <Link className="primary-link" to="/inquiry/quote">
          {t("product.toQuote")}
        </Link>
      </article>

      <h2 className="subheading">{t("product.related")}</h2>
      {relatedProducts.length === 0 ? (
        <p className="section-description">{t("product.empty")}</p>
      ) : (
        <div className="related-grid">
          {relatedProducts.slice(0, 6).map((product) => (
            <article key={product.id} className="related-card">
              <h3>{product.name}</h3>
              <p>{product.benefit}</p>
              <ul>
                <li>{product.manufacturer}</li>
                <li>
                  {product.wavelengthNm} nm / {product.powerW} W
                </li>
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export const QuoteInquiryPage = () => {
  const { t } = usePublicOutlet();
  const [submittedMessage, setSubmittedMessage] = useState("");

  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const hp1 = String(formData.get("s_v2_hp1") ?? "");
    const hp2 = String(formData.get("s_v2_hp2") ?? "");
    const hp3 = String(formData.get("s_v2_hp3") ?? "");
    const phone = [hp1, hp2, hp3].filter(Boolean).join("-");

    const payload: InquiryCreateRequest = {
      company: t("inquiry.form.companyFallback"),
      position: "",
      name: String(formData.get("s_v1") ?? ""),
      email: String(formData.get("s_v3") ?? ""),
      contactNumber: phone,
      requirements: String(formData.get("s_t1") ?? ""),
      consent: true
    };

    try {
      await apiClient.submitInquiry(payload);
      setSubmittedMessage(t("inquiry.form.ok"));
      event.currentTarget.reset();
    } catch {
      setSubmittedMessage(t("inquiry.form.fail"));
    }
  };

  return (
    <CompanySectionShell
      title={t("inquiry.quote.title")}
      sectionTitle={t("section.inquiry")}
      sectionSlogan={t("company.shell.slogan")}
      asideSubtitle={t("inquiry.shell.subtitle")}
      heroAriaLabel={t("inquiry.shell.heroAria")}
      asideAriaLabel={t("inquiry.shell.asideAria")}
      heroClassName="company-shell-hero inquiry-shell-hero"
      tabs={[
        { label: t("nav.inquiry.quote"), to: "/inquiry/quote" },
        { label: t("nav.inquiry.testDemo"), to: "/inquiry/test-demo" },
        { label: t("nav.inquiry.library"), to: "/inquiry/library" }
      ]}
    >
      <p className="section-description">{t("inquiry.quote.description")}</p>

      <form className="inquiry inquiry-form-legacy inquiry-form-quote" onSubmit={submitInquiry}>
        <table cellPadding={0} cellSpacing={0}>
          <colgroup>
            <col width="13%" />
            <col width="87%" />
          </colgroup>
          <tbody>
            <tr>
              <th className="t_left">{t("inquiry.form.name")}</th>
              <td>
                <input type="text" name="s_v1" id="s_v1" style={{ width: "100%" }} required />
              </td>
            </tr>
            <tr>
              <th className="t_left">{t("inquiry.form.contact")}</th>
              <td>
                <select name="s_v2_hp1" style={{ width: 55 }} defaultValue="010" title="휴대전화 첫번째">
                  <option value="">선택</option>
                  <option value="010">010</option>
                  <option value="011">011</option>
                  <option value="016">016</option>
                  <option value="017">017</option>
                  <option value="018">018</option>
                  <option value="019">019</option>
                </select>{" "}
                - <input type="text" name="s_v2_hp2" size={4} maxLength={4} required /> -{" "}
                <input type="text" name="s_v2_hp3" size={4} maxLength={4} required />
              </td>
            </tr>
            <tr>
              <th className="t_left">{t("inquiry.form.email")}</th>
              <td>
                <input type="email" name="s_v3" id="s_v3" required />
              </td>
            </tr>
            <tr>
              <th className="t_left">{t("inquiry.form.requirements")}</th>
              <td>
                <textarea name="s_t1" id="s_t1" style={{ width: "100%", height: 115 }} />
              </td>
            </tr>
            <tr>
              <th className="t_left">{t("inquiry.form.file")}</th>
              <td>
                <input type="file" id="s_v4" name="s_v4" style={{ maxWidth: 200 }} />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="inquiry_btn t_center">
          <button type="submit">{t("inquiry.form.submitLegacy")}</button>
        </div>
      </form>

      {submittedMessage ? <p className="status-banner success">{submittedMessage}</p> : null}
    </CompanySectionShell>
  );
};

export const TestDemoPage = () => {
  const { t } = usePublicOutlet();
  const [submittedMessage, setSubmittedMessage] = useState("");

  const submitTestDemo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const productName = String(formData.get("s_v4") ?? "");
    const body = String(formData.get("s_t1") ?? "");
    const payload: InquiryCreateRequest = {
      company: t("inquiry.form.companyFallback"),
      position: "",
      name: String(formData.get("s_v1") ?? ""),
      email: String(formData.get("s_v3") ?? ""),
      contactNumber: String(formData.get("s_v2") ?? ""),
      requirements: productName ? `[${t("inquiry.form.productName")}] ${productName}\n${body}` : body,
      consent: true
    };

    try {
      await apiClient.submitInquiry(payload);
      setSubmittedMessage(t("inquiry.form.ok"));
      event.currentTarget.reset();
    } catch {
      setSubmittedMessage(t("inquiry.form.fail"));
    }
  };

  return (
    <CompanySectionShell
      title={t("inquiry.testDemo.title")}
      sectionTitle={t("section.inquiry")}
      sectionSlogan={t("company.shell.slogan")}
      asideSubtitle={t("inquiry.shell.subtitle")}
      heroAriaLabel={t("inquiry.shell.heroAria")}
      asideAriaLabel={t("inquiry.shell.asideAria")}
      heroClassName="company-shell-hero inquiry-shell-hero"
      tabs={[
        { label: t("nav.inquiry.quote"), to: "/inquiry/quote" },
        { label: t("nav.inquiry.testDemo"), to: "/inquiry/test-demo" },
        { label: t("nav.inquiry.library"), to: "/inquiry/library" }
      ]}
    >
      <p className="section-description">{t("inquiry.testDemo.description")}</p>

      <form className="inquiry inquiry-form-legacy inquiry-form-quote" onSubmit={submitTestDemo}>
        <table cellPadding={0} cellSpacing={0}>
          <colgroup>
            <col width="13%" />
            <col width="87%" />
          </colgroup>
          <tbody>
            <tr>
              <th className="t_left">{t("inquiry.form.productName")}</th>
              <td>
                <input type="text" name="s_v4" id="s_v4" style={{ width: "100%" }} required />
              </td>
            </tr>
            <tr>
              <th className="t_left">{t("inquiry.form.applicant")}</th>
              <td>
                <input type="text" name="s_v1" id="s_v1" style={{ width: "100%" }} required />
              </td>
            </tr>
            <tr>
              <th className="t_left">{t("inquiry.form.contact")}</th>
              <td>
                <input type="text" name="s_v2" id="s_v2" style={{ width: "100%" }} required />
              </td>
            </tr>
            <tr>
              <th className="t_left">{t("inquiry.form.email")}</th>
              <td>
                <input type="email" name="s_v3" id="s_v3" style={{ width: "100%" }} required />
              </td>
            </tr>
            <tr>
              <th className="t_left">{t("inquiry.form.requirements")}</th>
              <td>
                <textarea name="s_t1" id="s_t1" style={{ width: "100%", height: 115 }} />
              </td>
            </tr>
            <tr>
              <th className="t_left">{t("inquiry.form.file")}</th>
              <td>
                <input type="file" id="s_v5" name="s_v5" style={{ maxWidth: 200 }} />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="inquiry_btn t_center">
          <button type="submit">{t("inquiry.form.submitLegacy")}</button>
        </div>
      </form>

      {submittedMessage ? <p className="status-banner success">{submittedMessage}</p> : null}
    </CompanySectionShell>
  );
};

export const InquiryLibraryPage = () => {
  const { resources, locale, t } = usePublicOutlet();
  const [keyfield, setKeyfield] = useState<"title" | "file">("title");
  const [keyword, setKeyword] = useState("");

  const filteredResources = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return resources;
    return resources.filter((resource) => {
      if (keyfield === "file") {
        return resourceTypeLabel(resource.type, locale).toLowerCase().includes(query);
      }
      return resource.title.toLowerCase().includes(query);
    });
  }, [resources, keyword, keyfield, locale]);

  return (
    <CompanySectionShell
      title={t("inquiry.library.title")}
      sectionTitle={t("section.inquiry")}
      sectionSlogan={t("company.shell.slogan")}
      asideSubtitle={t("inquiry.shell.subtitle")}
      heroAriaLabel={t("inquiry.shell.heroAria")}
      asideAriaLabel={t("inquiry.shell.asideAria")}
      heroClassName="company-shell-hero inquiry-shell-hero"
      tabs={[
        { label: t("nav.inquiry.quote"), to: "/inquiry/quote" },
        { label: t("nav.inquiry.testDemo"), to: "/inquiry/test-demo" },
        { label: t("nav.inquiry.library"), to: "/inquiry/library" }
      ]}
    >
      <div className="list_board">
        <p className="total">
          {t("inquiry.library.totalPrefix")}
          <span>{filteredResources.length}</span>
          {t("inquiry.library.totalSuffix")}
        </p>
        <div className="search_wrap">
          <form style={{ margin: 0 }} onSubmit={(event) => event.preventDefault()}>
            <select
              value={keyfield}
              onChange={(event) => setKeyfield(event.target.value as "title" | "file")}
              aria-label={t("inquiry.library.search.keyfield")}
            >
              <option value="title">{t("inquiry.library.search.title")}</option>
              <option value="file">{t("inquiry.library.search.file")}</option>
            </select>
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              aria-label={t("inquiry.library.search.placeholder")}
            />
            <input type="submit" className="search_btn" value={t("inquiry.library.search.submit")} />
          </form>
        </div>

        <table cellPadding={0} cellSpacing={0} border={0} className="list_board_table">
          <colgroup>
            <col width="80" className="pc_display" />
            <col width="*" />
            <col width="80" className="pc_display" />
            <col width="120" className="pc_display" />
            <col width="100" className="pc_display" />
          </colgroup>
          <thead className="pc_display">
            <tr>
              <th scope="col">{t("inquiry.library.table.no")}</th>
              <th scope="col">{t("inquiry.library.table.title")}</th>
              <th scope="col">{t("inquiry.library.table.file")}</th>
              <th scope="col">{t("inquiry.library.table.date")}</th>
              <th scope="col">{t("inquiry.library.table.views")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.length === 0 ? (
              <tr>
                <td colSpan={5} className="farm-A-empty t_center">
                  {t("inquiry.library.empty")}
                </td>
              </tr>
            ) : (
              filteredResources.map((resource: ResourceItem, index) => (
                <tr key={resource.id}>
                  <td className="pc_display">{filteredResources.length - index}</td>
                  <td>
                    <Link to={`/inquiry/library/${resource.id}`}>{resource.title}</Link>
                  </td>
                  <td className="pc_display">{resourceTypeLabel(resource.type, locale)}</td>
                  <td className="pc_display">-</td>
                  <td className="pc_display">-</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="paginate t_center">
          <div className="ui-pagenate" />
        </div>
      </div>
    </CompanySectionShell>
  );
};

export const InquiryLibraryDetailPage = () => {
  const { resources, locale, t } = usePublicOutlet();
  const { resourceId } = useParams();
  const resource = resources.find((item) => item.id === resourceId);

  if (!resource) {
    return (
      <CompanySectionShell
        title={t("inquiry.library.title")}
        sectionTitle={t("section.inquiry")}
        sectionSlogan={t("company.shell.slogan")}
        asideSubtitle={t("inquiry.shell.subtitle")}
        heroAriaLabel={t("inquiry.shell.heroAria")}
        asideAriaLabel={t("inquiry.shell.asideAria")}
        heroClassName="company-shell-hero inquiry-shell-hero"
        tabs={[
          { label: t("nav.inquiry.quote"), to: "/inquiry/quote" },
          { label: t("nav.inquiry.testDemo"), to: "/inquiry/test-demo" },
          { label: t("nav.inquiry.library"), to: "/inquiry/library" }
        ]}
      >
        <p className="section-description">{t("inquiry.library.detail.notFound")}</p>
        <Link className="text-link" to="/inquiry/library">
          {t("inquiry.library.detail.backToList")}
        </Link>
      </CompanySectionShell>
    );
  }

  return (
    <CompanySectionShell
      title={t("inquiry.library.title")}
      sectionTitle={t("section.inquiry")}
      sectionSlogan={t("company.shell.slogan")}
      asideSubtitle={t("inquiry.shell.subtitle")}
      heroAriaLabel={t("inquiry.shell.heroAria")}
      asideAriaLabel={t("inquiry.shell.asideAria")}
      heroClassName="company-shell-hero inquiry-shell-hero"
      tabs={[
        { label: t("nav.inquiry.quote"), to: "/inquiry/quote" },
        { label: t("nav.inquiry.testDemo"), to: "/inquiry/test-demo" },
        { label: t("nav.inquiry.library"), to: "/inquiry/library" }
      ]}
    >
      <article className="library-detail">
        <header>
          <p className="library-detail-type">{resourceTypeLabel(resource.type, locale)}</p>
          <h2>{resource.title}</h2>
        </header>
        <p>{t("inquiry.library.detail.description")}</p>
        <div className="library-detail-actions">
          <Link className="primary-link" to="/inquiry/library">
            {t("inquiry.library.detail.backToList")}
          </Link>
        </div>
      </article>
    </CompanySectionShell>
  );
};

export const NoticePage = () => {
  const { notices, locale, t } = usePublicOutlet();
  const [keyfield, setKeyfield] = useState<"title" | "file">("title");
  const [keyword, setKeyword] = useState("");

  const sortedNotices = useMemo(
    () =>
      [...notices].sort((a, b) => {
        if (a.publishedAt > b.publishedAt) return -1;
        if (a.publishedAt < b.publishedAt) return 1;
        return 0;
      }),
    [notices]
  );

  const filteredNotices = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return sortedNotices;
    if (keyfield === "file") {
      return [];
    }
    return sortedNotices.filter((notice) => notice.title.toLowerCase().includes(query));
  }, [sortedNotices, keyword, keyfield]);

  return (
    <CompanySectionShell
      title={t("notice.contentTitle")}
      sectionTitle={t("section.notice")}
      sectionSlogan={t("company.shell.slogan")}
      asideSubtitle={t("notice.shell.subtitle")}
      heroAriaLabel={t("notice.shell.heroAria")}
      asideAriaLabel={t("notice.shell.asideAria")}
      heroClassName="company-shell-hero notice-shell-hero"
      tabs={[{ label: t("notice.title"), to: "/notice" }]}
    >
      <div className="library-toolbar">
        <p className="library-total">
          {t("notice.totalPrefix")}
          <span>{filteredNotices.length}</span>
          {t("notice.totalSuffix")}
        </p>
        <form className="library-search" role="search" onSubmit={(event) => event.preventDefault()}>
          <select
            value={keyfield}
            onChange={(event) => setKeyfield(event.target.value as "title" | "file")}
            aria-label={t("notice.search.keyfield")}
          >
            <option value="title">{t("notice.search.title")}</option>
            <option value="file">{t("notice.search.file")}</option>
          </select>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t("notice.search.placeholder")}
            aria-label={t("notice.search.placeholder")}
          />
          <button type="submit">{t("notice.search.submit")}</button>
        </form>
      </div>

      <div className="library-table-wrap">
        <table className="library-table">
          <colgroup>
            <col width="90" />
            <col />
            <col width="120" />
            <col width="130" />
            <col width="90" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">{t("notice.table.no")}</th>
              <th scope="col">{t("notice.table.title")}</th>
              <th scope="col">{t("notice.table.file")}</th>
              <th scope="col">{t("notice.table.date")}</th>
              <th scope="col">{t("notice.table.views")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotices.length === 0 ? (
              <tr>
                <td colSpan={5} className="is-empty">
                  {t("notice.empty")}
                </td>
              </tr>
            ) : (
              filteredNotices.map((notice, index) => (
                <tr key={notice.id}>
                  <td>{filteredNotices.length - index}</td>
                  <td className="is-title">
                    <Link to={`/notice/${notice.id}`}>{notice.title}</Link>
                  </td>
                  <td>-</td>
                  <td>{new Date(notice.publishedAt).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}</td>
                  <td>-</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </CompanySectionShell>
  );
};

export const NoticeDetailPage = () => {
  const { notices, locale, t } = usePublicOutlet();
  const { noticeId } = useParams();
  const notice = notices.find((item) => item.id === noticeId);

  if (!notice) {
    return (
      <CompanySectionShell
        title={t("notice.contentTitle")}
        sectionTitle={t("section.notice")}
        sectionSlogan={t("company.shell.slogan")}
        asideSubtitle={t("notice.shell.subtitle")}
        heroAriaLabel={t("notice.shell.heroAria")}
        asideAriaLabel={t("notice.shell.asideAria")}
        heroClassName="company-shell-hero notice-shell-hero"
        tabs={[{ label: t("notice.title"), to: "/notice" }]}
      >
        <p className="section-description">{t("notice.detail.notFound")}</p>
        <Link className="text-link" to="/notice">
          {t("notice.detail.backToList")}
        </Link>
      </CompanySectionShell>
    );
  }

  return (
    <CompanySectionShell
      title={t("notice.contentTitle")}
      sectionTitle={t("section.notice")}
      sectionSlogan={t("company.shell.slogan")}
      asideSubtitle={t("notice.shell.subtitle")}
      heroAriaLabel={t("notice.shell.heroAria")}
      asideAriaLabel={t("notice.shell.asideAria")}
      heroClassName="company-shell-hero notice-shell-hero"
      tabs={[{ label: t("notice.title"), to: "/notice" }]}
    >
      <article className="library-detail">
        <header>
          <p className="library-detail-type">{t("notice.title")}</p>
          <h2>{notice.title}</h2>
        </header>
        <p>
          {t("notice.date")}:{" "}
          {new Date(notice.publishedAt).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}
        </p>
        <div className="library-detail-actions">
          <Link className="primary-link" to="/notice">
            {t("notice.detail.backToList")}
          </Link>
        </div>
      </article>
    </CompanySectionShell>
  );
};

export const NotFoundPage = () => {
  const { t } = usePublicOutlet();

  return (
    <section className="page-section">
      <SectionHeading title="404" subtitle="Not Found" />
      <article className="content-card">
        <p>{t("site.backHome")}</p>
        <Link className="text-link" to="/company/ceo">
          {t("site.backHome")}
        </Link>
      </article>
    </section>
  );
};

export const DefaultRedirect = () => <Navigate to="/company/ceo" replace />;
