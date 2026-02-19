import { describe, expect, it } from "vitest";
import { initialSiteContent } from "../../src/data/siteData";
import {
  parseInquiryCreate,
  parseInquiryStatus,
  parseLogin,
  parseNoticeUpsert,
  parseResourceUpsert,
  parseSiteContent
} from "./validators";

describe("validators", () => {
  it("parses login payload", () => {
    const payload = parseLogin({ username: "admin", password: "secret" });
    expect(payload.username).toBe("admin");
  });

  it("rejects invalid login", () => {
    expect(() => parseLogin({ username: "", password: "" })).toThrow();
  });

  it("parses site content payload", () => {
    const parsed = parseSiteContent(initialSiteContent);
    expect(parsed.heroSlides.length).toBeGreaterThan(0);
  });

  it("parses resource payload", () => {
    const parsed = parseResourceUpsert({ title: "Catalog", type: "Catalog" });
    expect(parsed.type).toBe("Catalog");
  });

  it("parses notice payload", () => {
    const parsed = parseNoticeUpsert({ title: "Notice", publishedAt: "2026-02-19" });
    expect(parsed.publishedAt).toBe("2026-02-19");
  });

  it("parses inquiry payload and status", () => {
    const inquiry = parseInquiryCreate({
      company: "ACME",
      position: "Manager",
      name: "John",
      email: "john@example.com",
      contactNumber: "010-1111-2222",
      requirements: "Need quote",
      consent: true
    });
    const status = parseInquiryStatus({ status: "in-review" });
    expect(inquiry.company).toBe("ACME");
    expect(status.status).toBe("in-review");
  });

  it("rejects inquiry without consent", () => {
    expect(() =>
      parseInquiryCreate({
        company: "ACME",
        name: "John",
        email: "john@example.com",
        consent: false
      })
    ).toThrow();
  });
});
