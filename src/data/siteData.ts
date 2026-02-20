import type {
  ApplicationCategory,
  NoticeItem,
  PartnerBrand,
  Product,
  ResourceItem,
  SiteContent,
  SolutionArea
} from "../types";

export const navItems = [
  { label: "Main", target: "main-hero" },
  { label: "Company", target: "company" },
  { label: "Application", target: "applications" },
  { label: "Product", target: "products" },
  { label: "SH Solution", target: "solutions" },
  { label: "Inquiry", target: "inquiry" },
  { label: "Resources", target: "resources" }
] as const;

const applications: ApplicationCategory[] = [
  {
    id: "semiconductor",
    name: "Semiconductor",
    summary: "Precision optical systems for semiconductor process quality.",
    process: "Process mapping with laser source + vision + beam control",
    recommendedProductCategory: "Laser, Metrology"
  },
  {
    id: "solar-cell",
    name: "Solar Cell",
    summary: "Dedicated category replacing aerospace.",
    process: "Wavelength and output optimization for cell process lines",
    recommendedProductCategory: "Laser Scanner, Optics"
  },
  {
    id: "medical-bio",
    name: "Medical & Bio",
    summary: "Micromachining and imaging precision for medical equipment.",
    process: "Bio-safe wavelength ranges with stable focusing",
    recommendedProductCategory: "Metrology, Beam Delivery"
  },
  {
    id: "automotive",
    name: "Automotive (Second Battery, LiDAR)",
    summary: "Optical process support for EV battery and LiDAR lines.",
    process: "Battery tab/electrode workflows with LiDAR alignment design",
    recommendedProductCategory: "Laser, Shaping"
  },
  {
    id: "oled-display",
    name: "OLED Display",
    summary: "Uniformity and precision support for display manufacturing.",
    process: "Beam shaping and metrology feedback loops",
    recommendedProductCategory: "Shaping, Optics"
  },
  {
    id: "aoi",
    name: "AOI (Automated Optical Inspection)",
    summary: "Newly added AOI automation category.",
    process: "High-speed capture + lighting optimization + analysis workflow",
    recommendedProductCategory: "Vision, Metrology"
  }
];

const products: Product[] = [
  {
    id: "laser-fiber-1",
    name: "Fiber Laser FL-1000",
    category: "Laser",
    manufacturer: "TRUMPF",
    wavelengthNm: "1064",
    powerW: 1000,
    interface: "EtherCAT / RS-485",
    benefit: "High output stability and throughput",
    datasheetUrl: "#",
    cadUrl: "#"
  },
  {
    id: "laser-uv-1",
    name: "UV Laser UV-355",
    category: "Laser",
    manufacturer: "Coherent",
    wavelengthNm: "355",
    powerW: 20,
    interface: "Ethernet / Digital I/O",
    benefit: "Micromachining quality",
    datasheetUrl: "#",
    cadUrl: "#"
  },
  {
    id: "scanner-2d-1",
    name: "2D Galvo Scanner GS-20",
    category: "Laser Scanner",
    manufacturer: "ScanLab",
    wavelengthNm: "355-1064",
    powerW: 500,
    interface: "XY2-100 / EtherCAT",
    benefit: "Fast path control for laser machining",
    datasheetUrl: "#",
    cadUrl: "#"
  },
  {
    id: "metrology-1",
    name: "Metrology Vision MV-7",
    category: "Metrology",
    manufacturer: "Allied Vision",
    wavelengthNm: "450-850",
    powerW: 12,
    interface: "GigE / USB3",
    benefit: "Precision metrology data capture",
    datasheetUrl: "#",
    cadUrl: "#"
  },
  {
    id: "metrology-2",
    name: "Inline Profiler IP-9",
    category: "Metrology",
    manufacturer: "Jenoptik",
    wavelengthNm: "532-1064",
    powerW: 30,
    interface: "Ethernet / OPC-UA",
    benefit: "Inline quality feedback",
    datasheetUrl: "#",
    cadUrl: "#"
  },
  {
    id: "shaping-1",
    name: "Beam Shaping Module BS-4",
    category: "Shaping",
    manufacturer: "Altechna",
    wavelengthNm: "515-1064",
    powerW: 200,
    interface: "Manual / Motorized",
    benefit: "Beam uniformity improvement",
    datasheetUrl: "#",
    cadUrl: "#"
  },
  {
    id: "optics-1",
    name: "Precision F-Theta Lens",
    category: "Optics",
    manufacturer: "WizOptics",
    wavelengthNm: "355 / 532 / 1064",
    powerW: 300,
    interface: "Mechanical Mount",
    benefit: "Low distortion and focus stability",
    datasheetUrl: "#",
    cadUrl: "#"
  },
  {
    id: "beam-delivery-1",
    name: "Beam Delivery Module BD-3",
    category: "Beam Delivery",
    manufacturer: "3SAE",
    wavelengthNm: "780-1550",
    powerW: 40,
    interface: "Fiber / FC Connector",
    benefit: "Reliable optical transfer path",
    datasheetUrl: "#",
    cadUrl: "#"
  },
  {
    id: "laser-green-1",
    name: "Green Laser GL-532",
    category: "Laser",
    manufacturer: "BMLaser",
    wavelengthNm: "532",
    powerW: 80,
    interface: "RS-232 / Ethernet",
    benefit: "Good fit for reflective materials",
    datasheetUrl: "#",
    cadUrl: "#"
  },
  {
    id: "scanner-3d-1",
    name: "3D Dynamic Scanner DS-3",
    category: "Laser Scanner",
    manufacturer: "CoreRay",
    wavelengthNm: "1030-1080",
    powerW: 650,
    interface: "EtherCAT",
    benefit: "3D contour trajectory control",
    datasheetUrl: "#",
    cadUrl: "#"
  }
];

