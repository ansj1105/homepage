import { describe, expect, it } from "vitest";
import type { Product } from "../types";
import { filterProducts } from "./filterProducts";

const sampleProducts: Product[] = [
  {
    id: "p1",
    name: "Fiber Laser FL-1000",
    category: "Laser",
    manufacturer: "TRUMPF",
    wavelengthNm: "1064",
    powerW: 1000,
    interface: "EtherCAT",
    benefit: "고출력",
    datasheetUrl: "#",
    cadUrl: "#"
  },
  {
    id: "p2",
    name: "Vision Metrology MV-7",
    category: "Metrology",
    manufacturer: "Allied Vision",
    wavelengthNm: "450-850",
    powerW: 12,
    interface: "GigE",
    benefit: "정밀 측정",
    datasheetUrl: "#",
    cadUrl: "#"
  },
  {
    id: "p3",
    name: "Beam Shaping Module",
    category: "Shaping",
    manufacturer: "Altechna",
    wavelengthNm: "515-1064",
    powerW: 200,
    interface: "Manual",
    benefit: "균일도 개선",
    datasheetUrl: "#",
    cadUrl: "#"
  }
];

describe("filterProducts", () => {
  it("검색어 기준으로 필터링한다", () => {
    const filtered = filterProducts(sampleProducts, { search: "metrology" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("p2");
  });

  it("최소 출력 기준으로 필터링한다", () => {
    const filtered = filterProducts(sampleProducts, { minPowerW: 300 });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("p1");
  });

  it("최대 파장 기준으로 필터링한다", () => {
    const filtered = filterProducts(sampleProducts, { maxWavelengthNm: 500 });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("p2");
  });
});
