import { Pool } from "pg";
import { defaultCmsPages } from "../../src/data/cmsPageDefaults";
import { defaultMainPageContent } from "../../src/data/mainPageDefaults";
import { defaultPublicSiteSettings } from "../../src/data/siteSettingsDefaults";
import { initialSiteContent, notices as seedNotices, resources as seedResources } from "../../src/data/siteData";
import type {
  CmsPage,
  InquiryItem,
  MainPageContent,
  MainPageSettings,
  NoticeItem,
  PublicSiteSettings,
  ResourceItem,
  SiteContent
} from "../../src/types";
import type {
  InquiryCreatePayload,
  CmsPageRow,
  InquiryRow,
  MainPageApplicationCardRow,
  MainPageSettingsRow,
  MainPageSlideRow,
  NoticeRow,
  PublicSiteSettingsRow,
  ResourceRow
} from "./types";

const resourceTypes = ["Catalog", "White Paper", "Certificate", "Case Study"] as const;

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({ connectionString })
  : new Pool({
      host: process.env.POSTGRES_HOST ?? "localhost",
      port: parsePort(process.env.POSTGRES_PORT, 5432),
      database: process.env.POSTGRES_DB ?? "sh_homepage",
      user: process.env.POSTGRES_USER ?? "sh_user",
      password: process.env.POSTGRES_PASSWORD ?? "sh_password"
    });

const mapNoticeRow = (row: NoticeRow): NoticeItem => ({
  id: row.id,
  title: row.title,
  publishedAt: row.published_at,
  markdown: row.markdown
});

const mapInquiryRow = (row: InquiryRow): InquiryItem => ({
  id: row.id,
  inquiryType: row.inquiry_type,
  company: row.company,
  position: row.position,
  name: row.name,
  email: row.email,
  contactNumber: row.contact_number,
  requirements: row.requirements,
  consent: row.consent,
  status: row.status,
  isRead: row.is_read,
  createdAt: row.created_at
});

const mapMainPageSettingsRow = (row: MainPageSettingsRow): MainPageSettings => ({
  heroCopyTop: row.hero_copy_top,
  heroCopyMid: row.hero_copy_mid,
  heroCopyBottom: row.hero_copy_bottom,
  heroCtaLabel: row.hero_cta_label,
  heroCtaHref: row.hero_cta_href,
  aboutTitle: row.about_title,
  aboutBody1: row.about_body_1,
  aboutBody2: row.about_body_2,
  aboutImageUrl: row.about_image_url,
  solutionTitle: row.solution_title,
  solutionBody1: row.solution_body_1,
  solutionBody2: row.solution_body_2,
  solutionStepImage1: row.solution_step_image_1,
  solutionStepImage2: row.solution_step_image_2,
  solutionStepImage3: row.solution_step_image_3,
  footerAddress: row.footer_address,
  footerCopyright: row.footer_copyright
});

const mapCmsPageRow = (row: CmsPageRow): CmsPage => ({
  slug: row.slug,
  title: row.title,
  imageUrl: row.image_url,
  markdown: row.markdown,
  updatedAt: row.updated_at
});

export const ensureConnection = async (): Promise<void> => {
  await pool.query("SELECT 1");
};