const partners: PartnerBrand[] = [
  { id: "p-1", name: "Uniotech", category: "Optics", url: "https://uniotech.kr/" },
  { id: "p-2", name: "CoreRay", category: "Vision", url: "https://www.coreray.kr/" },
  { id: "p-3", name: "MJLINC", category: "Optics", url: "https://www.mjlinc.com/" },
  { id: "p-4", name: "SMTech", category: "Laser", url: "http://www.smtech.co.kr/" },
  { id: "p-5", name: "Lasernet", category: "Laser", url: "http://www.lasernet.co.kr/shop/index.php" },
  { id: "p-6", name: "Jinsung", category: "Measurement", url: "https://jinsunginst.com/" },
  { id: "p-7", name: "BMLaser Solution", category: "Laser", url: "https://bmlaser.co.kr/" },
  { id: "p-8", name: "Qbic Laser System", category: "Laser", url: "http://qbiclaser.com/" },
  { id: "p-9", name: "WizOptics", category: "Optics", url: "http://www.wizoptics.com/" },
  { id: "p-10", name: "DOMUN INC.", category: "Measurement", url: "https://www.domun.co.kr/" },
  { id: "p-11", name: "Enclony", category: "Vision", url: "https://enclony.com/" },
  { id: "p-12", name: "Altechna", category: "Optics", url: "https://www.altechna.com/" },
  { id: "p-13", name: "TRUMPF", category: "Laser", url: "https://www.trumpf.com/" },
  { id: "p-14", name: "Coherent", category: "Laser", url: "https://www.coherent.com/" },
  { id: "p-15", name: "3SAE Technologies", category: "Optics", url: "https://3sae.com/" },
  { id: "p-16", name: "Allied Vision", category: "Vision", url: "https://www.alliedvision.com/" }
];

const solutions: SolutionArea[] = [
  {
    id: "optical-design",
    title: "Optical Design",
    overview: "Optical system design for process-specific requirements.",
    capabilities: ["Ray tracing with Zemax", "Tolerance analysis", "Prototype validation"]
  },
  {
    id: "mechanical-design",
    title: "Mechanical Design",
    overview: "Mechanical design considering thermal and alignment issues.",
    capabilities: ["Thermal-aware housing", "Precision alignment jig", "Manufacturable design"]
  },
  {
    id: "sw-design",
    title: "SW Design",
    overview: "Control and analysis automation for equipment and process data.",
    capabilities: ["Equipment communication", "Inspection logs", "Auto report pipeline"]
  }
];

export const resources: ResourceItem[] = [];

export const notices: NoticeItem[] = [];

export const initialSiteContent: SiteContent = {
  heroSlides: [
    {
      id: "slide-1",
      title: "Innovation Light Changes the World",
      subtitle: "Industrial process-ready laser and optics solutions by SHINHOTEK.",
      ctaLabel: "About SHINHOTEK",
      ctaTarget: "partners"
    },
    {
      id: "slide-2",
      title: "BEST Technology Solution",
      subtitle: "Find products quickly with integrated search and filter.",
      ctaLabel: "Find Products",
      ctaTarget: "products"
    },
    {
      id: "slide-3",
      title: "From Consultation to Verification",
      subtitle: "Consulting -> Design -> Simulation -> Build -> Verification",
      ctaLabel: "Request Quote",
      ctaTarget: "inquiry"
    }
  ],
  applications,
  products,
  partners,
  solutions,
  quickLinks: [
    { label: "KakaoTalk", url: "https://open.kakao.com/" },
    { label: "WeChat", url: "https://www.wechat.com/" },
    { label: "LinkedIn", url: "https://www.linkedin.com/company/shinhotek/" }
  ],
  processSteps: ["Consulting", "Design", "Simulation", "Build", "Verification"],
  ceoMessage:
    "SHINHOTEK delivers process-focused optical engineering and supports execution from planning to validation.",
  visionItems: [
    "Mission: Provide practical optical solutions",
    "Vision: Trusted partner in industrial optics",
    "Core Values: Precision, Reliability, Speed, Scalability"
  ],
  contact: {
    headquarter:
      "#1306 Daerung Techno Town-18, 19 Gasan digital 1-ro, Geumcheon-gu, Seoul, Korea",
    rdCenter:
      "#1307 Daerung Techno Town-18, 19 Gasan digital 1-ro, Geumcheon-gu, Seoul, Korea",
    tel: "+82 (0)2 852-0533",
    fax: "+82 (0)2 853-0537",
    email: "sales@shinhotek.com",
    website: "www.shinhotek.com"
  }
};
