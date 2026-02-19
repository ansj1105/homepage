import type { Locale } from "../../i18n/messages";
import type { Product, ResourceItem } from "../../types";
import type { ProductCategoryNode } from "../../data/productTaxonomy";

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9가-힣]/g, "");

export const findRelatedProducts = (products: Product[], category: ProductCategoryNode): Product[] => {
  const keys = [category.slug, category.label.en, category.label.ko].map(normalize);
  return products.filter((item) => {
    const name = normalize(item.name);
    const itemCategory = normalize(item.category);
    return keys.some((key) => itemCategory.includes(key) || name.includes(key));
  });
};

export const resourceTypeLabel = (type: ResourceItem["type"], locale: Locale): string => {
  if (locale === "en") {
    return type;
  }
  switch (type) {
    case "Catalog":
      return "카탈로그";
    case "White Paper":
      return "백서";
    case "Certificate":
      return "인증서";
    case "Case Study":
      return "적용사례";
    default:
      return type;
  }
};
