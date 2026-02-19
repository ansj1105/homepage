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

export const CompanyCeoPage = () => {
  const { content, t } = usePublicOutlet();

  return (
    <section className="page-section">
      <SectionHeading title={t("company.title.ceo")} subtitle={t("section.company")} />
      <article className="content-card">
        <p>{content.ceoMessage || t("company.ceo.default")}</p>
      </article>
    </section>
  );
};

export const CompanyVisionPage = () => {
  const { content, t } = usePublicOutlet();
  const items = content.visionItems.length > 0 ? content.visionItems : [t("company.vision.default")];

  return (
    <section className="page-section">
      <SectionHeading title={t("company.title.vision")} subtitle={t("section.company")} />
      <article className="content-card">
        <ul className="bullet-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
};

export const CompanyLocationPage = () => {
  const { content, t } = usePublicOutlet();

  return (
    <section className="page-section">
      <SectionHeading title={t("company.title.location")} subtitle={t("section.company")} />
      <article className="content-card">
        <p>{t("company.locationGuide")}</p>
        <iframe
          title="SHINHOTEK Headquarter Map"
          src="https://maps.google.com/maps?q=19%20Gasan%20digital%201-ro%2C%20Geumcheon-gu%2C%20Seoul&t=&z=14&ie=UTF8&iwloc=&output=embed"
          loading="lazy"
          className="location-map"
        />
        <dl className="info-grid">
          <div>
            <dt>{t("company.address")}</dt>
            <dd>{content.contact.headquarter}</dd>
          </div>
          <div>
            <dt>{t("company.contact")}</dt>
            <dd>
              Tel. {content.contact.tel}
              <br />
              Fax. {content.contact.fax}
              <br />
              {content.contact.email}
            </dd>
          </div>
        </dl>
      </article>
    </section>
  );
};

export const PartnerCorePage = () => {
  const { content, t } = usePublicOutlet();

  return (
    <section className="page-section">
      <SectionHeading title={t("partner.title")} subtitle={t("section.partner")} />
      <p className="section-description">{t("partner.description")}</p>
      <div className="partner-grid">
        {content.partners.map((partner) => (
          <a key={partner.id} href={partner.url} target="_blank" rel="noreferrer">
            <strong>{partner.name}</strong>
            <span>{partner.category}</span>
          </a>
        ))}
      </div>
    </section>
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
    const payload: InquiryCreateRequest = {
      company: String(formData.get("company") ?? ""),
      position: String(formData.get("position") ?? ""),
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      contactNumber: String(formData.get("contactNumber") ?? ""),
      requirements: String(formData.get("requirements") ?? ""),
      consent: formData.get("consent") === "on"
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
    <section className="page-section">
      <SectionHeading title={t("inquiry.quote.title")} subtitle={t("section.inquiry")} />
      <p className="section-description">{t("inquiry.quote.description")}</p>

      <form className="inquiry-form" onSubmit={submitInquiry}>
        <label htmlFor="company">
          {t("inquiry.form.company")} *
          <input id="company" name="company" required />
        </label>
        <label htmlFor="position">
          {t("inquiry.form.position")}
          <input id="position" name="position" />
        </label>
        <label htmlFor="name">
          {t("inquiry.form.name")} *
          <input id="name" name="name" required />
        </label>
        <label htmlFor="email">
          {t("inquiry.form.email")} *
          <input id="email" name="email" type="email" required />
        </label>
        <label htmlFor="contact-number">
          {t("inquiry.form.contact")}
          <input id="contact-number" name="contactNumber" />
        </label>
        <label htmlFor="requirements">
          {t("inquiry.form.requirements")}
          <textarea id="requirements" name="requirements" rows={5} />
        </label>
        <label className="consent-row">
          <input type="checkbox" name="consent" required />
          {t("inquiry.form.consent")}
        </label>
        <button className="primary-link" type="submit">
          {t("inquiry.form.submit")}
        </button>
      </form>

      {submittedMessage ? <p className="status-banner success">{submittedMessage}</p> : null}
    </section>
  );
};

export const TestDemoPage = () => {
  const { t } = usePublicOutlet();

  return (
    <section className="page-section">
      <SectionHeading title={t("inquiry.testDemo.title")} subtitle={t("section.inquiry")} />
      <article className="content-card">
        <p>{t("inquiry.testDemo.description")}</p>
        <Link className="primary-link" to="/inquiry/quote">
          {t("inquiry.testDemo.cta")}
        </Link>
      </article>
    </section>
  );
};

export const InquiryLibraryPage = () => {
  const { resources, locale, t } = usePublicOutlet();

  return (
    <section className="page-section">
      <SectionHeading title={t("inquiry.library.title")} subtitle={t("section.inquiry")} />
      {resources.length === 0 ? (
        <p className="section-description">{t("inquiry.library.empty")}</p>
      ) : (
        <ul className="resource-list">
          {resources.map((resource: ResourceItem) => (
            <li key={resource.id}>
              <span>{resourceTypeLabel(resource.type, locale)}</span>
              <strong>{resource.title}</strong>
              <a href="#">{t("inquiry.library.download")}</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export const NoticePage = () => {
  const { notices, locale, t } = usePublicOutlet();

  const sortedNotices = useMemo(
    () =>
      [...notices].sort((a, b) => {
        if (a.publishedAt > b.publishedAt) return -1;
        if (a.publishedAt < b.publishedAt) return 1;
        return 0;
      }),
    [notices]
  );

  return (
    <section className="page-section">
      <SectionHeading title={t("notice.title")} subtitle={t("section.notice")} />
      {sortedNotices.length === 0 ? (
        <p className="section-description">{t("notice.empty")}</p>
      ) : (
        <ul className="notice-list">
          {sortedNotices.map((notice) => (
            <li key={notice.id}>
              <strong>{notice.title}</strong>
              <time dateTime={notice.publishedAt}>
                {t("notice.date")}: {new Date(notice.publishedAt).toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
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
