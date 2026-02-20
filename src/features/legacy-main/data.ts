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
    id: "be21e5fa",
    label: "회사소개",
    href: "/company/ceo",
    children: [
      { id: "54ddbaf0", label: "CEO 인사말", href: "/company/ceo" },
      { id: "a8efd0b7", label: "회사 비전", href: "/company/vision" },
      { id: "f4984283", label: "찾아오시는 길", href: "/company/location" }
    ]
  },
  {
    id: "cd917f17",
    label: "파트너",
    href: "/partner/core",
    children: [{ id: "sub2_1", label: "CORE PARTNER", href: "/partner/core" }]
  },
  { id: "db4958d7", label: "제품", href: "/product" },
  {
    id: "02708bea",
    label: "제품문의",
    href: "/inquiry/quote",
    children: [
      { id: "inquiry", label: "견적요청", href: "/inquiry/quote" },
      { id: "testdemo", label: "Test 및 Demo", href: "/inquiry/test-demo" },
      { id: "menual", label: "자료실(매뉴얼)", href: "/inquiry/library" }
    ]
  },
  {
    id: "ff6078f4",
    label: "공지사항",
    href: "/notice",
    children: [{ id: "b13e0b14", label: "공지사항", href: "/notice" }]
  }
];

export const legacyProductMega: LegacyMenuItem[] = [
  {
    id: "6b5eebd7",
    label: "Laser",
    href: "/product/laser",
    children: [
      { id: "aa49a34a", label: "Nanosecond", href: "/product/laser/nanosecond" },
      { id: "d9a8c320", label: "Picosecond/ Femtosecond", href: "/product/laser/picosecond-femtosecond" },
      { id: "b8f82ab3", label: "CO2", href: "/product/laser/co2" },
      { id: "336850dd", label: "Excimer", href: "/product/laser/excimer" },
      { id: "5ea7cbd3", label: "Diode laser", href: "/product/laser/diode-laser" }
    ]
  },
  {
    id: "1f638fd0",
    label: "Optics",
    href: "/product/optics",
    children: [
      { id: "b451fed3", label: "모노클", href: "/product/optics/monocle" },
      { id: "23452345", label: "ULO Optics", href: "/product/optics/ulo-optics" },
      { id: "pro6_3", label: "그린광학", href: "/product/optics/green-optics" },
      { id: "pro6_4", label: "옌옵틱", href: "/product/optics/jenoptik" }
    ]
  },
  {
    id: "1f969dbb",
    label: "Laser scanner",
    href: "/product/laser-scanner",
    children: [{ id: "176a9c95", label: "Scanlab", href: "/product/laser-scanner/scanlab" }]
  },
  {
    id: "e158d94e",
    label: "Custom solution",
    href: "http://shinhotek.hmandoo.co.kr/shop_contents/myboard_read.htm?load_type=&page_idx=0&tag_on=&h_search_c=0&h_search_v=&me_popup=&myboard_code=pro7_1&page_limit=10&idx=862531&page=1&category_idx=",
    target: "_blank",
    children: [
      {
        id: "28acbd82",
        label: "Meopta",
        href: "http://shinhotek.hmandoo.co.kr/shop_contents/myboard_read.htm?load_type=&page_idx=0&tag_on=&h_search_c=0&h_search_v=&me_popup=&myboard_code=pro7_1&page_limit=10&idx=862531&page=1&category_idx=",
        target: "_blank"
      },
      {
        id: "13300bde",
        label: "FEMTOPRINT®",
        href: "http://shinhotek.hmandoo.co.kr/shop_contents/myboard_read.htm?load_type=&page_idx=0&tag_on=&h_search_c=0&h_search_v=&me_popup=&myboard_code=pro7_2&page_limit=10&idx=86351&page=1&category_idx=",
        target: "_blank"
      }
    ]
  },
  {
    id: "965c17c3",
    label: "Laser measurement",
    href: "/product/laser-measurement",
    children: [
      { id: "ee3098e3", label: "Laser point", href: "/product/laser-measurement/laser-point" },
      { id: "1b1dd59a", label: "Metrolux", href: "/product/laser-measurement/metrolux" },
      { id: "pro4_3", label: "SHINHOTEK", href: "/product/laser-measurement/shinhotek" }
    ]
  },
  {
    id: "pro8_1",
    label: "Others",
    href: "/product/others",
    children: [{ id: "36bdb97f", label: "Others", href: "/product/others/others" }]
  },
  {
    id: "6d145a0f",
    label: "Beam shaper",
    href: "/product/beam-shaper",
    children: [
      { id: "bf7f57c7", label: "Adloptica", href: "/product/beam-shaper/adloptica" },
      { id: "6bea92d7", label: "Power photonic", href: "/product/beam-shaper/power-photonic" },
      { id: "pro5_1", label: "Silios", href: "/product/beam-shaper/silios" }
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
