import { ManageUsersStep, SECTION, FlowStep } from "./navigation";
import { ProductForCart } from "./product";

export type ChatMode = "idle"
	| "upload_xlsx"
	| "add_user"
	| "delete_user"
	| "edit_user"
	| "edit_rub_to_byn"
	| "edit_rub_to_usd"
	| "edit_retail_mult"
	| "edit_wholesale_mult"
	| "amount_product_for_cart"
	| "await_page_number"
	| "edit_product_amount_in_cart";

export interface ChatState {
	section?: SECTION;
	mode: ChatMode;

	page?: number;
	totalPages?: number;

	adminStep?: ManageUsersStep;
	editingUserId?: number;
	newUserId?: number;

	flowStep?: FlowStep;
	selectedBrand?: string;
	selectedCategory?: string;
	selectedModel?: string;
	selectedStorage?: string;
	selectedProductId?: string;
	selectedAmount?: string;
	selectedProductIdForCart?: string

	currentOrder?: ProductForCart[],

	messageIds?: number[];
	inlineMessageId?: number;
  replyMessageId?: number;
}
