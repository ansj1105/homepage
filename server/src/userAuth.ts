import crypto from "node:crypto";

const secret = process.env.USER_TOKEN_SECRET ?? "replace-user-token-secret";
const accessLifetimeMs = 1000 * 60 * 15;
const refreshLifetimeMs = 1000 * 60 * 60 * 24 * 30;

const base64UrlEncode = (value: string): string =>
  Buffer.from(value, "utf8").toString("base64url");

const base64UrlDecode = (value: string): string =>
  Buffer.from(value, "base64url").toString("utf8");

const sign = (payload: string): string =>
  crypto.createHmac("sha256", secret).update(payload).digest("base64url");

const createSignedToken = (payload: object): string => {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
};

export const createUserAccessToken = (userId: string, sessionId: string): string =>
  createSignedToken({
    sub: userId,
    sid: sessionId,
    kind: "user_access",
    exp: Date.now() + accessLifetimeMs
  });

export const verifyUserAccessToken = (
  token: string
): { sub: string; sid: string; kind: "user_access"; exp: number } | null => {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || sign(encoded) !== signature) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encoded)) as {
      sub: string;
      sid: string;
      kind: "user_access";
      exp: number;
    };

    if (
      parsed.kind !== "user_access" ||
      typeof parsed.sub !== "string" ||
      typeof parsed.sid !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp < Date.now()
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const createRefreshToken = (): string => crypto.randomBytes(32).toString("base64url");
export const hashRefreshToken = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");

export const getRefreshLifetimeMs = (): number => refreshLifetimeMs;
export const getAccessLifetimeMs = (): number => accessLifetimeMs;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key.toString("hex"));
    });
  });

  return `${salt}:${derived}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const [salt, original] = storedHash.split(":");
  if (!salt || !original) {
    return false;
  }

  const derived = await new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key.toString("hex"));
    });
  });

  return crypto.timingSafeEqual(Buffer.from(original, "hex"), Buffer.from(derived, "hex"));
};
