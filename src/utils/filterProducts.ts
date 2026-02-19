import type { Product, ProductFilterCriteria } from "../types";

const parseWavelength = (value: string): number[] => {
  return value
    .split("/")
    .flatMap((part) => part.split("-"))
    .map((token) => Number(token.trim()))
    .filter((num) => Number.isFinite(num));
};

export const filterProducts = (
  products: Product[],
  criteria: ProductFilterCriteria
): Product[] => {
  const search = criteria.search?.trim().toLowerCase();
  const category = criteria.category?.trim().toLowerCase();
  const manufacturer = criteria.manufacturer?.trim().toLowerCase();

  return products.filter((product) => {
    if (search) {
      const searchable = [
        product.name,
        product.category,
        product.manufacturer,
        product.benefit
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(search)) {
        return false;
      }
    }

    if (category && product.category.toLowerCase() !== category) {
      return false;
    }

    if (manufacturer && product.manufacturer.toLowerCase() !== manufacturer) {
      return false;
    }

    if (typeof criteria.minPowerW === "number" && product.powerW < criteria.minPowerW) {
      return false;
    }

    if (typeof criteria.maxWavelengthNm === "number") {
      const parsed = parseWavelength(product.wavelengthNm);
      if (parsed.length === 0) {
        return false;
      }
      const minWavelength = Math.min(...parsed);
      if (minWavelength > criteria.maxWavelengthNm) {
        return false;
      }
    }

    return true;
  });
};
