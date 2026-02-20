import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { createToken, verifyToken } from "./auth";
import {
  createCmsPage,
  createInquiry,
  createNotice,
  createResource,
  countUnreadInquiries,
  deleteCmsPage,
  deleteNotice,
  deleteResource,
  getCmsPageBySlug,
  getMainPageContent,
  getPublicSiteSettings,
  getContent,
  listCmsPages,
  listInquiries,
  markAllInquiriesAsRead,
  saveMainPageContent,
  savePublicSiteSettings,
  listNotices,
  listResources,
  saveContent,
  updateInquiryStatus,
  updateCmsPage,
  updateNotice,
  updateResource
} from "./db";
import { getUploadMaxBytes, getUploadRoot, storeUploadFile } from "./uploads";
import {
  parseCmsPageUpsert,
  parseInquiryCreate,
  parseInquiryStatus,
  parseLogin,
  parseMainPageUpsert,
  parseNoticeUpsert,
  parsePublicSiteSettingsUpsert,
  parseResourceUpsert,
  parseSiteContent
} from "./validators";

const adminUser = process.env.ADMIN_USERNAME ?? "admin";
const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me";

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

const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
};

const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const origin = process.env.CORS_ORIGIN ?? "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-File-Name, X-File-Type"
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

  app.post("/api/auth/login", (req, res) => {
    const payload = parseLogin(req.body);
    if (payload.username !== adminUser || payload.password !== adminPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    res.json({ token: createToken(payload.username) });
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
