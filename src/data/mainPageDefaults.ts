import type { MainPageContent } from "../types";

export const defaultMainPageContent: MainPageContent = {
  settings: {
    heroCopyTop: "SHINHOTEK",
    heroCopyMid: "Integrated Photonics for Industrial Engineering",
    heroCopyBottom: "Precision components, practical system thinking, reliable execution",
    heroCtaLabel: "VIEW SOLUTIONS",
    heroCtaHref: "/product",
    aboutTitle: "ABOUT SHINHOTEK",
    aboutBody1:
      "신호텍은 산업 현장에서 바로 검토할 수 있는 광학 부품과 시스템 구성을 중심으로, 요구 사양에 맞는 현실적인 제안을 빠르게 정리합니다.",
    aboutBody2:
      "복잡한 제품 정보를 나열하기보다 고객이 필요한 방향을 빠르게 파악할 수 있도록, 포트폴리오 구조와 적용 흐름을 명확하게 전달하는 데 집중합니다.",
    aboutImageUrl: "/assets/legacy/images/section/main_part01_img01.jpg",
    solutionTitle: "SH SOLUTION",
    solutionBody1:
      "고객 공정과 사양에 맞는 요소를 유기적으로 연결해 도입 검토부터 적용 판단까지 이어질 수 있는 솔루션 흐름을 설계합니다.",
    solutionBody2:
      "메인 페이지는 기술 키워드를 그대로 나열하기보다, 어떤 성격의 회사이고 어떤 구조로 문제를 풀어주는지 한눈에 이해되도록 구성합니다.",
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
      linkUrl: "/application/semiconductor",
      sortOrder: 0
    },
    { id: "solar-cell", label: "Solar cell", imageUrl: "", linkUrl: "/application/solar-cell", sortOrder: 1 },
    {
      id: "aerospace",
      label: "Aerospace",
      imageUrl: "/assets/legacy/images/application/main_part03_img031504858618.png",
      linkUrl: "/application/aerospace",
      sortOrder: 2
    },
    {
      id: "medical",
      label: "Medical",
      imageUrl: "/assets/legacy/images/application/main_part03_img041504858646.png",
      linkUrl: "/application/medical-bio",
      sortOrder: 3
    },
    {
      id: "automotive",
      label: "Automotive",
      imageUrl: "/assets/legacy/images/application/main_part03_img051504858663.png",
      linkUrl: "/application/automotive",
      sortOrder: 4
    },
    {
      id: "oled-display",
      label: "OLED display",
      imageUrl: "/assets/legacy/images/application/main_part03_img061504858679.png",
      linkUrl: "/application/oled-display",
      sortOrder: 5
    }
  ]
};
