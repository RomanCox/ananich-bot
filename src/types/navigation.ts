export enum SECTION {
  MAIN = "main",
	UPLOAD_XLSX = "upload_xlsx",
	MANAGE_USERS = "manage_users",
	CATALOG = "catalog",
	ORDERS = "orders",
	CART = "cart",
}

export type ManageUsersStep = "main" | "users_list" | "add_user" | "delete_user" | "edit_user";
export type FlowStep =
	"main" |
	"brands" |
	"categories" |
	"products" |
	"models" |
	"storage" |
	"products_for_cart" |
	"amount" |
	"edit_cart" |
	"edit_product_in_cart";