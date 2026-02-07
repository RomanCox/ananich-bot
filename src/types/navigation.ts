export enum SECTION {
  MAIN = "main",
	UPLOAD_XLSX = "upload_xlsx",
	MANAGE_USERS = "manage_users",
	CATALOG = "catalog",
	CART = "cart",
}

export enum NAVIGATION_VALUE {
	CATALOG = "catalog",
	CART = "cart",
	ADMIN = "admin",
}

export type ManageUsersStep = "main" | "users_list" | "add_user" | "delete_user";
export type CatalogStep = "brands" | "categories" | "products";
export type CartStep =
	| "root"
	| "brand"
	| "category"
	| "product"
	| "variant"
	| "quantity";