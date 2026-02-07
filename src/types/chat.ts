import { ManageUsersStep, CartStep, CatalogStep, SECTION } from "./navigation";

export interface ChatState {
	section?: SECTION;

	page?: number;
	totalPages?: number;

	adminStep?: ManageUsersStep;

	catalogStep?: CatalogStep;
	selectedBrand?: string;
	selectedCategory?: string;

	cartStep?: CartStep;
	selectedProductId?: string;
	selectedVariantId?: string;

	messageIds?: number[];
	inlineMessageId?: number;
  replyMessageId?: number;
}
