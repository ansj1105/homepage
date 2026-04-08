import { describe, expect, it } from "vitest";
import { initialSiteContent } from "../../src/data/siteData";
import {
  parseInquiryCreate,
  parseInquiryStatus,
  parseLogin,
  parseNoticeUpsert,
  parsePowerRankingEquip,
  parsePowerRankingItemUse,
  parseTodayVisitor,
  parseResourceUpsert,
  parseSiteContent,
  parseUserLogin,
  parseUserSignup
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
      inquiryType: "quote",
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
        inquiryType: "quote",
        name: "John",
        email: "john@example.com",
        consent: false
      })
    ).toThrow();
  });

  it("parses user auth payloads", () => {
    const signup = parseUserSignup({
      username: "tester01",
      password: "password123",
      name: "테스터",
      nickname: "테스트닉"
    });
    const login = parseUserLogin({
      username: "tester01",
      password: "password123"
    });
    expect(signup.nickname).toBe("테스트닉");
    expect(login.username).toBe("tester01");
  });

  it("parses power ranking item use payload", () => {
    const parsed = parsePowerRankingItemUse({
      personId: "11111111-1111-1111-1111-111111111111",
      itemCode: "byeokbangjun-blanket",
      period: "weekly"
    });
    expect(parsed.itemCode).toBe("byeokbangjun-blanket");
    expect(parsed.period).toBe("weekly");
  });

  it("parses power ranking equipment payload", () => {
    const parsed = parsePowerRankingEquip({
      equipmentCode: "crown-of-cheers"
    });
    expect(parsed.equipmentCode).toBe("crown-of-cheers");
  });

  it("parses today visitor payload", () => {
    const parsed = parseTodayVisitor({
      deviceId: "device-123456789012",
      path: "/dongyeon-power-ranking"
    });
    expect(parsed.path).toBe("/dongyeon-power-ranking");
  });
});
