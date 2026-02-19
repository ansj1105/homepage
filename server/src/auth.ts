import crypto from "node:crypto";

const secret = process.env.ADMIN_TOKEN_SECRET ?? "replace-this-in-production";

const base64UrlEncode = (value: string): string =>
  Buffer.from(value, "utf8").toString("base64url");

const base64UrlDecode = (value: string): string =>
  Buffer.from(value, "base64url").toString("utf8");

const sign = (payload: string): string =>
  crypto.createHmac("sha256", secret).update(payload).digest("base64url");

export const createToken = (username: string): string => {
  const exp = Date.now() + 1000 * 60 * 60 * 8;
  const body = JSON.stringify({ sub: username, exp });
  const encoded = base64UrlEncode(body);
  return `${encoded}.${sign(encoded)}`;
};

export const verifyToken = (token: string): { sub: string; exp: number } | null => {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }
  if (sign(encoded) !== signature) {
    return null;
  }
  try {
    const parsed = JSON.parse(base64UrlDecode(encoded)) as { sub: string; exp: number };
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) {
      return null;
    }
    if (typeof parsed.sub !== "string" || parsed.sub.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};
