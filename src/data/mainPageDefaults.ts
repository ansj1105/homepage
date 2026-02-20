import type { MainPageContent } from "../types";

export const defaultMainPageContent: MainPageContent = {
  settings: {
    heroCopyTop: "SHINHOTEK",
    heroCopyMid: "Innovation Light Changes the World",
    heroCopyBottom: "BEST Technology Solution",
    heroCtaLabel: "ABOUT SHINHOTEK",
    heroCtaHref: "/company/ceo",
    aboutTitle: "ABOUT SHINHOTEK",
    aboutBody1:
      "광학은 앞으로 펼쳐질 미래 사회의 핵심 기술로서, 자율주행 자동차 등 광범위한 분야에 활용이 되고 있습니다.",
    aboutBody2:
      "신호텍은 고객사의 요구에 대한 광학 컨설팅을 통해 최적의 제품을 공급함으로써 국내의 레이저 산업 및 연구 분야의 발전에 앞장서고 있습니다.",
    aboutImageUrl: "/assets/legacy/images/section/main_part01_img01.jpg",
    solutionTitle: "SH SOLUTION",
    solutionBody1:
      "SHINHOTEK은 BPS(Business Partner System)을 기반으로 하여, 기성 광학 구성품 또는 모듈과 단품을 통합한 광학계 솔루션을 고객사에 제안합니다.",
    solutionBody2:
      "가격과 미 경험에 의한 실패 확률을 줄여 최선의 효율을 추구하고, 향후 고객 application 및 사양에 맞는 맞춤화된 광학 솔루션을 제공하겠습니다.",
    solutionStepImage1: "/assets/legacy/images/section/main_part02_img01.png",
    solutionStepImage2: "/assets/legacy/images/section/main_part02_img02.png",
    solutionStepImage3: "/assets/legacy/images/section/main_part02_img03.png",
    footerAddress:
      "주소 : 서울특별시 금천구 가산디지털 1로 19 대륭테크노타운 18차 1306호 (우편번호 08594) T 02-852-0533 F 02-853-0537",
    footerCopyright: "Copyright 2017 SHINHOTEK. All Rights Reserved."
  },
  slides: [
    { id: "slide-1", imageUrl: "/assets/legacy/images/hero/main_011498524747.jpg", sortOrder: 0 },
    { id: "slide-2", imageUrl: "/assets/legacy/images/hero/main2_011498524728.jpg", sortOrder: 1 },
    { id: "slide-3", imageUrl: "/assets/legacy/images/hero/main_011500862913.jpg", sortOrder: 2 }
  ],
  applicationCards: [
    {
      id: "semiconductor",
      label: "Semiconductor",
      imageUrl: "/assets/legacy/images/application/main_part03_img011504858501.png",
      linkUrl: "/product",
      sortOrder: 0
    },
    { id: "solar-cell", label: "Solar cell", imageUrl: "", linkUrl: "/product", sortOrder: 1 },
    {
      id: "aerospace",
      label: "Aerospace",
      imageUrl: "/assets/legacy/images/application/main_part03_img031504858618.png",
      linkUrl: "/product",
      sortOrder: 2
    },
    {
      id: "medical",
      label: "Medical",
      imageUrl: "/assets/legacy/images/application/main_part03_img041504858646.png",
      linkUrl: "/product",
      sortOrder: 3
    },
    {
      id: "automotive",
      label: "Automotive",
      imageUrl: "/assets/legacy/images/application/main_part03_img051504858663.png",
      linkUrl: "/product",
      sortOrder: 4
    },
    {
      id: "oled-display",
      label: "OLED display",
      imageUrl: "/assets/legacy/images/application/main_part03_img061504858679.png",
      linkUrl: "/product",
      sortOrder: 5
    }
  ]
};
