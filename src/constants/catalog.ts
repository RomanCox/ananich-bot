import { FilteringProducts } from "../types/navigation";

export const CatalogBackMap: Record<FilteringProducts, FilteringProducts | null> = {
	brands: null,
	categories: "brands",
	products: "categories",
};