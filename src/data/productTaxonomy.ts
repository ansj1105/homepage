import type { Locale } from "../i18n/messages";

export interface LocalizedLabel {
  ko: string;
  en: string;
}

export interface ProductItemNode {
  slug: string;
  label: LocalizedLabel;
}

export interface ProductCategoryNode {
  slug: string;
  label: LocalizedLabel;
  items: ProductItemNode[];
}

export const getLabel = (label: LocalizedLabel, locale: Locale): string => label[locale];

export const productTaxonomy: ProductCategoryNode[] = [
  {
    slug: "laser",
    label: { ko: "Laser", en: "Laser" },
    items: [
      { slug: "spark-laser", label: { ko: "Spark Laser", en: "Spark Laser" } },
      { slug: "iradion", label: { ko: "Iradion", en: "Iradion" } },
      { slug: "mase", label: { ko: "Mase", en: "Mase" } },
      { slug: "dilas", label: { ko: "Dilas", en: "Dilas" } },
      { slug: "seminex", label: { ko: "Seminex", en: "Seminex" } },
      { slug: "monocrom", label: { ko: "Monocrom", en: "Monocrom" } },
      { slug: "optical-engine", label: { ko: "Optical Engine", en: "Optical Engine" } }
    ]
  },
  {
    slug: "laser-scanner",
    label: { ko: "Laser Scanner", en: "Laser Scanner" },
    items: [{ slug: "scanlab", label: { ko: "Scanlab", en: "Scanlab" } }]
  },
  {
    slug: "laser-metrology",
    label: { ko: "Laser Metrology", en: "Laser Metrology" },
    items: [
      { slug: "laser-point", label: { ko: "Laser Point", en: "Laser Point" } },
      { slug: "lumos", label: { ko: "LUMOS", en: "LUMOS" } }
    ]
  },
  {
    slug: "beam-shaping",
    label: { ko: "Beam Shaping", en: "Beam Shaping" },
    items: [
      { slug: "adloptica", label: { ko: "Adloptica", en: "Adloptica" } },
      { slug: "power-photonic", label: { ko: "Power Photonic", en: "Power Photonic" } },
      { slug: "cailabs", label: { ko: "Cailabs", en: "Cailabs" } }
    ]
  },
  {
    slug: "optics",
    label: { ko: "Optics", en: "Optics" },
    items: [
      { slug: "optoman", label: { ko: "Optoman", en: "Optoman" } },
      { slug: "ulo", label: { ko: "ULO", en: "ULO" } },
      { slug: "zenops", label: { ko: "Zenops", en: "Zenops" } }
    ]
  },
  {
    slug: "beam-delivery",
    label: { ko: "Beam Delivery", en: "Beam Delivery" },
    items: [{ slug: "photonic-tools", label: { ko: "photonic tools", en: "photonic tools" } }]
  },
  {
    slug: "optical-solution",
    label: { ko: "Optical Solution", en: "Optical Solution" },
    items: [{ slug: "mlo", label: { ko: "MLO", en: "MLO" } }]
  }
];

export const getCategoryBySlug = (slug: string | undefined): ProductCategoryNode | undefined =>
  productTaxonomy.find((item) => item.slug === slug);

export const getItemBySlug = (
  category: ProductCategoryNode | undefined,
  itemSlug: string | undefined
): ProductItemNode | undefined => category?.items.find((item) => item.slug === itemSlug);
