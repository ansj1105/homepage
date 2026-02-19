import { type FormEvent, useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import { initialSiteContent, navItems, notices as initialNotices, resources as initialResources } from "../data/siteData";
import type { InquiryCreateRequest, NoticeItem, ResourceItem, SiteContent } from "../types";
import { filterProducts } from "../utils/filterProducts";

const scrollToSection = (targetId: string) => {
  const target = document.getElementById(targetId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const PublicSite = () => {
  const [content, setContent] = useState<SiteContent>(initialSiteContent);
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [activeSlide, setActiveSlide] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [minPower, setMinPower] = useState(0);
  const [maxWavelength, setMaxWavelength] = useState(1200);
  const [selectedProductId, setSelectedProductId] = useState(
    initialSiteContent.products[0]?.id ?? ""
  );
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % Math.max(content.heroSlides.length, 1));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [content.heroSlides.length]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [fetchedContent, fetchedResources, fetchedNotices] = await Promise.all([
          apiClient.getContent(),
          apiClient.getResources(),
          apiClient.getNotices()
        ]);
        setContent(fetchedContent);
        setResources(fetchedResources);
        setNotices(fetchedNotices);
      } catch {
        setApiError("Server data load failed. Showing local fallback data.");
      }
    };
    fetchAll().catch(() => {
      setApiError("Server data load failed. Showing local fallback data.");
    });
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(content.products.map((item) => item.category))),
    [content.products]
  );
  const manufacturers = useMemo(
    () => Array.from(new Set(content.products.map((item) => item.manufacturer))),
    [content.products]
  );

  const filteredProducts = useMemo(
    () =>
      filterProducts(content.products, {
        search: search || undefined,
        category: selectedCategory || undefined,
        manufacturer: selectedManufacturer || undefined,
        minPowerW: minPower > 0 ? minPower : undefined,
        maxWavelengthNm: maxWavelength < 1200 ? maxWavelength : undefined
      }),
    [content.products, maxWavelength, minPower, search, selectedCategory, selectedManufacturer]
  );

  useEffect(() => {
    if (!filteredProducts.find((item) => item.id === selectedProductId)) {
      setSelectedProductId(filteredProducts[0]?.id ?? "");
    }
  }, [filteredProducts, selectedProductId]);

  const selectedProduct = useMemo(
    () => content.products.find((item) => item.id === selectedProductId),
    [content.products, selectedProductId]
  );

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
      setSubmittedMessage("Request submitted successfully.");
      event.currentTarget.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Inquiry submission failed.";
      setSubmittedMessage(message);
    }
  };

  const heroSlide = content.heroSlides[activeSlide] ?? content.heroSlides[0];

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <a className="brand" href="#main-hero">
            SHINHOTEK
          </a>
          <nav aria-label="Main menu">
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.target}>
                  <button type="button" onClick={() => scrollToSection(item.target)}>
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <a className="nav-admin-link" href="/admin">
                  Admin
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <aside className="quick-menu" aria-label="Quick links">
        {content.quickLinks.map((link) => (
          <a key={link.label} href={link.url} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </aside>

      <main>
        <section id="main-hero" className="hero">
          <div className="hero-bg" data-theme={activeSlide} />
          <div className="container hero-content">
            <div className="hero-copy">
              <p className="hero-label">Homepage Renewal</p>
              <h1>{heroSlide?.title}</h1>
              <p>{heroSlide?.subtitle}</p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => scrollToSection(heroSlide?.ctaTarget ?? "products")}
                >
                  {heroSlide?.ctaLabel ?? "View"}
                </button>
                <button type="button" className="btn-ghost" onClick={() => scrollToSection("products")}>
                  Product Search
                </button>
              </div>
            </div>
            <div className="hero-dots" role="tablist" aria-label="Hero slides">
              {content.heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={activeSlide === index}
                  className={activeSlide === index ? "dot active" : "dot"}
                  onClick={() => setActiveSlide(index)}
                >
                  <span className="sr-only">{slide.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="company" className="section">
          <div className="container">
            <div className="section-head">
              <p>Company</p>
              <h2>CEO Message and Vision</h2>
            </div>
            {apiError ? <p className="api-warning">{apiError}</p> : null}
            <div className="split-card">
              <article>
                <h3>CEO Message</h3>
                <p>{content.ceoMessage}</p>
              </article>
              <article>
                <h3>Vision</h3>
                <ul>
                  {content.visionItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>

            <div id="partners" className="partner-wrap">
              <h3>Partners</h3>
              <div className="partner-grid">
                {content.partners.map((partner) => (
                  <a key={partner.id} href={partner.url} target="_blank" rel="noreferrer">
                    <strong>{partner.name}</strong>
                    <span>{partner.category}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="map-wrap">
              <h3>Location</h3>
              <iframe
                title="SHINHOTEK Headquarter Map"
                src="https://maps.google.com/maps?q=19%20Gasan%20digital%201-ro%2C%20Geumcheon-gu%2C%20Seoul&t=&z=14&ie=UTF8&iwloc=&output=embed"
                loading="lazy"
              />
              <address>
                {content.contact.headquarter}
                <br />
                Tel. {content.contact.tel} / Fax. {content.contact.fax} / {content.contact.email}
              </address>
            </div>
          </div>
        </section>

        <section id="applications" className="section contrast">
          <div className="container">
            <div className="section-head">
              <p>Application</p>
              <h2>Industry Mapping</h2>
            </div>
            <div className="app-grid">
              {content.applications.map((item) => (
                <article key={item.id}>
                  <h3>{item.name}</h3>
                  <p>{item.summary}</p>
                  <dl>
                    <dt>Process</dt>
                    <dd>{item.process}</dd>
                    <dt>Recommended</dt>
                    <dd>{item.recommendedProductCategory}</dd>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="products" className="section">
          <div className="container">
            <div className="section-head">
              <p>Product</p>
              <h2>Integrated Search and Filter</h2>
            </div>
            <form className="filter-panel" onSubmit={(event) => event.preventDefault()}>
              <label>
                Search
                <input
                  type="search"
                  placeholder="name, manufacturer, benefit"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label>
                Category
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  <option value="">All</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Manufacturer
                <select
                  value={selectedManufacturer}
                  onChange={(event) => setSelectedManufacturer(event.target.value)}
                >
                  <option value="">All</option>
                  {manufacturers.map((manufacturer) => (
                    <option key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Min Power (W)
                <input
                  type="number"
                  min={0}
                  value={minPower}
                  onChange={(event) => setMinPower(Number(event.target.value))}
                />
              </label>
              <label>
                Max Wavelength (nm): {maxWavelength}
                <input
                  type="range"
                  min={300}
                  max={1200}
                  step={10}
                  value={maxWavelength}
                  onChange={(event) => setMaxWavelength(Number(event.target.value))}
                />
              </label>
            </form>

            <p className="result-count">Result: {filteredProducts.length}</p>

            <div className="product-layout">
              <div className="product-list" role="list">
                {filteredProducts.map((item) => (
                  <article key={item.id} role="listitem" className="product-card">
                    <h3>{item.name}</h3>
                    <p>{item.benefit}</p>
                    <ul>
                      <li>Category: {item.category}</li>
                      <li>Manufacturer: {item.manufacturer}</li>
                      <li>Wavelength: {item.wavelengthNm} nm</li>
                      <li>Power: {item.powerW} W</li>
                    </ul>
                    <div className="card-actions">
                      <button type="button" onClick={() => setSelectedProductId(item.id)}>
                        Details
                      </button>
                      <button type="button" onClick={() => scrollToSection("inquiry")}>
                        Quote
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <aside className="product-detail" aria-live="polite">
                {selectedProduct ? (
                  <>
                    <h3>{selectedProduct.name}</h3>
                    <p>{selectedProduct.benefit}</p>
                    <dl>
                      <dt>Category</dt>
                      <dd>{selectedProduct.category}</dd>
                      <dt>Manufacturer</dt>
                      <dd>{selectedProduct.manufacturer}</dd>
                      <dt>Wavelength</dt>
                      <dd>{selectedProduct.wavelengthNm} nm</dd>
                      <dt>Power</dt>
                      <dd>{selectedProduct.powerW} W</dd>
                      <dt>Interface</dt>
                      <dd>{selectedProduct.interface}</dd>
                    </dl>
                    <div className="download-links">
                      <a href={selectedProduct.datasheetUrl}>Datasheet</a>
                      <a href={selectedProduct.cadUrl}>2D/3D CAD</a>
                    </div>
                  </>
                ) : (
                  <p>No matching products.</p>
                )}
              </aside>
            </div>
          </div>
        </section>

        <section id="solutions" className="section contrast">
          <div className="container">
            <div className="section-head">
              <p>SH Solution</p>
              <h2>Optical / Mechanical / SW Design</h2>
            </div>
            <ol className="process-line">
              {content.processSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="solution-grid">
              {content.solutions.map((solution) => (
                <article key={solution.id}>
                  <h3>{solution.title}</h3>
                  <p>{solution.overview}</p>
                  <ul>
                    {solution.capabilities.map((capability) => (
                      <li key={capability}>{capability}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="inquiry" className="section">
          <div className="container">
            <div className="section-head">
              <p>Inquiry</p>
              <h2>Quote / Test & Demo</h2>
            </div>
            <form className="inquiry-form" onSubmit={submitInquiry}>
              <label htmlFor="company">
                Company *
                <input id="company" name="company" required />
              </label>
              <label htmlFor="position">
                Position
                <input id="position" name="position" />
              </label>
              <label htmlFor="name">
                Name *
                <input id="name" name="name" required />
              </label>
              <label htmlFor="email">
                Email *
                <input id="email" name="email" type="email" required />
              </label>
              <label htmlFor="contact-number">
                Contact
                <input id="contact-number" name="contactNumber" />
              </label>
              <label htmlFor="requirements">
                Requirements
                <textarea id="requirements" name="requirements" rows={4} />
              </label>
              <label className="consent">
                <input type="checkbox" name="consent" required />
                I agree to the privacy policy.
              </label>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Submit Quote Request
                </button>
              </div>
              {submittedMessage ? <p className="submit-ok">{submittedMessage}</p> : null}
            </form>
          </div>
        </section>

        <section id="resources" className="section contrast">
          <div className="container">
            <div className="section-head">
              <p>Resources / Notices</p>
              <h2>Downloads and Notices</h2>
            </div>
            <div className="resource-layout">
              <article>
                <h3>Resources</h3>
                <ul className="resource-list">
                  {resources.map((resource) => (
                    <li key={resource.id}>
                      <span>{resource.type}</span>
                      <strong>{resource.title}</strong>
                      <a href="#">Download</a>
                    </li>
                  ))}
                </ul>
              </article>
              <article>
                <h3>Notices</h3>
                <ul className="notice-list">
                  {notices.map((notice) => (
                    <li key={notice.id}>
                      <strong>{notice.title}</strong>
                      <time dateTime={notice.publishedAt}>{notice.publishedAt}</time>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="reference" className="section">
          <div className="container">
            <div className="section-head">
              <p>Reference</p>
              <h2>Benchmark Links</h2>
            </div>
            <ul className="reference-list">
              {content.benchmarkReferences.map((reference) => (
                <li key={reference.url}>
                  <span>{reference.name}</span>
                  <a href={reference.url} target="_blank" rel="noreferrer">
                    {reference.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <h3>SHINHOTEK Co., Ltd.</h3>
            <p>{content.contact.headquarter}</p>
            <p>Tel. {content.contact.tel} | Fax. {content.contact.fax}</p>
          </div>
          <div>
            <h3>R&D Center</h3>
            <p>{content.contact.rdCenter}</p>
            <p>
              {content.contact.email} | {content.contact.website}
            </p>
          </div>
          <div>
            <h3>Policy</h3>
            <p>Information is subject to change without notice.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default PublicSite;