export const seedDatabaseIfNeeded = async (): Promise<void> => {
  const contentCount = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM site_content");
  if (Number(contentCount.rows[0]?.count ?? "0") === 0) {
    await pool.query(
      `INSERT INTO site_content (id, payload)
       VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [JSON.stringify(initialSiteContent)]
    );
  }

  const resourceCount = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM resources");
  if (Number(resourceCount.rows[0]?.count ?? "0") === 0) {
    for (const item of seedResources) {
      await pool.query(
        `INSERT INTO resources (id, title, type)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.title, item.type]
      );
    }
  }

  const noticeCount = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM notices");
  if (Number(noticeCount.rows[0]?.count ?? "0") === 0) {
    for (const item of seedNotices) {
      await pool.query(
        `INSERT INTO notices (id, title, published_at, markdown)
         VALUES ($1, $2, $3::date, $4)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.title, item.publishedAt, item.markdown]
      );
    }
  }

  const mainSettingsCount = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM main_page_settings"
  );
  if (Number(mainSettingsCount.rows[0]?.count ?? "0") === 0) {
    const settings = defaultMainPageContent.settings;
    await pool.query(
      `INSERT INTO main_page_settings (
        id, hero_copy_top, hero_copy_mid, hero_copy_bottom, hero_cta_label, hero_cta_href,
        about_title, about_body_1, about_body_2, about_image_url, solution_title, solution_body_1,
        solution_body_2, solution_step_image_1, solution_step_image_2, solution_step_image_3,
        footer_address, footer_copyright
      ) VALUES (
        1, $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17
      )`,
      [
        settings.heroCopyTop,
        settings.heroCopyMid,
        settings.heroCopyBottom,
        settings.heroCtaLabel,
        settings.heroCtaHref,
        settings.aboutTitle,
        settings.aboutBody1,
        settings.aboutBody2,
        settings.aboutImageUrl,
        settings.solutionTitle,
        settings.solutionBody1,
        settings.solutionBody2,
        settings.solutionStepImage1,
        settings.solutionStepImage2,
        settings.solutionStepImage3,
        settings.footerAddress,
        settings.footerCopyright
      ]
    );
  }

  const mainSlideCount = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM main_page_slides"
  );
  if (Number(mainSlideCount.rows[0]?.count ?? "0") === 0) {
    for (const slide of defaultMainPageContent.slides) {
      await pool.query(
        `INSERT INTO main_page_slides (id, image_url, sort_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [slide.id, slide.imageUrl, slide.sortOrder]
      );
    }
  }

  const mainCardCount = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM main_page_application_cards"
  );
  if (Number(mainCardCount.rows[0]?.count ?? "0") === 0) {
    for (const card of defaultMainPageContent.applicationCards) {
      await pool.query(
        `INSERT INTO main_page_application_cards (id, label, image_url, link_url, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [card.id, card.label, card.imageUrl, card.linkUrl, card.sortOrder]
      );
    }
  }

  const publicSettingsCount = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM public_site_settings"
  );
  if (Number(publicSettingsCount.rows[0]?.count ?? "0") === 0) {
    await pool.query(
      `INSERT INTO public_site_settings (id, payload)
       VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [JSON.stringify(defaultPublicSiteSettings)]
    );
  }

  const cmsPageCount = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM cms_pages");
  if (Number(cmsPageCount.rows[0]?.count ?? "0") === 0) {
    for (const page of defaultCmsPages) {
      await pool.query(
        `INSERT INTO cms_pages (slug, title, image_url, markdown)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO NOTHING`,
        [page.slug, page.title, page.imageUrl, page.markdown]
      );
    }
  }
};

export const getContent = async (): Promise<SiteContent> => {
  const result = await pool.query<{ payload: SiteContent }>(
    "SELECT payload FROM site_content WHERE id = 1 LIMIT 1"
  );
  if (!result.rows[0]) {
    throw new Error("Site content not found");
  }
  return result.rows[0].payload;
};

export const saveContent = async (payload: SiteContent): Promise<SiteContent> => {
  await pool.query(
    `INSERT INTO site_content (id, payload)
     VALUES (1, $1::jsonb)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [JSON.stringify(payload)]
  );
  return payload;
};

export const getPublicSiteSettings = async (): Promise<PublicSiteSettings> => {
  const result = await pool.query<PublicSiteSettingsRow>(
    "SELECT payload FROM public_site_settings WHERE id = 1 LIMIT 1"
  );
  if (!result.rows[0]) {
    throw new Error("Public site settings not found");
  }
  return result.rows[0].payload;
};

export const savePublicSiteSettings = async (
  payload: PublicSiteSettings
): Promise<PublicSiteSettings> => {
  await pool.query(
    `INSERT INTO public_site_settings (id, payload)
     VALUES (1, $1::jsonb)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [JSON.stringify(payload)]
  );
  return payload;
};

