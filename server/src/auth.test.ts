import { describe, expect, it } from "vitest";
import { createToken, verifyToken } from "./auth";

describe("auth token", () => {
  it("creates and verifies token", () => {
    const token = createToken("admin");
    const parsed = verifyToken(token);
    expect(parsed?.sub).toBe("admin");
    expect(typeof parsed?.exp).toBe("number");
  });

  it("rejects tampered token", () => {
    const token = createToken("admin");
    const tampered = `${token}x`;
    expect(verifyToken(tampered)).toBeNull();
  });
});
