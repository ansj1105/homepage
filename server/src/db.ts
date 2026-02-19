import { Pool } from "pg";
import { initialSiteContent, notices as seedNotices, resources as seedResources } from "../../src/data/siteData";
import type { InquiryItem, NoticeItem, ResourceItem, SiteContent } from "../../src/types";
import type { InquiryCreatePayload, InquiryRow, NoticeRow, ResourceRow } from "./types";

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
  publishedAt: row.published_at
});

const mapInquiryRow = (row: InquiryRow): InquiryItem => ({
  id: row.id,
  company: row.company,
  position: row.position,
  name: row.name,
  email: row.email,
  contactNumber: row.contact_number,
  requirements: row.requirements,
  consent: row.consent,
  status: row.status,
  createdAt: row.created_at
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
        `INSERT INTO notices (id, title, published_at)
         VALUES ($1, $2, $3::date)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.title, item.publishedAt]
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

export const listResources = async (): Promise<ResourceItem[]> => {
  const result = await pool.query<ResourceRow>(
    "SELECT id, title, type FROM resources ORDER BY created_at DESC, title ASC"
  );
  return result.rows;
};

export const createResource = async (title: string, type: ResourceItem["type"]): Promise<ResourceItem> => {
  if (!resourceTypes.includes(type)) {
    throw new Error("Invalid resource type");
  }
  const result = await pool.query<ResourceRow>(
    `INSERT INTO resources (title, type)
     VALUES ($1, $2)
     RETURNING id, title, type`,
    [title, type]
  );
  return result.rows[0];
};

export const updateResource = async (
  id: string,
  title: string,
  type: ResourceItem["type"]
): Promise<ResourceItem | null> => {
  const result = await pool.query<ResourceRow>(
    `UPDATE resources
     SET title = $2, type = $3
     WHERE id = $1
     RETURNING id, title, type`,
    [id, title, type]
  );
  return result.rows[0] ?? null;
};

export const deleteResource = async (id: string): Promise<boolean> => {
  const result = await pool.query("DELETE FROM resources WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
};

export const listNotices = async (): Promise<NoticeItem[]> => {
  const result = await pool.query<NoticeRow>(
    "SELECT id, title, published_at FROM notices ORDER BY published_at DESC, created_at DESC"
  );
  return result.rows.map(mapNoticeRow);
};

export const createNotice = async (title: string, publishedAt: string): Promise<NoticeItem> => {
  const result = await pool.query<NoticeRow>(
    `INSERT INTO notices (title, published_at)
     VALUES ($1, $2::date)
     RETURNING id, title, published_at`,
    [title, publishedAt]
  );
  return mapNoticeRow(result.rows[0]);
};

export const updateNotice = async (
  id: string,
  title: string,
  publishedAt: string
): Promise<NoticeItem | null> => {
  const result = await pool.query<NoticeRow>(
    `UPDATE notices
     SET title = $2, published_at = $3::date
     WHERE id = $1
     RETURNING id, title, published_at`,
    [id, title, publishedAt]
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
      (company, position, name, email, contact_number, requirements, consent, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'received')
     RETURNING id, company, position, name, email, contact_number, requirements, consent, status, created_at`,
    [
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
    `SELECT id, company, position, name, email, contact_number, requirements, consent, status, created_at
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
     SET status = $2
     WHERE id = $1
     RETURNING id, company, position, name, email, contact_number, requirements, consent, status, created_at`,
    [id, status]
  );
  return result.rows[0] ? mapInquiryRow(result.rows[0]) : null;
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};