export const listCmsPages = async (): Promise<CmsPage[]> => {
  const result = await pool.query<CmsPageRow>(
    "SELECT slug, title, image_url, markdown, updated_at FROM cms_pages ORDER BY slug ASC"
  );
  return result.rows.map(mapCmsPageRow);
};

export const getCmsPageBySlug = async (slug: string): Promise<CmsPage | null> => {
  const result = await pool.query<CmsPageRow>(
    "SELECT slug, title, image_url, markdown, updated_at FROM cms_pages WHERE slug = $1 LIMIT 1",
    [slug]
  );
  return result.rows[0] ? mapCmsPageRow(result.rows[0]) : null;
};

export const createCmsPage = async (
  slug: string,
  title: string,
  imageUrl: string,
  markdown: string
): Promise<CmsPage> => {
  const result = await pool.query<CmsPageRow>(
    `INSERT INTO cms_pages (slug, title, image_url, markdown)
     VALUES ($1, $2, $3, $4)
     RETURNING slug, title, image_url, markdown, updated_at`,
    [slug, title, imageUrl, markdown]
  );
  return mapCmsPageRow(result.rows[0]);
};

export const updateCmsPage = async (
  slug: string,
  title: string,
  imageUrl: string,
  markdown: string
): Promise<CmsPage | null> => {
  const result = await pool.query<CmsPageRow>(
    `UPDATE cms_pages
     SET title = $2, image_url = $3, markdown = $4, updated_at = NOW()
     WHERE slug = $1
     RETURNING slug, title, image_url, markdown, updated_at`,
    [slug, title, imageUrl, markdown]
  );
  return result.rows[0] ? mapCmsPageRow(result.rows[0]) : null;
};

export const deleteCmsPage = async (slug: string): Promise<boolean> => {
  const result = await pool.query("DELETE FROM cms_pages WHERE slug = $1", [slug]);
  return (result.rowCount ?? 0) > 0;
};

export const getMainPageContent = async (): Promise<MainPageContent> => {
  const [settingsResult, slidesResult, cardsResult] = await Promise.all([
    pool.query<MainPageSettingsRow>(
      `SELECT
        hero_copy_top, hero_copy_mid, hero_copy_bottom, hero_cta_label, hero_cta_href,
        about_title, about_body_1, about_body_2, about_image_url, solution_title, solution_body_1,
        solution_body_2, solution_step_image_1, solution_step_image_2, solution_step_image_3,
        footer_address, footer_copyright
       FROM main_page_settings
       WHERE id = 1
       LIMIT 1`
    ),
    pool.query<MainPageSlideRow>(
      "SELECT id, image_url, sort_order FROM main_page_slides ORDER BY sort_order ASC, created_at ASC"
    ),
    pool.query<MainPageApplicationCardRow>(
      "SELECT id, label, image_url, link_url, sort_order FROM main_page_application_cards ORDER BY sort_order ASC, created_at ASC"
    )
  ]);

  if (!settingsResult.rows[0]) {
    throw new Error("Main page settings not found");
  }

  return {
    settings: mapMainPageSettingsRow(settingsResult.rows[0]),
    slides: slidesResult.rows.map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      sortOrder: row.sort_order
    })),
    applicationCards: cardsResult.rows.map((row) => ({
      id: row.id,
      label: row.label,
      imageUrl: row.image_url,
      linkUrl: row.link_url,
      sortOrder: row.sort_order
    }))
  };
};

