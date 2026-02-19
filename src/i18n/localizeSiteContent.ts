import type { ApplicationCategory, SiteContent, SolutionArea } from "../types";
import type { Locale } from "./messages";

const koHeroText: Record<string, { title: string; subtitle: string; ctaLabel: string }> = {
  "slide-1": {
    title: "혁신의 빛으로 세상을 바꾸는 기업",
    subtitle: "SHINHOTEK은 산업 공정 맞춤형 레이저/광학 솔루션을 제공합니다.",
    ctaLabel: "회사 소개 보기"
  },
  "slide-2": {
    title: "BEST Technology Solution",
    subtitle: "통합 검색 구조로 제품을 빠르게 찾을 수 있습니다.",
    ctaLabel: "제품 찾기"
  },
  "slide-3": {
    title: "상담부터 검증까지 End-to-End",
    subtitle: "상담 -> 설계 -> 시뮬레이션 -> 제작 -> 검증까지 전체를 지원합니다.",
    ctaLabel: "견적 문의"
  }
};

const koApplicationText: Record<
  string,
  Pick<ApplicationCategory, "name" | "summary" | "process" | "recommendedProductCategory">
> = {
  semiconductor: {
    name: "Semiconductor",
    summary: "반도체 공정 정밀도 향상을 위한 광학 시스템",
    process: "레이저 소스 + 비전 + 빔 제어 기반 공정 매핑",
    recommendedProductCategory: "Laser, Metrology"
  },
  "solar-cell": {
    name: "Solar Cell",
    summary: "태양전지 공정을 위한 전용 카테고리",
    process: "셀 공정에 맞는 파장/출력 최적화",
    recommendedProductCategory: "Laser Scanner, Optics"
  },
  "medical-bio": {
    name: "Medical & Bio",
    summary: "의료 장비의 미세가공 및 이미징 정밀도 지원",
    process: "생체 친화 파장 + 안정적 포커싱",
    recommendedProductCategory: "Metrology, Beam Delivery"
  },
  automotive: {
    name: "Automotive (Second Battery, LiDAR)",
    summary: "EV 배터리 및 LiDAR 공정용 광학 솔루션",
    process: "배터리 탭/전극 공정 + LiDAR 정렬 설계",
    recommendedProductCategory: "Laser, Shaping"
  },
  "oled-display": {
    name: "OLED Display",
    summary: "디스플레이 생산 공정의 균일도와 정밀도 강화",
    process: "빔 쉐이핑 + 측정 피드백 루프",
    recommendedProductCategory: "Shaping, Optics"
  },
  aoi: {
    name: "AOI (Automated Optical Inspection)",
    summary: "신규 AOI 자동 검사 카테고리",
    process: "고속 촬영 + 조명 최적화 + 분석 파이프라인",
    recommendedProductCategory: "Vision, Metrology"
  }
};

const koSolutionText: Record<string, Pick<SolutionArea, "title" | "overview">> = {
  "optical-design": {
    title: "광학 설계",
    overview: "공정 요구조건에 맞춘 광학계 설계"
  },
  "mechanical-design": {
    title: "기구 설계",
    overview: "열/정렬 이슈를 고려한 기구 설계"
  },
  "sw-design": {
    title: "SW 설계",
    overview: "장비 제어 및 공정 데이터 분석 자동화"
  }
};

const koProcessSteps = ["상담", "설계", "시뮬레이션", "제작", "검증"];

const koVision = [
  "Mission: 실용적인 광학 솔루션 제공",
  "Vision: 산업 광학 분야의 신뢰받는 파트너",
  "Core Values: 정밀, 신뢰, 실행, 확장성"
];

export const localizeSiteContent = (content: SiteContent, locale: Locale): SiteContent => {
  if (locale !== "ko") {
    return content;
  }

  return {
    ...content,
    heroSlides: content.heroSlides.map((slide) => {
      const override = koHeroText[slide.id];
      if (!override) {
        return slide;
      }
      return {
        ...slide,
        ...override
      };
    }),
    applications: content.applications.map((item) => {
      const override = koApplicationText[item.id];
      if (!override) {
        return item;
      }
      return {
        ...item,
        ...override
      };
    }),
    solutions: content.solutions.map((item) => {
      const override = koSolutionText[item.id];
      if (!override) {
        return item;
      }
      return {
        ...item,
        ...override
      };
    }),
    processSteps: koProcessSteps,
    ceoMessage:
      "SHINHOTEK은 공정 중심 광학 엔지니어링을 제공하며 기획부터 검증까지 실행을 지원합니다.",
    visionItems: koVision
  };
};
