import { promises as fs } from "node:fs";
import path from "node:path";

type UploadKind = "inquiry" | "resource";

export interface StoredUploadFile {
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}

const parseBytes = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");
const inquiryMaxBytes = parseBytes(process.env.MAX_INQUIRY_FILE_BYTES, 10 * 1024 * 1024);
const resourceMaxBytes = parseBytes(process.env.MAX_RESOURCE_FILE_BYTES, 30 * 1024 * 1024);

const inquiryAllowedExt = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".zip"
]);

const resourceAllowedExt = new Set([...inquiryAllowedExt, ".hwp", ".txt", ".md"]);

const sanitizeFileName = (filename: string): string =>
  path
    .basename(filename || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");

const getExtension = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  return ext || "";
};

const randomKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getMaxBytes = (kind: UploadKind) => (kind === "inquiry" ? inquiryMaxBytes : resourceMaxBytes);
const getAllowedExtSet = (kind: UploadKind) => (kind === "inquiry" ? inquiryAllowedExt : resourceAllowedExt);

export const getUploadRoot = () => uploadRoot;
export const getUploadMaxBytes = (kind: UploadKind) => getMaxBytes(kind);

export const storeUploadFile = async (
  kind: UploadKind,
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<StoredUploadFile> => {
  const maxBytes = getMaxBytes(kind);
  const safeOriginal = sanitizeFileName(originalName);
  const ext = getExtension(safeOriginal);
  const allowExt = getAllowedExtSet(kind);

  if (!ext || !allowExt.has(ext)) {
    throw new Error(`Unsupported file extension: ${ext || "(none)"}`);
  }
  if (!fileBuffer.length) {
    throw new Error("File is empty");
  }
  if (fileBuffer.length > maxBytes) {
    throw new Error(`File is too large. Max allowed bytes: ${maxBytes}`);
  }

  const dir = path.join(uploadRoot, kind);
  await fs.mkdir(dir, { recursive: true });

  const storedName = `${randomKey()}${ext}`;
  const fullPath = path.join(dir, storedName);
  await fs.writeFile(fullPath, fileBuffer);

  return {
    url: `/api/files/${kind}/${storedName}`,
    originalName: safeOriginal,
    size: fileBuffer.length,
    mimeType: mimeType || "application/octet-stream"
  };
};
