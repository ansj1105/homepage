import type { CmsPage } from "../types";

export const defaultCmsPages: CmsPage[] = [
  {
    slug: "company-ceo",
    title: "대표자 인사말",
    imageUrl: "/assets/legacy-sync/sub1_1_img01.jpg",
    markdown:
      "![대표자 소개](/assets/legacy-sync/sub1_1_img01.jpg)\n\n### 4차 산업혁명의 시대를 맞아 차세대 광학솔루션 전문업체로서 거듭 나겠습니다.\n\n2007년 설립 이후 신호텍은 국내 광 관련 산업에 조그마한 초석이 되고자 노력해 왔습니다.\n\n지금까지 디스플레이, PCB, 반도체 및 의료기기 시장에서 쌓은 경험을 바탕으로 차세대 광학솔루션 전문업체로 성장하고자 과감한 도전과 투자에 대한 노력을 계속할 것을 약속 드립니다.",
    updatedAt: new Date(0).toISOString()
  },
  {
    slug: "company-vision",
    title: "회사 비전",
    imageUrl: "/assets/legacy-sync/sub1_2_img02.png",
    markdown:
      "### VISION\n\n신호텍의 VISION은 보다 **선도적으로**, 보다 **효율적인** 광학 솔루션을 제공하는 것입니다.\n\n### VISION 2030\n\n- 산업 맞춤형 광학 솔루션 고도화\n- 실행 중심 엔지니어링 역량 강화\n- 고객 성공 중심 파트너십 확대",
    updatedAt: new Date(0).toISOString()
  },
  {
    slug: "partner-core",
    title: "CORE PARTNER",
    imageUrl: "/assets/legacy/images/seul-ra-i-deu11573621207.jpg",
    markdown:
      "### CORE PARTNER\n\n핵심 파트너사와 함께 공정 문제를 해결하고, 검증 가능한 광학 솔루션을 제공합니다.\n\n![Core Partner](/assets/legacy/images/seul-ra-i-deu11573621207.jpg)",
    updatedAt: new Date(0).toISOString()
  }
];
