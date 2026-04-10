import { Pool } from "pg";
import { powerRankingEquipmentCatalog, powerRankingEquipmentCodes } from "../../src/data/powerRankingEquipment";
import { getGameCardById } from "../../src/data/gameCards";
import { powerRankingItemCatalog, powerRankingItemCodes } from "../../src/data/powerRankingItems";
import { defaultCmsPages } from "../../src/data/cmsPageDefaults";
import { defaultMainPageContent } from "../../src/data/mainPageDefaults";
import { defaultPublicSiteSettings } from "../../src/data/siteSettingsDefaults";
import { initialSiteContent, notices as seedNotices, resources as seedResources } from "../../src/data/siteData";
import type {
  BoardPost,
  BoardReply,
  CmsPage,
  HuntingProfile,
  HuntingBattleRankingEntry,
  InquiryItem,
  MainPageContent,
  MainPageSettings,
  NoticeItem,
  PowerRankingEquipmentCode,
  PowerRankingEquipmentInventoryItem,
  PowerRankingEquipmentSlot,
  PowerRankingEquipmentState,
  PowerRankingEquippedItem,
  PowerRankingEventLog,
  PowerRankingInventoryItem,
  PowerRankingItemCode,
  PowerRankingItemUseResponse,
  PowerRankingNote,
  PowerRankingPerson,
  PowerRankingVoteResponse,
  PublicSiteSettings,
  ResourceItem,
  SiteContent,
  TodayVisitorResponse,
  LiveVisitorResponse,
  UserProfile
} from "../../src/types";
import type {
  InquiryCreatePayload,
  BoardPostRow,
  BoardReplyRow,
  CmsPageRow,
  InquiryRow,
  MainPageApplicationCardRow,
  MainPageSettingsRow,
  MainPageSlideRow,
  NoticeRow,
  PowerRankingEquippedRow,
  PowerRankingEquipmentInventoryRow,
  PowerRankingEventLogRow,
  PowerRankingNoteRow,
  PowerRankingPeriodMeta,
  PowerRankingPersonRow,
  PowerRankingUserItemRow,
  PowerRankingVoteRow,
  PublicSiteSettingsRow,
  ResourceRow,
  UserRow,
  VisitorDailyVisitRow,
  UserSessionRow
} from "./types";

const resourceTypes = ["Catalog", "White Paper", "Certificate", "Case Study"] as const;
const powerRankingSeedNames = [
  "강동혁",
  "권유진",
  "김다슬",
  "김민규",
  "김태훈",
  "박병준",
  "서은택",
  "신승아",
  "안서정",
  "이태수",
  "장서현",
  "장수희",
  "전준우",
  "정유찬",
  "천건호",
  "최수형",
  "최영웅"
];

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
  attachmentUrl: row.attachment_url,
  attachmentName: row.attachment_name,
  attachmentSize: Number(row.attachment_size ?? "0"),
  attachmentMimeType: row.attachment_mime_type,
  status: row.status,
  isRead: row.is_read,
  createdAt: row.created_at
});

