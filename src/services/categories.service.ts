import { loadProducts } from "./sheets.service";
import { getCategoriesFromCache } from "../cache";

export async function getCategories(): Promise<string[]> {
	await loadProducts();
	return getCategoriesFromCache();
}
