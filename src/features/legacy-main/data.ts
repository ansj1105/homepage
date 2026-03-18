export interface LegacyMenuItem {
  id: string;
  label: string;
  href: string;
  target?: "_self" | "_blank";
  children?: LegacyMenuItem[];
}

export interface LegacyAppCard {
  id: string;
  label: string;
  imagePath?: string;
}

export const legacyHeroSlides = [
  "/assets/legacy/images/hero/main_011498524747.jpg",
  "/assets/legacy/images/hero/main2_011498524728.jpg",
  "/assets/legacy/images/hero/main_011500862913.jpg"
] as const;

export const legacyTopMenu: LegacyMenuItem[] = [
  {
    id: "company",
    label: "회사소개",
    href: "/company/overview",
    children: [
      { id: "company-overview", label: "CEO 인사말 & 회사 비전", href: "/company/overview" },
      { id: "company-partner", label: "파트너사 소개", href: "/company/partner" },
      { id: "company-location", label: "찾아오시는 길", href: "/company/location" }
    ]
  },
  {
    id: "application",
    label: "Application",
    href: "/application"
  },
  {
    id: "product",
    label: "제품소개",
    href: "/product"
  },
  {
    id: "solution",
    label: "광학솔루션",
    href: "/solution",
    children: [
      { id: "solution-optical", label: "광학설계", href: "/solution/optical-design" },
      { id: "solution-mechanical", label: "기구설계", href: "/solution/mechanical-design" },
      { id: "solution-sw", label: "SW 설계", href: "/solution/sw-design" }
    ]
  },
  {
    id: "inquiry",
    label: "제품문의",
    href: "/inquiry",
    children: [
      { id: "inquiry-quote", label: "견적문의", href: "/inquiry/quote" },
      { id: "inquiry-library", label: "자료실", href: "/inquiry/library" }
    ]
  }
];

export const legacyProductMega: LegacyMenuItem[] = [
  {
    id: "laser",
    label: "Laser",
    href: "/product/laser",
    children: [
      { id: "spark-laser", label: "Spark Laser", href: "/product/laser/spark-laser" },
      { id: "iradion", label: "Iradion", href: "/product/laser/iradion" },
      { id: "mase", label: "Mase", href: "/product/laser/mase" },
      { id: "dilas", label: "Dilas", href: "/product/laser/dilas" },
      { id: "seminex", label: "Seminex", href: "/product/laser/seminex" },
      { id: "monocrom", label: "Monocrom", href: "/product/laser/monocrom" },
      { id: "optical-engine", label: "Optical Engine", href: "/product/laser/optical-engine" }
    ]
  },
  {
    id: "laser-scanner",
    label: "Laser Scanner",
    href: "/product/laser-scanner",
    children: [
      { id: "scanlab", label: "Scanlab", href: "/product/laser-scanner/scanlab" }
    ]
  },
  {
    id: "laser-metrology",
    label: "Laser Metrology",
    href: "/product/laser-metrology",
    children: [
      { id: "laser-point", label: "Laser Point", href: "/product/laser-metrology/laser-point" },
      { id: "lumos", label: "LUMOS", href: "/product/laser-metrology/lumos" }
    ]
  },
  {
    id: "beam-shaping",
    label: "Beam Shaping",
    href: "/product/beam-shaping",
    children: [
      { id: "adloptica", label: "Adloptica", href: "/product/beam-shaping/adloptica" },
      { id: "power-photonic", label: "Power Photonic", href: "/product/beam-shaping/power-photonic" },
      { id: "cailabs", label: "Cailabs", href: "/product/beam-shaping/cailabs" }
    ]
  },
  {
    id: "optics",
    label: "Optics",
    href: "/product/optics",
    children: [
      { id: "optoman", label: "Optoman", href: "/product/optics/optoman" },
      { id: "ulo", label: "ULO", href: "/product/optics/ulo" },
      { id: "zenops", label: "Zenops", href: "/product/optics/zenops" }
    ]
  },
  {
    id: "beam-delivery",
    label: "Beam Delivery",
    href: "/product/beam-delivery",
    children: [
      { id: "photonic-tools", label: "photonic tools", href: "/product/beam-delivery/photonic-tools" }
    ]
  },
  {
    id: "optical-solution",
    label: "Optical Solution",
    href: "/product/optical-solution",
    children: [
      { id: "mlo", label: "MLO", href: "/product/optical-solution/mlo" }
    ]
  }
];

export const legacyAppCards: LegacyAppCard[] = [
  { id: "semiconductor", label: "Semiconductor", imagePath: "/assets/legacy/images/application/main_part03_img011504858501.png" },
  { id: "solar-cell", label: "Solar cell" },
  { id: "aerospace", label: "Aerospace", imagePath: "/assets/legacy/images/application/main_part03_img031504858618.png" },
  { id: "medical", label: "Medical", imagePath: "/assets/legacy/images/application/main_part03_img041504858646.png" },
  { id: "automotive", label: "Automotive", imagePath: "/assets/legacy/images/application/main_part03_img051504858663.png" },
  { id: "oled-display", label: "OLED display", imagePath: "/assets/legacy/images/application/main_part03_img061504858679.png" }
];

export const legacyAddress =
  "주소 : 서울특별시 금천구 가산디지털 1로 19 대륭테크노타운 18차 1306호 (우편번호 08594) T 02-852-0533 F 02-853-0537";
