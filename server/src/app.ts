import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { getPowerRankingEquipmentEnhancePreview } from "../../src/data/powerRankingEquipment";
import { shopCatalog } from "../../src/data/shopCatalog";
import { huntingZones } from "../../src/data/huntingZones";
import { createToken, verifyToken } from "./auth";
import {
  clickCombat,
  getCombatState,
  getHuntingZoneDetail,
  getHuntingZoneDrops,
  listHuntingZones,
  useCombatConsumable
} from "./huntingCombat";
import {
  createUserAccount,
  createUserSession,
  createCmsPage,
  createBoardPost,
  createBoardReply,
  createInquiry,
  createNotice,
  createPowerRankingNote,
  createResource,
  countUnreadInquiries,
  deleteBoardPost,
  deleteBoardReply,
  deleteCmsPage,
  deleteNotice,
  deletePowerRankingNote,
  deleteResource,
  deleteUserSessionByRefreshToken,
  findUserById,
  findUserByUsername,
  findUserSessionById,
  findUserSessionByRefreshToken,
  getCmsPageBySlug,
  getMainPageContent,
  getPublicSiteSettings,
  getContent,
  changePowerRankingScore,
  equipPowerRankingEquipment,
  getHuntingProfile,
  listHuntingBattleRanking,
  listPowerRankingEquipmentState,
  listPowerRankingEventLogs,
  listPowerRankingInventory,
  listBoardPosts,
  listCmsPages,
  listInquiries,
  listPowerRankingPeople,
  markAllInquiriesAsRead,
  saveMainPageContent,
  savePublicSiteSettings,
  listNotices,
  listResources,
  saveContent,
  recommendBoardPost,
  trackTodayVisitor,
  getTodayVisitorCount,
  updateBoardPost,
  updateBoardReply,
  updatePowerRankingNote,
  updateInquiryStatus,
  updateCmsPage,
  updateNotice,
  updatePowerRankingProfileImage,
  updateResource,
  rotateUserSessionRefreshToken,
  sellInventoryItem,
  touchUserSession,
  unequipPowerRankingEquipment,
  usePowerRankingItem
} from "./db";
import { getUploadMaxBytes, getUploadRoot, storeUploadFile } from "./uploads";
import {
  parseCmsPageUpsert,
  parseBoardPostCreate,
  parseBoardPostUpdate,
  parseBoardReplyCreate,
  parseBoardReplyDelete,
  parseBoardReplyUpdate,
  parseCardSelect,
  parseCardUpgrade,
  parseEquipmentEnhance,
  parseEquipmentUnequip,
  parseHuntingCombatClick,
  parseHuntingCombatConsumable,
  parseInquiryCreate,
  parseInquiryStatus,
  parseItemSell,
  parseLogin,
  parseMainPageUpsert,
  parseNoticeUpsert,
  parsePowerRankingEquip,
  parsePowerRankingItemUse,
  parsePowerRankingNoteCreate,
  parsePowerRankingNoteUpdate,
  parsePowerRankingVoteAction,
  parseShopBuy,
  parseTodayVisitor,
  parsePublicSiteSettingsUpsert,
  parseResourceUpsert,
  parseSiteContent,
  parseUserLogin,
  parseUserSignup
} from "./validators";
import {
  createRefreshToken,
  createUserAccessToken,
  getAccessLifetimeMs,
  getRefreshLifetimeMs,
  hashPassword,
  hashRefreshToken,
  verifyPassword,
  verifyUserAccessToken
} from "./userAuth";

const adminUser = process.env.ADMIN_USERNAME ?? "admin";
const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me";
const accessCookieName = "user_access_token";
const refreshCookieName = "user_refresh_token";

const getTokenFromRequest = (req: Request): string | null => {
  const header = req.header("authorization");
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
};

const getParamValue = (value: string | string[] | undefined): string => {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return "";
};

const getPowerRankingPeriod = (value: unknown): "all" | "weekly" | "daily" => {
  if (value === "daily" || value === "weekly") {
    return value;
  }
  return "all";
};

const getRequestDeviceId = (req: Request): string =>
  (req.header("x-device-id") ?? "").trim();

const parseCookies = (req: Request): Record<string, string> =>
  (req.header("cookie") ?? "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, pair) => {
      const separatorIndex = pair.indexOf("=");
      if (separatorIndex === -1) {
        return accumulator;
      }
      const key = pair.slice(0, separatorIndex).trim();
      const value = pair.slice(separatorIndex + 1).trim();
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});

