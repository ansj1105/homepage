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
      { slug: "nanosecond", label: { ko: "Nanosecond", en: "Nanosecond" } },
      {
        slug: "picosecond-femtosecond",
        label: { ko: "Picosecond / Femtosecond", en: "Picosecond / Femtosecond" }
      },
      { slug: "co2", label: { ko: "CO2", en: "CO2" } },
      { slug: "excimer", label: { ko: "Excimer", en: "Excimer" } },
      { slug: "diode-laser", label: { ko: "Diode laser", en: "Diode laser" } }
    ]
  },
  {
    slug: "optics",
    label: { ko: "Optics", en: "Optics" },
    items: [
      { slug: "monocle", label: { ko: "모노클", en: "Monocle" } },
      { slug: "ulo-optics", label: { ko: "ULO Optics", en: "ULO Optics" } },
      { slug: "green-optics", label: { ko: "그린광학", en: "Green Optics" } },
      { slug: "jenoptik", label: { ko: "옌옵틱", en: "Jenoptik" } }
    ]
  },
  {
    slug: "laser-scanner",
    label: { ko: "Laser scanner", en: "Laser scanner" },
    items: [{ slug: "scanlab", label: { ko: "Scanlab", en: "Scanlab" } }]
  },
  {
    slug: "custom-solution",
    label: { ko: "Custom solution", en: "Custom solution" },
    items: [
      { slug: "meopta", label: { ko: "Meopta", en: "Meopta" } },
      { slug: "femtoprint", label: { ko: "FEMTOPRINT", en: "FEMTOPRINT" } }
    ]
  },
  {
    slug: "laser-measurement",
    label: { ko: "Laser measurement", en: "Laser measurement" },
    items: [
      { slug: "laser-point", label: { ko: "Laser point", en: "Laser point" } },
      { slug: "metrolux", label: { ko: "Metrolux", en: "Metrolux" } },
      { slug: "shinhotek", label: { ko: "SHINHOTEK", en: "SHINHOTEK" } }
    ]
  },
  {
    slug: "others",
    label: { ko: "Others", en: "Others" },
    items: [{ slug: "others", label: { ko: "Others", en: "Others" } }]
  },
  {
    slug: "beam-shaper",
    label: { ko: "Beam shaper", en: "Beam shaper" },
    items: [
      { slug: "adloptica", label: { ko: "Adloptica", en: "Adloptica" } },
      { slug: "power-photonic", label: { ko: "Power photonic", en: "Power photonic" } },
      { slug: "silios", label: { ko: "Silios", en: "Silios" } }
    ]
  }
];

export const getCategoryBySlug = (slug: string | undefined): ProductCategoryNode | undefined =>
  productTaxonomy.find((item) => item.slug === slug);

export const getItemBySlug = (
  category: ProductCategoryNode | undefined,
  itemSlug: string | undefined
): ProductItemNode | undefined => category?.items.find((item) => item.slug === itemSlug);