const mapPowerRankingNoteRow = (row: PowerRankingNoteRow): PowerRankingNote => ({
  id: row.id,
  personId: row.person_id,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapPowerRankingPersonRow = (row: PowerRankingPersonRow): Omit<PowerRankingPerson, "notes" | "rank"> => ({
  id: row.id,
  name: row.name,
  profileImageUrl: row.profile_image_url,
  score: row.score,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapPowerRankingInventoryRow = (row: PowerRankingUserItemRow): PowerRankingInventoryItem => {
  const item = powerRankingItemCatalog[row.item_code];
  return {
    ...item,
    quantity: row.quantity,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const mapPowerRankingEventLogRow = (row: PowerRankingEventLogRow): PowerRankingEventLog => {
  const item = row.item_code ? powerRankingItemCatalog[row.item_code] : null;
  return {
    id: row.id,
    eventType: row.event_type,
    actorUserId: row.actor_user_id,
    actorNickname: row.actor_nickname ?? "알 수 없음",
    actorDeviceId: row.actor_device_id,
    personId: row.person_id,
    personName: row.person_name,
    delta: row.delta,
    itemCode: row.item_code,
    itemName: item?.name ?? null,
    itemImageUrl: item?.imageUrl ?? null,
    createdAt: row.created_at
  };
};

const mapPowerRankingEquipmentInventoryRow = (
  row: PowerRankingEquipmentInventoryRow
): PowerRankingEquipmentInventoryItem => {
  const equipment = powerRankingEquipmentCatalog[row.equipment_code];
  return {
    ...equipment,
    quantity: row.quantity,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const mapPowerRankingEquippedRow = (row: PowerRankingEquippedRow): PowerRankingEquippedItem => {
  const equipment = powerRankingEquipmentCatalog[row.equipment_code];
  return {
    ...equipment,
    equippedAt: row.equipped_at,
    updatedAt: row.updated_at
  };
};

const mapBoardReplyRow = (row: BoardReplyRow): BoardReply => ({
  id: row.id,
  postId: row.post_id,
  authorName: row.author_name,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapBoardPostRow = (row: BoardPostRow): Omit<BoardPost, "replies"> => ({
  id: row.id,
  userId: row.user_id,
  authorName: row.author_name,
  title: row.title,
  content: row.content,
  fileUrl: row.file_url,
  fileName: row.file_name,
  fileSize: Number(row.file_size ?? "0"),
  fileMimeType: row.file_mime_type,
  recommendationCount: row.recommendation_count,
  isBest: row.recommendation_count >= 5 && Date.now() - new Date(row.created_at).getTime() <= 14 * 24 * 60 * 60 * 1000,
  isRecommendedByCurrentUser: Boolean(row.is_recommended_by_current_user),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapUserRow = (row: UserRow): UserProfile => ({
  id: row.id,
  username: row.username,
  name: row.name,
  nickname: row.nickname,
  createdAt: row.created_at
});

const passwordMismatchError = () => new Error("Invalid password");
const powerRankingDailyActionLimit = 1000;
const powerRankingDropRate = 0.01;
const powerRankingEquipmentDropRate = 0.01;

const getPowerRankingPeriodMeta = (period: "all" | "weekly" | "daily"): PowerRankingPeriodMeta => {
  if (period === "daily") {
    return {
      period,
      whereSql: "AND v.created_at >= NOW() - INTERVAL '1 day'",
      params: []
    };
  }
  if (period === "weekly") {
    return {
      period,
      whereSql: "AND v.created_at >= NOW() - INTERVAL '7 days'",
      params: []
    };
  }
  return {
    period,
    whereSql: "",
    params: []
  };
};

const loadPowerRankingNotesByPersonIds = async (personIds: string[]): Promise<Map<string, PowerRankingNote[]>> => {
  if (personIds.length === 0) {
    return new Map();
  }

  const notesResult = await pool.query<PowerRankingNoteRow>(
    `SELECT id, person_id, content, created_at, updated_at
     FROM power_ranking_notes
     WHERE person_id = ANY($1::uuid[])
     ORDER BY created_at DESC`,
    [personIds]
  );

  const notesByPerson = new Map<string, PowerRankingNote[]>();
  for (const row of notesResult.rows) {
    const note = mapPowerRankingNoteRow(row);
    const current = notesByPerson.get(note.personId) ?? [];
    current.push(note);
    notesByPerson.set(note.personId, current);
  }

  return notesByPerson;
};

const loadPowerRankingPersonByPeriod = async (
  personId: string,
  period: "all" | "weekly" | "daily"
): Promise<PowerRankingPerson | null> => {
  const people = await listPowerRankingPeople(period);
  return people.find((person) => person.id === personId) ?? null;
};

const listPowerRankingInventoryByUserId = async (userId: string): Promise<PowerRankingInventoryItem[]> => {
  const result = await pool.query<PowerRankingUserItemRow>(
    `SELECT id, user_id, item_code, quantity, created_at, updated_at
     FROM power_ranking_user_items
     WHERE user_id = $1
       AND quantity > 0
     ORDER BY updated_at DESC, created_at DESC`,
    [userId]
  );
  return result.rows.map(mapPowerRankingInventoryRow);
};

const logPowerRankingEvent = async (
  actorUserId: string | null,
  actorDeviceId: string,
  personId: string,
  eventType: PowerRankingEventLog["eventType"],
  delta: number,
  itemCode?: PowerRankingItemCode | null
): Promise<void> => {
  await pool.query(
    `INSERT INTO power_ranking_event_logs (actor_user_id, actor_device_id, person_id, event_type, delta, item_code)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [actorUserId, actorDeviceId, personId, eventType, delta, itemCode ?? null]
  );
};

const grantPowerRankingItem = async (
  userId: string,
  itemCode: PowerRankingItemCode
): Promise<PowerRankingInventoryItem> => {
  const result = await pool.query<PowerRankingUserItemRow>(
    `INSERT INTO power_ranking_user_items (user_id, item_code, quantity)
     VALUES ($1, $2, 1)
     ON CONFLICT (user_id, item_code)
     DO UPDATE SET quantity = power_ranking_user_items.quantity + 1, updated_at = NOW()
     RETURNING id, user_id, item_code, quantity, created_at, updated_at`,
    [userId, itemCode]
  );
  return mapPowerRankingInventoryRow(result.rows[0]);
};

const drawRandomPowerRankingItemCode = (): PowerRankingItemCode => {
  const index = Math.floor(Math.random() * powerRankingItemCodes.length);
  return powerRankingItemCodes[index] as PowerRankingItemCode;
};

const drawRandomPowerRankingEquipmentCode = (): PowerRankingEquipmentCode => {
  const index = Math.floor(Math.random() * powerRankingEquipmentCodes.length);
  return powerRankingEquipmentCodes[index] as PowerRankingEquipmentCode;
};

const listPowerRankingEquipmentInventoryByUserId = async (
  userId: string
): Promise<PowerRankingEquipmentInventoryItem[]> => {
  const result = await pool.query<PowerRankingEquipmentInventoryRow>(
    `SELECT id, user_id, equipment_code, quantity, created_at, updated_at
     FROM power_ranking_user_equipment_inventory
     WHERE user_id = $1
       AND quantity > 0
     ORDER BY updated_at DESC, created_at DESC`,
    [userId]
  );
  return result.rows.map(mapPowerRankingEquipmentInventoryRow);
};

const listPowerRankingEquippedByUserId = async (
  userId: string
): Promise<PowerRankingEquipmentState["equipped"]> => {
  const result = await pool.query<PowerRankingEquippedRow>(
    `SELECT user_id, slot_code, equipment_code, equipped_at, updated_at
     FROM power_ranking_user_equipped
     WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );
  return result.rows.reduce<PowerRankingEquipmentState["equipped"]>((accumulator, row) => {
    accumulator[row.slot_code] = mapPowerRankingEquippedRow(row);
    return accumulator;
  }, {});
};

const grantPowerRankingEquipment = async (
  userId: string,
  equipmentCode: PowerRankingEquipmentCode
): Promise<PowerRankingEquipmentInventoryItem> => {
  const result = await pool.query<PowerRankingEquipmentInventoryRow>(
    `INSERT INTO power_ranking_user_equipment_inventory (user_id, equipment_code, quantity)
     VALUES ($1, $2, 1)
     ON CONFLICT (user_id, equipment_code)
     DO UPDATE SET quantity = power_ranking_user_equipment_inventory.quantity + 1, updated_at = NOW()
     RETURNING id, user_id, equipment_code, quantity, created_at, updated_at`,
    [userId, equipmentCode]
  );
  return result.rows.map(mapPowerRankingEquipmentInventoryRow)[0];
};

const getPowerRankingActionModifier = async (
  userId: string | null | undefined,
  delta: number
): Promise<{ finalDelta: number; consumableDropRate: number; equipmentDropRate: number }> => {
  let finalDelta = delta;
  let consumableDropRate = powerRankingDropRate;
  let equipmentDropRate = powerRankingEquipmentDropRate;

  if (!userId) {
    return { finalDelta, consumableDropRate, equipmentDropRate };
  }

  const equipped = await listPowerRankingEquippedByUserId(userId);
  const equippedItems = Object.values(equipped);
  if (equippedItems.length === 0) {
    return { finalDelta, consumableDropRate, equipmentDropRate };
  }

  const isPositive = delta > 0;
  const hasCheerCrown = equippedItems.some((item) => item.code === "crown-of-cheers");
  const hasMidnightSlacks = equippedItems.some((item) => item.code === "midnight-slacks");
  if ((isPositive && hasCheerCrown) || (!isPositive && hasMidnightSlacks)) {
    finalDelta *= 2;
  }

  if (isPositive && equippedItems.some((item) => item.code === "commander-jacket")) {
    finalDelta += 1;
  }
  if (!isPositive && equippedItems.some((item) => item.code === "wave-denim")) {
    finalDelta -= 1;
  }
  if (equippedItems.some((item) => item.code === "titan-gauntlet")) {
    finalDelta += isPositive ? 1 : -1;
  }

  if (equippedItems.some((item) => item.code === "mint-beret")) {
    consumableDropRate += 0.015;
  }
  if (equippedItems.some((item) => item.code === "ribbon-cardigan")) {
    consumableDropRate += 0.01;
    equipmentDropRate += 0.01;
  }
  if (equippedItems.some((item) => item.code === "aurora-skirt")) {
    equipmentDropRate += 0.015;
  }
  if (equippedItems.some((item) => item.code === "crystal-sneakers")) {
    consumableDropRate += 0.01;
  }
  if (equippedItems.some((item) => item.code === "ember-heels")) {
    equipmentDropRate += 0.01;
  }
  if (equippedItems.some((item) => item.code === "pulse-gloves")) {
    consumableDropRate += 0.008;
    equipmentDropRate += 0.008;
  }

  const firstActionBonusCandidates = new Set(["star-visor", "thunder-boots"]);
  if (equippedItems.some((item) => firstActionBonusCandidates.has(item.code))) {
    const dailyCountResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM power_ranking_votes
       WHERE user_id = $1
         AND created_at >= NOW() - INTERVAL '1 day'`,
      [userId]
    );
    const dailyCount = Number(dailyCountResult.rows[0]?.count ?? "0");
    if (dailyCount === 0) {
      finalDelta += isPositive ? 5 : -5;
    }
  }

  return { finalDelta, consumableDropRate, equipmentDropRate };
};

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

const hasLatestTopMenu = (settings: PublicSiteSettings): boolean => {
  const ids = new Set(settings.headerTopMenu.map((item) => item.id));
  return ids.has("company") && ids.has("application") && ids.has("solution") && ids.has("inquiry");
};

const hasLatestProductMega = (settings: PublicSiteSettings): boolean => {
  const ids = new Set(settings.headerProductMega.map((item) => item.id));
  return ids.has("laser") && ids.has("laser-metrology") && ids.has("optical-solution");
};

const hasLatestRouteMeta = (settings: PublicSiteSettings): boolean => {
  const routes = new Set(settings.routeMeta.map((item) => item.route));
  return routes.has("/application") && routes.has("/solution");
};

const normalizePublicSiteSettings = (settings: PublicSiteSettings): PublicSiteSettings => {
  const normalizedRouteMeta = settings.routeMeta.map((item) =>
    item.route === "/"
      ? {
          ...item,
          ...defaultPublicSiteSettings.routeMeta[0]
        }
      : item
  );

  if (hasLatestTopMenu(settings) && hasLatestProductMega(settings) && hasLatestRouteMeta(settings)) {
    return {
      ...settings,
      routeMeta: normalizedRouteMeta
    };
  }

  return {
    ...settings,
    routeMeta: defaultPublicSiteSettings.routeMeta,
    headerTopMenu: defaultPublicSiteSettings.headerTopMenu,
    headerProductMega: defaultPublicSiteSettings.headerProductMega
  };
};

const normalizeMainPageContent = (content: MainPageContent): MainPageContent => ({
  ...content,
  applicationCards: content.applicationCards.map((card) => ({
    ...card,
    linkUrl: card.linkUrl === "/product" ? `/application/${card.id === "medical" ? "medical-bio" : card.id}` : card.linkUrl
  }))
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

  for (const name of powerRankingSeedNames) {
    await pool.query(
      `INSERT INTO power_ranking_people (name)
       VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [name]
    );
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
  return normalizePublicSiteSettings(result.rows[0].payload);
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

export const listPowerRankingPeople = async (
  period: "all" | "weekly" | "daily" = "all"
): Promise<PowerRankingPerson[]> => {
  const periodMeta = getPowerRankingPeriodMeta(period);
  const scoreSql =
    period === "all"
      ? "p.score + COALESCE(SUM(v.delta), 0)"
      : "COALESCE(SUM(v.delta), 0)";
  const peopleResult = await pool.query<PowerRankingPersonRow>(
    `SELECT
       p.id,
       p.name,
       p.profile_image_url,
       ${scoreSql}::int AS score,
       p.created_at,
       p.updated_at
     FROM power_ranking_people p
     LEFT JOIN power_ranking_votes v
       ON v.person_id = p.id
       ${periodMeta.whereSql}
     GROUP BY p.id
     ORDER BY score DESC, p.name ASC, p.updated_at DESC`
  );
  const notesByPerson = await loadPowerRankingNotesByPersonIds(peopleResult.rows.map((row) => row.id));

  return peopleResult.rows.map((row, index) => ({
    ...mapPowerRankingPersonRow(row),
    rank: index + 1,
    notes: notesByPerson.get(row.id) ?? []
  }));
};

export const changePowerRankingScore = async (
  personId: string,
  deviceId: string,
  delta: 1 | -1,
  period: "all" | "weekly" | "daily",
  userId?: string | null
): Promise<PowerRankingVoteResponse | null> => {
  const personResult = await pool.query<{ id: string }>(
    "SELECT id FROM power_ranking_people WHERE id = $1 LIMIT 1",
    [personId]
  );
  if (!personResult.rows[0]) {
    return null;
  }

  const dailyCountResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM power_ranking_votes
     WHERE device_id = $1
       AND created_at >= NOW() - INTERVAL '1 day'`,
    [deviceId]
  );
  const dailyCount = Number(dailyCountResult.rows[0]?.count ?? "0");
  if (dailyCount >= powerRankingDailyActionLimit) {
    throw new Error("하루 최대 1000회까지만 반영할 수 있습니다.");
  }

  const modifier = await getPowerRankingActionModifier(userId ?? null, delta);

  await pool.query<PowerRankingVoteRow>(
    `INSERT INTO power_ranking_votes (person_id, user_id, device_id, delta)
     VALUES ($1, $2, $3, $4)`,
    [personId, userId ?? null, deviceId, modifier.finalDelta]
  );

  await logPowerRankingEvent(
    userId ?? null,
    deviceId,
    personId,
    delta > 0 ? "vote_up" : "vote_down",
    modifier.finalDelta
  );

  let droppedItem: PowerRankingInventoryItem | null = null;
  let droppedEquipment: PowerRankingEquipmentInventoryItem | null = null;
  if (userId && Math.random() < modifier.consumableDropRate) {
    const itemCode = drawRandomPowerRankingItemCode();
    droppedItem = await grantPowerRankingItem(userId, itemCode);
    await logPowerRankingEvent(userId, deviceId, personId, "item_drop", 0, itemCode);
  }
  if (userId && Math.random() < modifier.equipmentDropRate) {
    const equipmentCode = drawRandomPowerRankingEquipmentCode();
    droppedEquipment = await grantPowerRankingEquipment(userId, equipmentCode);
  }

  const person = (await loadPowerRankingPersonByPeriod(personId, period)) ?? (await loadPowerRankingPersonByPeriod(personId, "all"));
  if (!person) {
    return null;
  }

  return {
    person,
    droppedItem,
    droppedEquipment
  };
};

export const listPowerRankingInventory = async (userId: string): Promise<PowerRankingInventoryItem[]> =>
  listPowerRankingInventoryByUserId(userId);

export const listPowerRankingEquipmentState = async (
  userId: string
): Promise<PowerRankingEquipmentState> => ({
  inventory: await listPowerRankingEquipmentInventoryByUserId(userId),
  equipped: await listPowerRankingEquippedByUserId(userId)
});

export const listPowerRankingEventLogs = async (limit = 40): Promise<PowerRankingEventLog[]> => {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const result = await pool.query<PowerRankingEventLogRow>(
    `SELECT
       logs.id,
       logs.event_type,
       logs.actor_user_id,
       users.nickname AS actor_nickname,
       logs.actor_device_id,
       logs.person_id,
       people.name AS person_name,
       logs.delta,
       logs.item_code,
       logs.created_at
     FROM power_ranking_event_logs logs
     JOIN power_ranking_people people ON people.id = logs.person_id
     LEFT JOIN app_users users ON users.id = logs.actor_user_id
     ORDER BY logs.created_at DESC
     LIMIT $1`,
    [safeLimit]
  );
  return result.rows.map(mapPowerRankingEventLogRow);
};

export const usePowerRankingItem = async (
  userId: string,
  deviceId: string,
  personId: string,
  itemCode: PowerRankingItemCode,
  period: "all" | "weekly" | "daily"
): Promise<PowerRankingItemUseResponse | null> => {
  const item = powerRankingItemCatalog[itemCode];
  if (!item) {
    throw new Error("사용할 수 없는 아이템입니다.");
  }

  const personResult = await pool.query<{ id: string }>(
    "SELECT id FROM power_ranking_people WHERE id = $1 LIMIT 1",
    [personId]
  );
  if (!personResult.rows[0]) {
    return null;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const inventoryResult = await client.query<PowerRankingUserItemRow>(
      `SELECT id, user_id, item_code, quantity, created_at, updated_at
       FROM power_ranking_user_items
       WHERE user_id = $1
         AND item_code = $2
       FOR UPDATE`,
      [userId, itemCode]
    );
    const inventoryRow = inventoryResult.rows[0];
    if (!inventoryRow || inventoryRow.quantity <= 0) {
      throw new Error("보유한 아이템이 없습니다.");
    }

    await client.query(
      `UPDATE power_ranking_user_items
       SET quantity = quantity - 1, updated_at = NOW()
       WHERE id = $1`,
      [inventoryRow.id]
    );

    const equipped = await listPowerRankingEquippedByUserId(userId);
    let itemDelta = item.effectDelta;
    if (Object.values(equipped).some((equipment) => equipment.code === "golden-harness")) {
      itemDelta += item.effectDelta > 0 ? 20 : -20;
    }
    if (Object.values(equipped).some((equipment) => equipment.code === "silk-gloves")) {
      itemDelta += item.effectDelta > 0 ? 10 : -10;
    }

    await client.query<PowerRankingVoteRow>(
      `INSERT INTO power_ranking_votes (person_id, user_id, device_id, delta)
       VALUES ($1, $2, $3, $4)`,
      [personId, userId, deviceId, itemDelta]
    );

    await client.query(
      `INSERT INTO power_ranking_event_logs (actor_user_id, actor_device_id, person_id, event_type, delta, item_code)
       VALUES ($1, $2, $3, 'item_use', $4, $5)`,
      [userId, deviceId, personId, itemDelta, itemCode]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const person = (await loadPowerRankingPersonByPeriod(personId, period)) ?? (await loadPowerRankingPersonByPeriod(personId, "all"));
  if (!person) {
    return null;
  }

  return {
    person,
    inventory: await listPowerRankingInventoryByUserId(userId),
    appliedDelta: itemDelta,
    usedItem: {
      ...item,
      quantity: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
};

export const equipPowerRankingEquipment = async (
  userId: string,
  equipmentCode: PowerRankingEquipmentCode
): Promise<PowerRankingEquipmentState> => {
  const equipment = powerRankingEquipmentCatalog[equipmentCode];
  if (!equipment) {
    throw new Error("착용할 수 없는 장비입니다.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inventoryResult = await client.query<PowerRankingEquipmentInventoryRow>(
      `SELECT id, user_id, equipment_code, quantity, created_at, updated_at
       FROM power_ranking_user_equipment_inventory
       WHERE user_id = $1
         AND equipment_code = $2
       FOR UPDATE`,
      [userId, equipmentCode]
    );
    const inventoryRow = inventoryResult.rows[0];
    if (!inventoryRow || inventoryRow.quantity < 1) {
      throw new Error("보유한 장비가 없습니다.");
    }

    const currentEquippedResult = await client.query<PowerRankingEquippedRow>(
      `SELECT user_id, slot_code, equipment_code, equipped_at, updated_at
       FROM power_ranking_user_equipped
       WHERE user_id = $1
         AND slot_code = $2
       FOR UPDATE`,
      [userId, equipment.slot]
    );
    const currentEquipped = currentEquippedResult.rows[0];

    await client.query(
      `UPDATE power_ranking_user_equipment_inventory
       SET quantity = quantity - 1, updated_at = NOW()
       WHERE id = $1`,
      [inventoryRow.id]
    );

    if (currentEquipped) {
      await client.query(
        `INSERT INTO power_ranking_user_equipment_inventory (user_id, equipment_code, quantity)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id, equipment_code)
         DO UPDATE SET quantity = power_ranking_user_equipment_inventory.quantity + 1, updated_at = NOW()`,
        [userId, currentEquipped.equipment_code]
      );
    }

    await client.query(
      `INSERT INTO power_ranking_user_equipped (user_id, slot_code, equipment_code)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, slot_code)
       DO UPDATE SET equipment_code = EXCLUDED.equipment_code, updated_at = NOW(), equipped_at = NOW()`,
      [userId, equipment.slot, equipmentCode]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return listPowerRankingEquipmentState(userId);
};

export const unequipPowerRankingEquipment = async (
  userId: string,
  slot: PowerRankingEquipmentSlot
): Promise<PowerRankingEquipmentState> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const equippedResult = await client.query<PowerRankingEquippedRow>(
      `SELECT user_id, slot_code, equipment_code, equipped_at, updated_at
       FROM power_ranking_user_equipped
       WHERE user_id = $1
         AND slot_code = $2
       FOR UPDATE`,
      [userId, slot]
    );
    const equippedRow = equippedResult.rows[0];
    if (!equippedRow) {
      throw new Error("해제할 장비가 없습니다.");
    }

    await client.query(
      `INSERT INTO power_ranking_user_equipment_inventory (user_id, equipment_code, quantity)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, equipment_code)
       DO UPDATE SET quantity = power_ranking_user_equipment_inventory.quantity + 1, updated_at = NOW()`,
      [userId, equippedRow.equipment_code]
    );

    await client.query(
      `DELETE FROM power_ranking_user_equipped
       WHERE user_id = $1
         AND slot_code = $2`,
      [userId, slot]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return listPowerRankingEquipmentState(userId);
};

export const sellInventoryItem = async (
  userId: string,
  inventoryType: "equipment" | "consumable",
  code: string
): Promise<{ equipment: PowerRankingEquipmentState; consumables: PowerRankingInventoryItem[]; soldAmount: number }> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let soldAmount = 0;

    if (inventoryType === "equipment") {
      const equipment = powerRankingEquipmentCatalog[code];
      if (!equipment) {
        throw new Error("판매할 수 없는 장비입니다.");
      }
      const result = await client.query<PowerRankingEquipmentInventoryRow>(
        `SELECT id, quantity
         FROM power_ranking_user_equipment_inventory
         WHERE user_id = $1
           AND equipment_code = $2
         FOR UPDATE`,
        [userId, code]
      );
      const row = result.rows[0];
      if (!row || row.quantity <= 0) {
        throw new Error("보유한 장비가 없습니다.");
      }
      await client.query(
        `UPDATE power_ranking_user_equipment_inventory
         SET quantity = quantity - 1, updated_at = NOW()
         WHERE id = $1`,
        [row.id]
      );
      soldAmount = 80;
    } else {
      const item = powerRankingItemCatalog[code];
      if (!item) {
        throw new Error("판매할 수 없는 아이템입니다.");
      }
      const result = await client.query<PowerRankingUserItemRow>(
        `SELECT id, quantity
         FROM power_ranking_user_items
         WHERE user_id = $1
           AND item_code = $2
         FOR UPDATE`,
        [userId, code]
      );
      const row = result.rows[0];
      if (!row || row.quantity <= 0) {
        throw new Error("보유한 아이템이 없습니다.");
      }
      await client.query(
        `UPDATE power_ranking_user_items
         SET quantity = quantity - 1, updated_at = NOW()
         WHERE id = $1`,
        [row.id]
      );
      soldAmount = 40;
    }

    await client.query("COMMIT");

    return {
      equipment: await listPowerRankingEquipmentState(userId),
      consumables: await listPowerRankingInventoryByUserId(userId),
      soldAmount
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getHuntingProfile = async (
  userId: string,
  selectedCardId?: string,
  selectedCardLevel = 1
): Promise<HuntingProfile> => {
  const equipmentState = await listPowerRankingEquipmentState(userId);
  const equippedItems = Object.values(equipmentState.equipped);
  const recommendationCountResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM power_ranking_votes
     WHERE user_id = $1
       AND delta > 0`,
    [userId]
  );
  const recommendationCoefficient = Number(recommendationCountResult.rows[0]?.count ?? "0");
  const equippedCount = equippedItems.length;

  let setMultiplier = 1;
  if (equippedCount >= 6) {
    setMultiplier = 2;
  } else if (equippedCount >= 5) {
    setMultiplier = 1.8;
  } else if (equippedCount >= 4) {
    setMultiplier = 1.55;
  } else if (equippedCount >= 3) {
    setMultiplier = 1.35;
  } else if (equippedCount >= 2) {
    setMultiplier = 1.15;
  }

  const equippedWeapon = equipmentState.equipped.weapon ?? null;
  let weaponAttack = Math.max(90, 90 + Math.floor(recommendationCoefficient * 0.42));
  if (equippedWeapon?.code === "training-branch") {
    weaponAttack += 18;
  } else if (equippedWeapon?.code === "iron-pickaxe") {
    weaponAttack += 38;
  } else if (equippedWeapon?.code === "fallen-order-blade") {
    weaponAttack += 72;
  }
  let apparelPercentBonus = 0;
  let effectMultiplier = 1;
  let flatBonus = 0;
  let dropRateMultiplier = 1;
  let bossBonusRollRate = 0;
  let autoGrowthMultiplier = 1;
  let cardGrowthMultiplier = 1;
  let dailyClickLimit = 300;
  const effectBreakdown: string[] = [];

  for (const item of equippedItems) {
    switch (item.code) {
      case "crown-of-cheers":
        cardGrowthMultiplier += 0.08;
        effectBreakdown.push("환호의 왕관 카드 성장 x1.08");
        break;
      case "star-visor":
        cardGrowthMultiplier += 0.06;
        effectBreakdown.push("별빛 바이저 카드 성장 x1.06");
        break;
      case "mint-beret":
        dropRateMultiplier += 0.05;
        effectBreakdown.push("민트 베레모 드랍 x1.05");
        break;
      case "commander-jacket":
        apparelPercentBonus += 0.18;
        effectBreakdown.push("사령관 재킷 의상 피해 +18%");
        break;
      case "ribbon-cardigan":
        apparelPercentBonus += 0.08;
        dropRateMultiplier += 0.03;
        effectBreakdown.push("리본 가디건 의상 피해 +8%");
        break;
      case "golden-harness":
        flatBonus += 20;
        effectBreakdown.push("골든 하네스 +20");
        break;
      case "midnight-slacks":
        apparelPercentBonus += 0.22;
        effectBreakdown.push("미드나잇 슬랙스 의상 피해 +22%");
        break;
      case "wave-denim":
        flatBonus += 12;
        effectBreakdown.push("웨이브 데님 +12");
        break;
      case "aurora-skirt":
        apparelPercentBonus += 0.09;
        effectBreakdown.push("오로라 스커트 의상 피해 +9%");
        break;
      case "thunder-boots":
        autoGrowthMultiplier += 0.08;
        flatBonus += 2;
        effectBreakdown.push("썬더 부츠 자동 성장 x1.08");
        break;
      case "crystal-sneakers":
        autoGrowthMultiplier += 0.06;
        effectBreakdown.push("크리스털 스니커즈 자동 성장 x1.06");
        break;
      case "ember-heels":
        autoGrowthMultiplier += 0.05;
        flatBonus += 2;
        effectBreakdown.push("엠버 힐 자동 성장 x1.05");
        break;
      case "titan-gauntlet":
        flatBonus += 16;
        effectBreakdown.push("타이탄 건틀릿 +16");
        break;
      case "silk-gloves":
        effectBreakdown.push("실크 글러브 소비 아이템 위력 +10");
        break;
      case "pulse-gloves":
        dropRateMultiplier += 0.06;
        bossBonusRollRate += 0.08;
        effectBreakdown.push("펄스 글러브 보스 추가 롤 +8%");
        break;
      default:
        break;
    }
  }

  const apparelMultiplier = 1 + apparelPercentBonus;
  dropRateMultiplier = Math.min(dropRateMultiplier, 1.18);
  bossBonusRollRate = Math.min(bossBonusRollRate, 0.18);
  autoGrowthMultiplier = Math.min(autoGrowthMultiplier, 1.16);
  cardGrowthMultiplier = Math.min(cardGrowthMultiplier, 1.18);

  const selectedCard = selectedCardId ? getGameCardById(selectedCardId) : null;
  const cardLevelBonus = Math.max(0, selectedCardLevel - 1);
  if (selectedCard) {
    if (selectedCard.effectKind === "damage") {
      effectMultiplier += selectedCard.effectValue + cardLevelBonus * 0.01;
      effectBreakdown.unshift(`${selectedCard.name} 전투 x${effectMultiplier.toFixed(2)}`);
    } else if (selectedCard.effectKind === "drop") {
      dropRateMultiplier += selectedCard.effectValue + cardLevelBonus * 0.01;
      effectBreakdown.unshift(`${selectedCard.name} 드랍 x${dropRateMultiplier.toFixed(2)}`);
    } else if (selectedCard.effectKind === "click") {
      dailyClickLimit += Math.floor(selectedCard.effectValue + cardLevelBonus * 5);
      effectBreakdown.unshift(`${selectedCard.name} 오늘 클릭 +${Math.floor(selectedCard.effectValue + cardLevelBonus * 5)}`);
    } else if (selectedCard.effectKind === "popularity") {
      cardGrowthMultiplier += selectedCard.effectValue + cardLevelBonus * 0.03;
      effectBreakdown.unshift(`${selectedCard.name} 카드 성장 x${cardGrowthMultiplier.toFixed(2)}`);
    }
  }

  dropRateMultiplier = Math.min(dropRateMultiplier, 1.32);
  cardGrowthMultiplier = Math.min(cardGrowthMultiplier, 1.36);

  if (equippedCount >= 2) {
    effectBreakdown.unshift(`장비 세트 x${setMultiplier.toFixed(2)}`);
  }
  if (apparelPercentBonus > 0) {
    effectBreakdown.unshift(`상의/하의 합산 x${apparelMultiplier.toFixed(2)}`);
  }
  effectBreakdown.unshift(`자동 성장 배수 x${autoGrowthMultiplier.toFixed(2)}`);
  effectBreakdown.unshift(`카드 성장 배수 x${cardGrowthMultiplier.toFixed(2)}`);
  effectBreakdown.unshift(`무기 고정 공격력 ${weaponAttack}`);

  const battlePower = Math.max(
    1,
    Math.floor(weaponAttack * apparelMultiplier * setMultiplier * effectMultiplier + flatBonus)
  );

  return {
    recommendationCoefficient,
    weaponAttack,
    battlePower,
    apparelMultiplier,
    setMultiplier,
    effectMultiplier,
    flatBonus,
    dropRateMultiplier,
    bossBonusRollRate,
    autoGrowthMultiplier,
    cardGrowthMultiplier,
    dailyClickLimit,
    activeCardId: selectedCard?.id,
    activeCardName: selectedCard?.name,
    effectBreakdown,
    equipmentInventory: equipmentState.inventory,
    equippedItems: equipmentState.equipped
  };
};

export const listHuntingBattleRanking = async (): Promise<HuntingBattleRankingEntry[]> => {
  const usersResult = await pool.query<UserRow>(
    `SELECT id, username, password_hash, name, nickname, created_at, updated_at
     FROM app_users
     ORDER BY created_at ASC`
  );

  const profiles = await Promise.all(
    usersResult.rows.map(async (user) => {
      const profile = await getHuntingProfile(user.id);
      return {
        userId: user.id,
        username: user.username,
        name: user.name,
        nickname: user.nickname,
        battlePower: profile.battlePower,
        recommendationCoefficient: profile.recommendationCoefficient,
        weaponAttack: profile.weaponAttack,
        equippedCount: Object.keys(profile.equippedItems).length,
        apparelMultiplier: profile.apparelMultiplier,
        setMultiplier: profile.setMultiplier,
        updatedAt: user.updated_at
      };
    })
  );

  return profiles
    .sort((a, b) => {
      if (b.battlePower !== a.battlePower) {
        return b.battlePower - a.battlePower;
      }
      if (b.weaponAttack !== a.weaponAttack) {
        return b.weaponAttack - a.weaponAttack;
      }
      return a.nickname.localeCompare(b.nickname, "ko");
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
};

export const updatePowerRankingProfileImage = async (
  personId: string,
  profileImageUrl: string
): Promise<PowerRankingPerson | null> => {
  const result = await pool.query<PowerRankingPersonRow>(
    `UPDATE power_ranking_people
     SET profile_image_url = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, profile_image_url, score, created_at, updated_at`,
    [personId, profileImageUrl]
  );
  if (!result.rows[0]) {
    return null;
  }
  return loadPowerRankingPersonByPeriod(personId, "all");
};

export const createPowerRankingNote = async (
  personId: string,
  content: string
): Promise<PowerRankingNote | null> => {
  const personResult = await pool.query<{ id: string }>(
    "SELECT id FROM power_ranking_people WHERE id = $1 LIMIT 1",
    [personId]
  );
  if (!personResult.rows[0]) {
    return null;
  }

  const result = await pool.query<PowerRankingNoteRow>(
    `INSERT INTO power_ranking_notes (person_id, content)
     VALUES ($1, $2)
     RETURNING id, person_id, content, created_at, updated_at`,
    [personId, content]
  );
  return mapPowerRankingNoteRow(result.rows[0]);
};

export const updatePowerRankingNote = async (
  noteId: string,
  content: string
): Promise<PowerRankingNote | null> => {
  const result = await pool.query<PowerRankingNoteRow>(
    `UPDATE power_ranking_notes
     SET content = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, person_id, content, created_at, updated_at`,
    [noteId, content]
  );
  return result.rows[0] ? mapPowerRankingNoteRow(result.rows[0]) : null;
};

export const deletePowerRankingNote = async (noteId: string): Promise<boolean> => {
  const result = await pool.query("DELETE FROM power_ranking_notes WHERE id = $1", [noteId]);
  return (result.rowCount ?? 0) > 0;
};

export const createUserAccount = async (
  username: string,
  passwordHash: string,
  name: string,
  nickname: string
): Promise<UserProfile> => {
  const result = await pool.query<UserRow>(
    `INSERT INTO app_users (username, password_hash, name, nickname)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, password_hash, name, nickname, created_at, updated_at`,
    [username, passwordHash, name, nickname]
  );
  return mapUserRow(result.rows[0]);
};

export const findUserByUsername = async (username: string): Promise<UserRow | null> => {
  const result = await pool.query<UserRow>(
    `SELECT id, username, password_hash, name, nickname, created_at, updated_at
     FROM app_users
     WHERE username = $1
     LIMIT 1`,
    [username]
  );
  return result.rows[0] ?? null;
};

export const findUserById = async (userId: string): Promise<UserProfile | null> => {
  const result = await pool.query<UserRow>(
    `SELECT id, username, password_hash, name, nickname, created_at, updated_at
     FROM app_users
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
};

export const createUserSession = async (
  userId: string,
  deviceId: string,
  refreshTokenHash: string,
  expiresAt: Date
): Promise<UserSessionRow> => {
  const result = await pool.query<UserSessionRow>(
    `INSERT INTO app_user_sessions (user_id, device_id, refresh_token_hash, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, device_id, refresh_token_hash, expires_at, created_at, updated_at, last_used_at`,
    [userId, deviceId, refreshTokenHash, expiresAt.toISOString()]
  );
  return result.rows[0];
};

export const findUserSessionByRefreshToken = async (
  refreshTokenHash: string
): Promise<UserSessionRow | null> => {
  const result = await pool.query<UserSessionRow>(
    `SELECT id, user_id, device_id, refresh_token_hash, expires_at, created_at, updated_at, last_used_at
     FROM app_user_sessions
     WHERE refresh_token_hash = $1
       AND expires_at > NOW()
     LIMIT 1`,
    [refreshTokenHash]
  );
  return result.rows[0] ?? null;
};

export const findUserSessionById = async (sessionId: string): Promise<UserSessionRow | null> => {
  const result = await pool.query<UserSessionRow>(
    `SELECT id, user_id, device_id, refresh_token_hash, expires_at, created_at, updated_at, last_used_at
     FROM app_user_sessions
     WHERE id = $1
       AND expires_at > NOW()
     LIMIT 1`,
    [sessionId]
  );
  return result.rows[0] ?? null;
};

export const rotateUserSessionRefreshToken = async (
  sessionId: string,
  refreshTokenHash: string,
  expiresAt: Date
): Promise<UserSessionRow | null> => {
  const result = await pool.query<UserSessionRow>(
    `UPDATE app_user_sessions
     SET refresh_token_hash = $2, expires_at = $3, updated_at = NOW(), last_used_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, device_id, refresh_token_hash, expires_at, created_at, updated_at, last_used_at`,
    [sessionId, refreshTokenHash, expiresAt.toISOString()]
  );
  return result.rows[0] ?? null;
};

export const touchUserSession = async (sessionId: string): Promise<void> => {
  await pool.query(
    `UPDATE app_user_sessions
     SET last_used_at = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [sessionId]
  );
};

export const deleteUserSessionByRefreshToken = async (refreshTokenHash: string): Promise<void> => {
  await pool.query(`DELETE FROM app_user_sessions WHERE refresh_token_hash = $1`, [refreshTokenHash]);
};

const getBoardPostRowById = async (postId: string): Promise<import("./types").BoardPostRow | null> => {
  const result = await pool.query<import("./types").BoardPostRow>(
    `SELECT id, author_name, password, title, content, file_url, file_name, file_size, file_mime_type, created_at, updated_at
     FROM board_posts
     WHERE id = $1
     LIMIT 1`,
    [postId]
  );
  return result.rows[0] ?? null;
};

const getBoardReplyRowById = async (replyId: string): Promise<BoardReplyRow | null> => {
  const result = await pool.query<BoardReplyRow>(
    `SELECT id, post_id, author_name, password, content, created_at, updated_at
     FROM board_replies
     WHERE id = $1
     LIMIT 1`,
    [replyId]
  );
  return result.rows[0] ?? null;
};

const loadBoardRepliesByPostIds = async (postIds: string[]): Promise<Map<string, BoardReply[]>> => {
  if (postIds.length === 0) {
    return new Map();
  }
  const result = await pool.query<BoardReplyRow>(
    `SELECT id, post_id, author_name, password, content, created_at, updated_at
     FROM board_replies
     WHERE post_id = ANY($1::uuid[])
     ORDER BY created_at ASC`,
    [postIds]
  );
  const repliesByPost = new Map<string, BoardReply[]>();
  for (const row of result.rows) {
    const reply = mapBoardReplyRow(row);
    const current = repliesByPost.get(reply.postId) ?? [];
    current.push(reply);
    repliesByPost.set(reply.postId, current);
  }
  return repliesByPost;
};

export const listBoardPosts = async (
  search = "",
  currentUserId?: string | null
): Promise<BoardPost[]> => {
  const keyword = search.trim();
  const postsResult = await pool.query<import("./types").BoardPostRow>(
    `SELECT
       p.id,
       p.user_id,
       p.author_name,
       p.password,
       p.title,
       p.content,
       p.file_url,
       p.file_name,
       p.file_size,
       p.file_mime_type,
       p.recommendation_count,
       EXISTS (
         SELECT 1
         FROM board_post_recommendations r
         WHERE r.post_id = p.id
           AND r.user_id = $2
       ) AS is_recommended_by_current_user,
       p.created_at,
       p.updated_at
     FROM board_posts p
     WHERE (
       $1 = ''
       OR p.title ILIKE '%' || $1 || '%'
       OR p.author_name ILIKE '%' || $1 || '%'
     )
     ORDER BY
       CASE
         WHEN p.recommendation_count >= 5
          AND p.created_at >= NOW() - INTERVAL '14 days'
         THEN 0
         ELSE 1
       END ASC,
       p.recommendation_count DESC,
       p.created_at DESC`,
    [keyword, currentUserId ?? null]
  );
  const repliesByPost = await loadBoardRepliesByPostIds(postsResult.rows.map((row) => row.id));
  return postsResult.rows.map((row) => ({
    ...mapBoardPostRow(row),
    replies: repliesByPost.get(row.id) ?? []
  }));
};

export const createBoardPost = async (
  userId: string,
  authorName: string,
  title: string,
  content: string,
  fileUrl = "",
  fileName = "",
  fileSize = 0,
  fileMimeType = ""
): Promise<BoardPost> => {
  const result = await pool.query<import("./types").BoardPostRow>(
    `INSERT INTO board_posts (
        user_id, author_name, password, title, content, file_url, file_name, file_size, file_mime_type, recommendation_count
     )
     VALUES ($1, $2, '', $3, $4, $5, $6, $7, $8, 0)
     RETURNING id, user_id, author_name, password, title, content, file_url, file_name, file_size, file_mime_type, recommendation_count, FALSE AS is_recommended_by_current_user, created_at, updated_at`,
    [userId, authorName, title, content, fileUrl, fileName, fileSize, fileMimeType]
  );
  return { ...mapBoardPostRow(result.rows[0]), replies: [] };
};

export const updateBoardPost = async (
  postId: string,
  userId: string,
  title: string,
  content: string
): Promise<BoardPost | null> => {
  const existing = await getBoardPostRowById(postId);
  if (!existing) {
    return null;
  }
  if (existing.user_id !== userId) {
    throw new Error("본인 게시글만 수정할 수 있습니다.");
  }
  const result = await pool.query<import("./types").BoardPostRow>(
    `UPDATE board_posts
     SET title = $2, content = $3, updated_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, author_name, password, title, content, file_url, file_name, file_size, file_mime_type, recommendation_count, FALSE AS is_recommended_by_current_user, created_at, updated_at`,
    [postId, title, content]
  );
  const repliesByPost = await loadBoardRepliesByPostIds([postId]);
  return {
    ...mapBoardPostRow(result.rows[0]),
    replies: repliesByPost.get(postId) ?? []
  };
};

export const deleteBoardPost = async (postId: string, userId: string): Promise<boolean> => {
  const existing = await getBoardPostRowById(postId);
  if (!existing) {
    return false;
  }
  if (existing.user_id !== userId) {
    throw new Error("본인 게시글만 삭제할 수 있습니다.");
  }
  const result = await pool.query("DELETE FROM board_posts WHERE id = $1", [postId]);
  return (result.rowCount ?? 0) > 0;
};

export const recommendBoardPost = async (
  postId: string,
  userId: string
): Promise<BoardPost | null> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const postResult = await client.query<BoardPostRow>(
      `SELECT id, user_id, author_name, password, title, content, file_url, file_name, file_size, file_mime_type, recommendation_count, created_at, updated_at
       FROM board_posts
       WHERE id = $1
       FOR UPDATE`,
      [postId]
    );
    const post = postResult.rows[0];
    if (!post) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `INSERT INTO board_post_recommendations (post_id, user_id)
       VALUES ($1, $2)`,
      [postId, userId]
    );
    const updatedResult = await client.query<BoardPostRow>(
      `UPDATE board_posts
       SET recommendation_count = recommendation_count + 1, updated_at = NOW()
       WHERE id = $1
       RETURNING id, user_id, author_name, password, title, content, file_url, file_name, file_size, file_mime_type, recommendation_count, TRUE AS is_recommended_by_current_user, created_at, updated_at`,
      [postId]
    );
    await client.query("COMMIT");
    const repliesByPost = await loadBoardRepliesByPostIds([postId]);
    return {
      ...mapBoardPostRow(updatedResult.rows[0]),
      replies: repliesByPost.get(postId) ?? []
    };
  } catch (error) {
    await client.query("ROLLBACK");
    if ((error as { code?: string }).code === "23505") {
      throw new Error("이미 개추한 게시글입니다.");
    }
    throw error;
  } finally {
    client.release();
  }
};

export const createBoardReply = async (
  postId: string,
  authorName: string,
  password: string,
  content: string
): Promise<BoardReply | null> => {
  const post = await getBoardPostRowById(postId);
  if (!post) {
    return null;
  }
  const result = await pool.query<BoardReplyRow>(
    `INSERT INTO board_replies (post_id, author_name, password, content)
     VALUES ($1, $2, $3, $4)
     RETURNING id, post_id, author_name, password, content, created_at, updated_at`,
    [postId, authorName, password, content]
  );
  return mapBoardReplyRow(result.rows[0]);
};

export const updateBoardReply = async (
  replyId: string,
  password: string,
  content: string
): Promise<BoardReply | null> => {
  const existing = await getBoardReplyRowById(replyId);
  if (!existing) {
    return null;
  }
  if (existing.password !== password) {
    throw passwordMismatchError();
  }
  const result = await pool.query<BoardReplyRow>(
    `UPDATE board_replies
     SET content = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, post_id, author_name, password, content, created_at, updated_at`,
    [replyId, content]
  );
  return mapBoardReplyRow(result.rows[0]);
};

export const deleteBoardReply = async (replyId: string, password: string): Promise<boolean> => {
  const existing = await getBoardReplyRowById(replyId);
  if (!existing) {
    return false;
  }
  if (existing.password !== password) {
    throw passwordMismatchError();
  }
  const result = await pool.query("DELETE FROM board_replies WHERE id = $1", [replyId]);
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

  return normalizeMainPageContent({
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
  });
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
      (
        inquiry_type, company, position, name, email, contact_number, requirements, consent,
        attachment_url, attachment_name, attachment_size, attachment_mime_type, status, is_read
      )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'in-review', FALSE)
     RETURNING id, inquiry_type, company, position, name, email, contact_number, requirements, consent,
               attachment_url, attachment_name, attachment_size, attachment_mime_type, status, is_read, created_at`,
    [
      payload.inquiryType,
      payload.company,
      payload.position,
      payload.name,
      payload.email,
      payload.contactNumber,
      payload.requirements,
      payload.consent,
      payload.attachmentUrl ?? "",
      payload.attachmentName ?? "",
      payload.attachmentSize ?? 0,
      payload.attachmentMimeType ?? ""
    ]
  );
  return mapInquiryRow(result.rows[0]);
};

export const listInquiries = async (): Promise<InquiryItem[]> => {
  const result = await pool.query<InquiryRow>(
    `SELECT id, inquiry_type, company, position, name, email, contact_number, requirements, consent,
            attachment_url, attachment_name, attachment_size, attachment_mime_type, status, is_read, created_at
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
     RETURNING id, inquiry_type, company, position, name, email, contact_number, requirements, consent,
               attachment_url, attachment_name, attachment_size, attachment_mime_type, status, is_read, created_at`,
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

export const trackTodayVisitor = async (
  deviceId: string,
  path: string
): Promise<TodayVisitorResponse> => {
  await pool.query(
    `INSERT INTO visitor_daily_visits (visit_date, device_id, first_path)
     VALUES (CURRENT_DATE, $1, $2)
     ON CONFLICT (visit_date, device_id)
     DO UPDATE SET last_visited_at = NOW()`,
    [deviceId, path]
  );
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM visitor_daily_visits
     WHERE visit_date = CURRENT_DATE`
  );
  return {
    todayVisitors: Number(result.rows[0]?.count ?? "0")
  };
};

export const getTodayVisitorCount = async (): Promise<TodayVisitorResponse> => {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM visitor_daily_visits
     WHERE visit_date = CURRENT_DATE`
  );
  return {
    todayVisitors: Number(result.rows[0]?.count ?? "0")
  };
};

export const getLiveVisitorSummary = async (windowMinutes = 5): Promise<LiveVisitorResponse> => {
  const result = await pool.query<{
    label: string | null;
    is_member: boolean;
    last_seen_at: string;
  }>(
    `SELECT
        COALESCE(session_user.nickname, '익명 유저') AS label,
        (session_user.nickname IS NOT NULL) AS is_member,
        visits.last_visited_at AS last_seen_at
      FROM visitor_daily_visits visits
      LEFT JOIN LATERAL (
        SELECT users.nickname
        FROM app_user_sessions sessions
        JOIN app_users users ON users.id = sessions.user_id
        WHERE sessions.device_id = visits.device_id
          AND sessions.expires_at > NOW()
        ORDER BY sessions.last_used_at DESC, sessions.updated_at DESC
        LIMIT 1
      ) AS session_user ON TRUE
      WHERE visits.visit_date = CURRENT_DATE
        AND visits.last_visited_at >= NOW() - make_interval(mins => $1::int)
      ORDER BY visits.last_visited_at DESC
      LIMIT 8`,
    [windowMinutes]
  );

  return {
    liveVisitors: result.rowCount ?? 0,
    windowMinutes,
    viewers: result.rows.map((row) => ({
      label: row.label?.trim() || "익명 유저",
      isMember: row.is_member,
      lastSeenAt: row.last_seen_at
    }))
  };
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};