export const saveMainPageContent = async (payload: MainPageContent): Promise<MainPageContent> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const s = payload.settings;
    await client.query(
      `INSERT INTO main_page_settings (
        id, hero_copy_top, hero_copy_mid, hero_copy_bottom, hero_cta_label, hero_cta_href,
        about_title, about_body_1, about_body_2, about_image_url, solution_title, solution_body_1,
        solution_body_2, solution_step_image_1, solution_step_image_2, solution_step_image_3,
        footer_address, footer_copyright, updated_at
      ) VALUES (
        1, $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        hero_copy_top = EXCLUDED.hero_copy_top,
        hero_copy_mid = EXCLUDED.hero_copy_mid,
        hero_copy_bottom = EXCLUDED.hero_copy_bottom,
        hero_cta_label = EXCLUDED.hero_cta_label,
        hero_cta_href = EXCLUDED.hero_cta_href,
        about_title = EXCLUDED.about_title,
        about_body_1 = EXCLUDED.about_body_1,
        about_body_2 = EXCLUDED.about_body_2,
        about_image_url = EXCLUDED.about_image_url,
        solution_title = EXCLUDED.solution_title,
        solution_body_1 = EXCLUDED.solution_body_1,
        solution_body_2 = EXCLUDED.solution_body_2,
        solution_step_image_1 = EXCLUDED.solution_step_image_1,
        solution_step_image_2 = EXCLUDED.solution_step_image_2,
        solution_step_image_3 = EXCLUDED.solution_step_image_3,
        footer_address = EXCLUDED.footer_address,
        footer_copyright = EXCLUDED.footer_copyright,
        updated_at = NOW()`,
      [
        s.heroCopyTop,
        s.heroCopyMid,
        s.heroCopyBottom,
        s.heroCtaLabel,
        s.heroCtaHref,
        s.aboutTitle,
        s.aboutBody1,
        s.aboutBody2,
        s.aboutImageUrl,
        s.solutionTitle,
        s.solutionBody1,
        s.solutionBody2,
        s.solutionStepImage1,
        s.solutionStepImage2,
        s.solutionStepImage3,
        s.footerAddress,
        s.footerCopyright
      ]
    );

    await client.query("DELETE FROM main_page_slides");
    for (const slide of payload.slides) {
      await client.query(
        `INSERT INTO main_page_slides (id, image_url, sort_order)
         VALUES ($1, $2, $3)`,
        [slide.id, slide.imageUrl, slide.sortOrder]
      );
    }

    await client.query("DELETE FROM main_page_application_cards");
    for (const card of payload.applicationCards) {
      await client.query(
        `INSERT INTO main_page_application_cards (id, label, image_url, link_url, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [card.id, card.label, card.imageUrl, card.linkUrl, card.sortOrder]
      );
    }

    await client.query("COMMIT");
    return payload;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const listResources = async (): Promise<ResourceItem[]> => {
  const result = await pool.query<ResourceRow>(
    "SELECT id, title, type, file_url, markdown FROM resources ORDER BY updated_at DESC, created_at DESC"
  );
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    type: row.type,
    fileUrl: row.file_url,
    markdown: row.markdown
  }));
};

export const createResource = async (
  title: string,
  type: ResourceItem["type"],
  fileUrl: string,
  markdown: string
): Promise<ResourceItem> => {
  if (!resourceTypes.includes(type)) {
    throw new Error("Invalid resource type");
  }
  const result = await pool.query<ResourceRow>(
    `INSERT INTO resources (title, type, file_url, markdown, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, title, type, file_url, markdown`,
    [title, type, fileUrl, markdown]
  );
  return {
    id: result.rows[0].id,
    title: result.rows[0].title,
    type: result.rows[0].type,
    fileUrl: result.rows[0].file_url,
    markdown: result.rows[0].markdown
  };
};

export const updateResource = async (
  id: string,
  title: string,
  type: ResourceItem["type"],
  fileUrl: string,
  markdown: string
): Promise<ResourceItem | null> => {
  const result = await pool.query<ResourceRow>(
    `UPDATE resources
     SET title = $2, type = $3, file_url = $4, markdown = $5, updated_at = NOW()
     WHERE id = $1
     RETURNING id, title, type, file_url, markdown`,
    [id, title, type, fileUrl, markdown]
  );
  if (!result.rows[0]) return null;
  return {
    id: result.rows[0].id,
    title: result.rows[0].title,
    type: result.rows[0].type,
    fileUrl: result.rows[0].file_url,
    markdown: result.rows[0].markdown
  };
};

export const deleteResource = async (id: string): Promise<boolean> => {
  const result = await pool.query("DELETE FROM resources WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
};

export const listNotices = async (): Promise<NoticeItem[]> => {
  const result = await pool.query<NoticeRow>(
    "SELECT id, title, published_at, markdown FROM notices ORDER BY published_at DESC, updated_at DESC, created_at DESC"
  );
  return result.rows.map(mapNoticeRow);
};

export const createNotice = async (
  title: string,
  publishedAt: string,
  markdown: string
): Promise<NoticeItem> => {
  const result = await pool.query<NoticeRow>(
    `INSERT INTO notices (title, published_at, markdown, updated_at)
     VALUES ($1, $2::date, $3, NOW())
     RETURNING id, title, published_at, markdown`,
    [title, publishedAt, markdown]
  );
  return mapNoticeRow(result.rows[0]);
};

export const updateNotice = async (
  id: string,
  title: string,
  publishedAt: string,
  markdown: string
): Promise<NoticeItem | null> => {
  const result = await pool.query<NoticeRow>(
    `UPDATE notices
     SET title = $2, published_at = $3::date, markdown = $4, updated_at = NOW()
     WHERE id = $1
     RETURNING id, title, published_at, markdown`,
    [id, title, publishedAt, markdown]
  );
  return result.rows[0] ? mapNoticeRow(result.rows[0]) : null;
};

export const deleteNotice = async (id: string): Promise<boolean> => {
  const result = await pool.query("DELETE FROM notices WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
};

export const createInquiry = async (payload: InquiryCreatePayload): Promise<InquiryItem> => {
  const result = await pool.query<InquiryRow>(
    `INSERT INTO inquiries
      (inquiry_type, company, position, name, email, contact_number, requirements, consent, status, is_read)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'in-review', FALSE)
     RETURNING id, inquiry_type, company, position, name, email, contact_number, requirements, consent, status, is_read, created_at`,
    [
      payload.inquiryType,
      payload.company,
      payload.position,
      payload.name,
      payload.email,
      payload.contactNumber,
      payload.requirements,
      payload.consent
    ]
  );
  return mapInquiryRow(result.rows[0]);
};

export const listInquiries = async (): Promise<InquiryItem[]> => {
  const result = await pool.query<InquiryRow>(
    `SELECT id, inquiry_type, company, position, name, email, contact_number, requirements, consent, status, is_read, created_at
     FROM inquiries
     ORDER BY created_at DESC`
  );
  return result.rows.map(mapInquiryRow);
};

export const updateInquiryStatus = async (
  id: string,
  status: InquiryItem["status"]
): Promise<InquiryItem | null> => {
  const result = await pool.query<InquiryRow>(
    `UPDATE inquiries
     SET status = $2, is_read = TRUE
     WHERE id = $1
     RETURNING id, inquiry_type, company, position, name, email, contact_number, requirements, consent, status, is_read, created_at`,
    [id, status]
  );
  return result.rows[0] ? mapInquiryRow(result.rows[0]) : null;
};

export const countUnreadInquiries = async (): Promise<number> => {
  const result = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM inquiries WHERE is_read = FALSE"
  );
  return Number(result.rows[0]?.count ?? "0");
};

export const markAllInquiriesAsRead = async (): Promise<number> => {
  const result = await pool.query(
    "UPDATE inquiries SET is_read = TRUE WHERE is_read = FALSE"
  );
  return result.rowCount ?? 0;
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};