const appendCookie = (
  res: Response,
  name: string,
  value: string,
  maxAgeMs: number,
  options?: { clear?: boolean }
) => {
  const parts = [
    `${name}=${options?.clear ? "" : encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    options?.clear ? "Max-Age=0" : `Max-Age=${Math.floor(maxAgeMs / 1000)}`
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  res.append("Set-Cookie", parts.join("; "));
};

const setUserAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  appendCookie(res, accessCookieName, accessToken, getAccessLifetimeMs());
  appendCookie(res, refreshCookieName, refreshToken, getRefreshLifetimeMs());
};

const clearUserAuthCookies = (res: Response) => {
  appendCookie(res, accessCookieName, "", 0, { clear: true });
  appendCookie(res, refreshCookieName, "", 0, { clear: true });
};

const resolveAuthenticatedUser = async (req: Request) => {
  const cookies = parseCookies(req);
  const accessToken = cookies[accessCookieName];
  if (!accessToken) {
    return null;
  }
  const payload = verifyUserAccessToken(accessToken);
  if (!payload) {
    return null;
  }
  const session = await findUserSessionById(payload.sid);
  if (!session || session.user_id !== payload.sub || session.device_id !== getRequestDeviceId(req)) {
    return null;
  }
  await touchUserSession(payload.sid);
  return findUserById(payload.sub);
};

const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
};

const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const configuredOrigin = process.env.CORS_ORIGIN ?? "*";
  const requestOrigin = req.header("origin");
  const resolvedOrigin =
    configuredOrigin === "*" && requestOrigin ? requestOrigin : configuredOrigin;
  res.header("Access-Control-Allow-Origin", resolvedOrigin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-File-Name, X-File-Type, X-Device-Id"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
};

const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({ message: "Invalid payload", issues: err.issues });
    return;
  }
  if (err instanceof Error) {
    if ((err as Error & { message?: string; code?: string }).code === "23505") {
      res.status(409).json({ message: "이미 사용 중인 아이디 또는 닉네임입니다." });
      return;
    }
    if ((err as Error & { name?: string }).name === "PayloadTooLargeError") {
      res.status(413).json({ message: "Uploaded file is too large." });
      return;
    }
    if (err.message.includes("File is too large")) {
      res.status(413).json({ message: err.message });
      return;
    }
    if (
      err.message.includes("Unsupported file extension") ||
      err.message.includes("File is empty")
    ) {
      res.status(400).json({ message: err.message });
      return;
    }
    if (err.message === "Invalid password") {
      res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
      return;
    }
    res.status(500).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: "Unknown error" });
};

export const createApp = () => {
  const app = express();
  app.use(corsMiddleware);
  app.use("/api/files", express.static(getUploadRoot()));
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/visitors/today", async (_req, res, next) => {
    try {
      const result = await getTodayVisitorCount();
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/visitors/track", async (req, res, next) => {
    try {
      const payload = parseTodayVisitor(req.body);
      const result = await trackTodayVisitor(payload.deviceId, payload.path);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const payload = parseLogin(req.body);
    if (payload.username !== adminUser || payload.password !== adminPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    res.json({ token: createToken(payload.username) });
  });

  app.post("/api/users/signup", async (req, res, next) => {
    try {
      const payload = parseUserSignup(req.body);
      const deviceId = getRequestDeviceId(req);
      if (!deviceId) {
        res.status(400).json({ message: "Device ID is required" });
        return;
      }

      const passwordHash = await hashPassword(payload.password);
      const user = await createUserAccount(
        payload.username.trim(),
        passwordHash,
        payload.name.trim(),
        payload.nickname.trim()
      );

      const refreshToken = createRefreshToken();
      const refreshTokenHash = hashRefreshToken(refreshToken);
      const session = await createUserSession(
        user.id,
        deviceId,
        refreshTokenHash,
        new Date(Date.now() + getRefreshLifetimeMs())
      );
      const accessToken = createUserAccessToken(user.id, session.id);
      setUserAuthCookies(res, accessToken, refreshToken);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users/login", async (req, res, next) => {
    try {
      const payload = parseUserLogin(req.body);
      const deviceId = getRequestDeviceId(req);
      if (!deviceId) {
        res.status(400).json({ message: "Device ID is required" });
        return;
      }

      const userRow = await findUserByUsername(payload.username.trim());
      if (!userRow || !(await verifyPassword(payload.password, userRow.password_hash))) {
        res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
        return;
      }

      const user = await findUserById(userRow.id);
      if (!user) {
        res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        return;
      }

      const refreshToken = createRefreshToken();
      const refreshTokenHash = hashRefreshToken(refreshToken);
      const session = await createUserSession(
        user.id,
        deviceId,
        refreshTokenHash,
        new Date(Date.now() + getRefreshLifetimeMs())
      );
      const accessToken = createUserAccessToken(user.id, session.id);
      setUserAuthCookies(res, accessToken, refreshToken);
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/me", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users/refresh", async (req, res, next) => {
    try {
      const deviceId = getRequestDeviceId(req);
      const cookies = parseCookies(req);
      const refreshToken = cookies[refreshCookieName];
      if (!refreshToken || !deviceId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const session = await findUserSessionByRefreshToken(hashRefreshToken(refreshToken));
      if (!session || session.device_id !== deviceId) {
        clearUserAuthCookies(res);
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await findUserById(session.user_id);
      if (!user) {
        clearUserAuthCookies(res);
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const nextRefreshToken = createRefreshToken();
      const rotated = await rotateUserSessionRefreshToken(
        session.id,
        hashRefreshToken(nextRefreshToken),
        new Date(Date.now() + getRefreshLifetimeMs())
      );
      if (!rotated) {
        clearUserAuthCookies(res);
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const accessToken = createUserAccessToken(user.id, rotated.id);
      setUserAuthCookies(res, accessToken, nextRefreshToken);
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users/logout", async (req, res, next) => {
    try {
      const cookies = parseCookies(req);
      const refreshToken = cookies[refreshCookieName];
      if (refreshToken) {
        await deleteUserSessionByRefreshToken(hashRefreshToken(refreshToken));
      }
      clearUserAuthCookies(res);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/content", async (_req, res, next) => {
    try {
      const content = await getContent();
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/settings/public", async (_req, res, next) => {
    try {
      const settings = await getPublicSiteSettings();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/main-page", async (_req, res, next) => {
    try {
      const content = await getMainPageContent();
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/power-ranking", async (req, res, next) => {
    try {
      const people = await listPowerRankingPeople(getPowerRankingPeriod(req.query.period));
      res.json(people);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/power-ranking/inventory", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const items = await listPowerRankingInventory(user.id);
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/power-ranking/equipment", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const equipment = await listPowerRankingEquipmentState(user.id);
      res.json(equipment);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/power-ranking/events", async (_req, res, next) => {
    try {
      const events = await listPowerRankingEventLogs(60);
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/game/home", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }

      const [huntingProfile, equipment, inventory, cards] = await Promise.all([
        getHuntingProfile(user.id),
        listPowerRankingEquipmentState(user.id),
        listPowerRankingInventory(user.id),
        listPowerRankingPeople("all")
      ]);

      res.json({
        user,
        huntingProfile,
        equipment,
        inventory,
        cards: cards.slice(0, 8)
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/user/resources", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const inventory = await listPowerRankingInventory(user.id);
      res.json(inventory);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/user/equipment", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const equipment = await listPowerRankingEquipmentState(user.id);
      res.json(equipment);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/user/cards", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const cards = await listPowerRankingPeople("all");
      res.json(cards.slice(0, 8));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/hunting/stage-1", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const profile = await getHuntingProfile(user.id);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/hunting/ranking", async (_req, res, next) => {
    try {
      const ranking = await listHuntingBattleRanking();
      res.json(ranking);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/inventory", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const [equipment, consumables] = await Promise.all([
        listPowerRankingEquipmentState(user.id),
        listPowerRankingInventory(user.id)
      ]);
      res.json({ equipment, consumables });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/cards", async (_req, res, next) => {
    try {
      const cards = await listPowerRankingPeople("all");
      res.json(
        cards.slice(0, 12).map((card, index) => ({
          id: card.id,
          name: card.name,
          popularity: card.score,
          rank: card.rank,
          imageUrl: card.profileImageUrl,
          grade: index < 1 ? "legendary" : index < 3 ? "epic" : index < 6 ? "rare" : "common",
          bonusSummary: index < 1 ? "선택 시 카드 성장 +12%" : index < 3 ? "선택 시 카드 성장 +8%" : "선택 시 카드 성장 +5%"
        }))
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/cards/select", async (req, res, next) => {
    try {
      const payload = parseCardSelect(req.body);
      const cards = await listPowerRankingPeople("all");
      const card = cards.find((item) => item.id === payload.cardId);
      if (!card) {
        res.status(404).json({ message: "선택할 카드가 없습니다." });
        return;
      }
      res.json({ selectedCardId: payload.cardId });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/cards/upgrade", async (req, res, next) => {
    try {
      const payload = parseCardUpgrade(req.body);
      res.json({ cardId: payload.cardId, pointCost: payload.pointCost, upgraded: true });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/shop/items", async (_req, res, next) => {
    try {
      res.json(shopCatalog);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/shop/buy", async (req, res, next) => {
    try {
      const payload = parseShopBuy(req.body);
      const item = shopCatalog.find((entry) => entry.id === payload.itemId);
      if (!item) {
        res.status(404).json({ message: "구매할 수 없는 아이템입니다." });
        return;
      }
      res.json({ item });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/collection/equipment", async (_req, res, next) => {
    try {
      const equipment = Object.values((await import("../../src/data/powerRankingEquipment")).powerRankingEquipmentCatalog);
      res.json(
        equipment.map((item) => ({
          code: item.code,
          name: item.name,
          slot: item.slot,
          imageUrl: item.imageUrl,
          effectSummary: item.effectSummary
        }))
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/collection/monsters", async (_req, res, next) => {
    try {
      res.json(
        huntingZones.flatMap((zone) =>
          zone.monsters.map((monster) => ({
            id: monster.id,
            name: monster.name,
            zoneName: zone.name,
            rarityLabel: monster.rarityLabel,
            imageUrl: monster.imageUrl
          }))
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/collection/sets", async (_req, res, next) => {
    try {
      res.json([
        {
          id: "set-2",
          name: "2세트 보너스",
          requirement: "장비 2부위 장착",
          bonusSummary: "세트 배수 x1.15"
        },
        {
          id: "set-3",
          name: "3세트 보너스",
          requirement: "장비 3부위 장착",
          bonusSummary: "세트 배수 x1.35"
        },
        {
          id: "set-5",
          name: "5세트 보너스",
          requirement: "장비 5부위 장착",
          bonusSummary: "세트 배수 x1.80"
        }
      ]);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/zones", async (_req, res, next) => {
    try {
      res.json(listHuntingZones());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/zones/:zoneId", async (req, res, next) => {
    try {
      res.json(getHuntingZoneDetail(getParamValue(req.params.zoneId)));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/zones/:zoneId/drops", async (req, res, next) => {
    try {
      res.json(getHuntingZoneDrops(getParamValue(req.params.zoneId)));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/combat/state", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const profile = await getHuntingProfile(user.id);
      res.json(
        getCombatState(
          user.id,
          profile,
          typeof req.query.zoneId === "string" ? req.query.zoneId : undefined,
          typeof req.query.monsterId === "string" ? req.query.monsterId : undefined
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/combat/click", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const payload = parseHuntingCombatClick(req.body);
      const profile = await getHuntingProfile(user.id);
      res.json(clickCombat(user.id, profile, payload.zoneId, payload.monsterId));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/combat/use-consumable", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const payload = parseHuntingCombatConsumable(req.body);
      const profile = await getHuntingProfile(user.id);
      res.json(useCombatConsumable(user.id, profile, payload));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/board/posts", async (_req, res, next) => {
    try {
      const currentUser = await resolveAuthenticatedUser(_req);
      const search = typeof _req.query.search === "string" ? _req.query.search : "";
      const posts = await listBoardPosts(search, currentUser?.id);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/board/posts", async (req, res, next) => {
    try {
      const currentUser = await resolveAuthenticatedUser(req);
      if (!currentUser) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const payload = parseBoardPostCreate(req.body);
      const created = await createBoardPost(
        currentUser.id,
        currentUser.nickname,
        payload.title,
        payload.content,
        payload.fileUrl ?? "",
        payload.fileName ?? "",
        payload.fileSize ?? 0,
        payload.fileMimeType ?? ""
      );
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/board/posts/:postId", async (req, res, next) => {
    try {
      const currentUser = await resolveAuthenticatedUser(req);
      if (!currentUser) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const postId = getParamValue(req.params.postId);
      const payload = parseBoardPostUpdate(req.body);
      const updated = await updateBoardPost(
        postId,
        currentUser.id,
        payload.title,
        payload.content
      );
      if (!updated) {
        res.status(404).json({ message: "Board post not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/board/posts/:postId", async (req, res, next) => {
    try {
      const currentUser = await resolveAuthenticatedUser(req);
      if (!currentUser) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const postId = getParamValue(req.params.postId);
      const deleted = await deleteBoardPost(postId, currentUser.id);
      if (!deleted) {
        res.status(404).json({ message: "Board post not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/board/posts/:postId/recommend", async (req, res, next) => {
    try {
      const currentUser = await resolveAuthenticatedUser(req);
      if (!currentUser) {
        res.status(401).json({ message: "로그인 이후 이용가능합니다." });
        return;
      }
      const postId = getParamValue(req.params.postId);
      const updated = await recommendBoardPost(postId, currentUser.id);
      if (!updated) {
        res.status(404).json({ message: "Board post not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/board/posts/:postId/replies", async (req, res, next) => {
    try {
      const postId = getParamValue(req.params.postId);
      const payload = parseBoardReplyCreate(req.body);
      const created = await createBoardReply(
        postId,
        payload.authorName,
        payload.password,
        payload.content
      );
      if (!created) {
        res.status(404).json({ message: "Board post not found" });
        return;
      }
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/board/replies/:replyId", async (req, res, next) => {
    try {
      const replyId = getParamValue(req.params.replyId);
      const payload = parseBoardReplyUpdate(req.body);
      const updated = await updateBoardReply(replyId, payload.password, payload.content);
      if (!updated) {
        res.status(404).json({ message: "Board reply not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/board/replies/:replyId", async (req, res, next) => {
    try {
      const replyId = getParamValue(req.params.replyId);
      const payload = parseBoardReplyDelete(req.body);
      const deleted = await deleteBoardReply(replyId, payload.password);
      if (!deleted) {
        res.status(404).json({ message: "Board reply not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/power-ranking/:personId/votes", async (req, res, next) => {
    try {
      const personId = getParamValue(req.params.personId);
      const payload = parsePowerRankingVoteAction(req.body);
      const deviceId = payload.deviceId || getRequestDeviceId(req);
      const currentUser = await resolveAuthenticatedUser(req);
      const updated = await changePowerRankingScore(
        personId,
        deviceId,
        payload.delta,
        payload.period,
        currentUser?.id
      );
      if (!updated) {
        res.status(404).json({ message: "Ranking target not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/power-ranking/items/use", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const payload = parsePowerRankingItemUse(req.body);
      const result = await usePowerRankingItem(
        user.id,
        getRequestDeviceId(req),
        payload.personId,
        payload.itemCode,
        payload.period
      );
      if (!result) {
        res.status(404).json({ message: "Ranking target not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/power-ranking/equipment/equip", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const payload = parsePowerRankingEquip(req.body);
      const equipment = await equipPowerRankingEquipment(user.id, payload.equipmentCode);
      res.json(equipment);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/equipment/equip", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const payload = parsePowerRankingEquip(req.body);
      res.json(await equipPowerRankingEquipment(user.id, payload.equipmentCode));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/equipment/unequip", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const payload = parseEquipmentUnequip(req.body);
      res.json(await unequipPowerRankingEquipment(user.id, payload.slot));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/items/use", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const payload = parsePowerRankingItemUse(req.body);
      const result = await usePowerRankingItem(
        user.id,
        getRequestDeviceId(req),
        payload.personId,
        payload.itemCode,
        payload.period
      );
      if (!result) {
        res.status(404).json({ message: "Ranking target not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/items/sell", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const payload = parseItemSell(req.body);
      res.json(await sellInventoryItem(user.id, payload.inventoryType, payload.code));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/equipment/:equipmentId/enhance-preview", async (req, res, next) => {
    try {
      const equipmentId = getParamValue(req.params.equipmentId);
      const currentLevel = Math.max(0, Math.min(10, Number(req.query.currentLevel ?? 0) || 0));
      const preview = getPowerRankingEquipmentEnhancePreview(equipmentId as never, currentLevel);
      if (!preview) {
        res.status(404).json({ message: "강화 가능한 다음 단계가 없습니다." });
        return;
      }
      res.json(preview);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/equipment/enhance", async (req, res, next) => {
    try {
      const user = await resolveAuthenticatedUser(req);
      if (!user) {
        res.status(401).json({ message: "회원가입 이후 이용가능합니다." });
        return;
      }
      const payload = parseEquipmentEnhance(req.body);
      const preview = getPowerRankingEquipmentEnhancePreview(payload.equipmentCode, payload.currentLevel);
      if (!preview) {
        res.status(404).json({ message: "강화 가능한 다음 단계가 없습니다." });
        return;
      }
      const success = Math.random() < preview.successRate;
      res.json({
        preview,
        success,
        nextLevel: success ? preview.nextLevel : payload.currentLevel
      });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/power-ranking/:personId/profile-image", async (req, res, next) => {
    try {
      const personId = getParamValue(req.params.personId);
      const payload = req.body as { profileImageUrl?: string };
      const updated = await updatePowerRankingProfileImage(personId, payload.profileImageUrl?.trim() ?? "");
      if (!updated) {
        res.status(404).json({ message: "Ranking target not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/power-ranking/:personId/profile-image", async (req, res, next) => {
    try {
      const personId = getParamValue(req.params.personId);
      const updated = await updatePowerRankingProfileImage(personId, "");
      if (!updated) {
        res.status(404).json({ message: "Ranking target not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/api/uploads/power-ranking-profile",
    express.raw({ type: "application/octet-stream", limit: getUploadMaxBytes("power-ranking-profile") }),
    async (req, res, next) => {
      try {
        const fileBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
        const fileName = decodeURIComponent(req.header("x-file-name") ?? "profile_image");
        const mimeType = req.header("x-file-type") ?? "application/octet-stream";
        const stored = await storeUploadFile("power-ranking-profile", fileBuffer, fileName, mimeType);
        res.status(201).json(stored);
      } catch (error) {
        next(error);
      }
    }
  );

  app.post("/api/power-ranking/:personId/notes", async (req, res, next) => {
    try {
      const personId = getParamValue(req.params.personId);
      const payload = parsePowerRankingNoteCreate(req.body);
      const created = await createPowerRankingNote(personId, payload.content);
      if (!created) {
        res.status(404).json({ message: "Ranking target not found" });
        return;
      }
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/power-ranking/notes/:noteId", async (req, res, next) => {
    try {
      const noteId = getParamValue(req.params.noteId);
      const payload = parsePowerRankingNoteUpdate(req.body);
      const updated = await updatePowerRankingNote(noteId, payload.content);
      if (!updated) {
        res.status(404).json({ message: "Memo not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/power-ranking/notes/:noteId", async (req, res, next) => {
    try {
      const noteId = getParamValue(req.params.noteId);
      const deleted = await deletePowerRankingNote(noteId);
      if (!deleted) {
        res.status(404).json({ message: "Memo not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/cms-pages/:slug", async (req, res, next) => {
    try {
      const slug = getParamValue(req.params.slug);
      const page = await getCmsPageBySlug(slug);
      if (!page) {
        res.status(404).json({ message: "CMS page not found" });
        return;
      }
      res.json(page);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/content", requireAdmin, async (req, res, next) => {
    try {
      const payload = parseSiteContent(req.body);
      const updated = await saveContent(payload);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/settings/public", requireAdmin, async (_req, res, next) => {
    try {
      const settings = await getPublicSiteSettings();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/settings/public", requireAdmin, async (req, res, next) => {
    try {
      const payload = parsePublicSiteSettingsUpsert(req.body);
      const updated = await savePublicSiteSettings(payload);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/main-page", requireAdmin, async (_req, res, next) => {
    try {
      const content = await getMainPageContent();
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/main-page", requireAdmin, async (req, res, next) => {
    try {
      const payload = parseMainPageUpsert(req.body);
      const updated = await saveMainPageContent(payload);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/cms-pages", requireAdmin, async (_req, res, next) => {
    try {
      const pages = await listCmsPages();
      res.json(pages);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/cms-pages", requireAdmin, async (req, res, next) => {
    try {
      const payload = parseCmsPageUpsert(req.body);
      const created = await createCmsPage(payload.slug, payload.title, payload.imageUrl, payload.markdown);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/cms-pages/:slug", requireAdmin, async (req, res, next) => {
    try {
      const slug = getParamValue(req.params.slug);
      const payload = parseCmsPageUpsert({ ...req.body, slug });
      const updated = await updateCmsPage(slug, payload.title, payload.imageUrl, payload.markdown);
      if (!updated) {
        res.status(404).json({ message: "CMS page not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/cms-pages/:slug", requireAdmin, async (req, res, next) => {
    try {
      const slug = getParamValue(req.params.slug);
      const deleted = await deleteCmsPage(slug);
      if (!deleted) {
        res.status(404).json({ message: "CMS page not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/resources", async (_req, res, next) => {
    try {
      const resources = await listResources();
      res.json(resources);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/resources", requireAdmin, async (req, res, next) => {
    try {
      const payload = parseResourceUpsert(req.body);
      const created = await createResource(payload.title, payload.type, payload.fileUrl, payload.markdown);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/resources/:id", requireAdmin, async (req, res, next) => {
    try {
      const payload = parseResourceUpsert(req.body);
      const id = getParamValue(req.params.id);
      const hit = await updateResource(id, payload.title, payload.type, payload.fileUrl, payload.markdown);
      if (!hit) {
        res.status(404).json({ message: "Resource not found" });
        return;
      }
      res.json(hit);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/resources/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = getParamValue(req.params.id);
      const deleted = await deleteResource(id);
      if (!deleted) {
        res.status(404).json({ message: "Resource not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/notices", async (_req, res, next) => {
    try {
      const notices = await listNotices();
      res.json(notices);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/notices", requireAdmin, async (req, res, next) => {
    try {
      const payload = parseNoticeUpsert(req.body);
      const created = await createNotice(payload.title, payload.publishedAt, payload.markdown);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/notices/:id", requireAdmin, async (req, res, next) => {
    try {
      const payload = parseNoticeUpsert(req.body);
      const id = getParamValue(req.params.id);
      const hit = await updateNotice(id, payload.title, payload.publishedAt, payload.markdown);
      if (!hit) {
        res.status(404).json({ message: "Notice not found" });
        return;
      }
      res.json(hit);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/notices/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = getParamValue(req.params.id);
      const deleted = await deleteNotice(id);
      if (!deleted) {
        res.status(404).json({ message: "Notice not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/inquiries", async (req, res, next) => {
    try {
      const payload = parseInquiryCreate(req.body);
      const created = await createInquiry(payload);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/api/uploads/inquiry",
    express.raw({ type: "application/octet-stream", limit: getUploadMaxBytes("inquiry") }),
    async (req, res, next) => {
      try {
        const fileBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
        const fileName = decodeURIComponent(req.header("x-file-name") ?? "inquiry_file");
        const mimeType = req.header("x-file-type") ?? "application/octet-stream";
        const stored = await storeUploadFile("inquiry", fileBuffer, fileName, mimeType);
        res.status(201).json(stored);
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    "/api/uploads/board",
    express.raw({ type: "application/octet-stream", limit: getUploadMaxBytes("board") }),
    async (req, res, next) => {
      try {
        const fileBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
        const fileName = decodeURIComponent(req.header("x-file-name") ?? "board_file");
        const mimeType = req.header("x-file-type") ?? "application/octet-stream";
        const stored = await storeUploadFile("board", fileBuffer, fileName, mimeType);
        res.status(201).json(stored);
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    "/api/admin/uploads/resource",
    requireAdmin,
    express.raw({ type: "application/octet-stream", limit: getUploadMaxBytes("resource") }),
    async (req, res, next) => {
      try {
        const fileBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
        const fileName = decodeURIComponent(req.header("x-file-name") ?? "resource_file");
        const mimeType = req.header("x-file-type") ?? "application/octet-stream";
        const stored = await storeUploadFile("resource", fileBuffer, fileName, mimeType);
        res.status(201).json(stored);
      } catch (error) {
        next(error);
      }
    }
  );

  app.get("/api/admin/inquiries", requireAdmin, async (_req, res, next) => {
    try {
      const inquiries = await listInquiries();
      res.json(inquiries);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/inquiries/unread-count", requireAdmin, async (_req, res, next) => {
    try {
      const unreadCount = await countUnreadInquiries();
      res.json({ unreadCount });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/inquiries/read-all", requireAdmin, async (_req, res, next) => {
    try {
      const updatedCount = await markAllInquiriesAsRead();
      res.json({ updatedCount });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/inquiries/:id/status", requireAdmin, async (req, res, next) => {
    try {
      const payload = parseInquiryStatus(req.body);
      const id = getParamValue(req.params.id);
      const hit = await updateInquiryStatus(id, payload.status);
      if (!hit) {
        res.status(404).json({ message: "Inquiry not found" });
        return;
      }
      res.json(hit);
    } catch (error) {
      next(error);
    }
  });

  app.use(errorMiddleware);
  return app;
};
