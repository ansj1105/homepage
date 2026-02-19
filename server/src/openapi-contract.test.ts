import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("openapi contract", () => {
  it("contains required paths", () => {
    const specPath = path.resolve(process.cwd(), "docs", "openapi.yaml");
    const content = readFileSync(specPath, "utf8");
    expect(content).toContain("/api/auth/login");
    expect(content).toContain("/api/content");
    expect(content).toContain("/api/admin/content");
    expect(content).toContain("/api/inquiries");
    expect(content).toContain("/api/admin/inquiries/{id}/status");
  });
});
