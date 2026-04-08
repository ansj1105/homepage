import { describe, expect, it } from "vitest";
import {
  createUserAccessToken,
  hashRefreshToken,
  verifyPassword,
  verifyUserAccessToken,
  hashPassword
} from "./userAuth";

describe("user auth", () => {
  it("creates and verifies access token", () => {
    const token = createUserAccessToken("user-1", "session-1");
    const parsed = verifyUserAccessToken(token);
    expect(parsed?.sub).toBe("user-1");
    expect(parsed?.sid).toBe("session-1");
  });

  it("hashes and verifies password", async () => {
    const hashed = await hashPassword("password123");
    await expect(verifyPassword("password123", hashed)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hashed)).resolves.toBe(false);
  });

  it("hashes refresh token deterministically", () => {
    expect(hashRefreshToken("token")).toBe(hashRefreshToken("token"));
  });
});
