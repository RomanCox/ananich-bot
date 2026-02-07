import TelegramBot from "node-telegram-bot-api";
import { getProducts } from "../../services/products.service";
import { getBrands, getCategoriesByBrand } from "../../utils/products.utils";
import { getChatState } from "../../state/chat.state";
import { brandsKeyboard } from "../../keyboards/brands.keyboard";
import { CATALOG_TEXTS } from "../../texts/catalog.texts";
import { categoriesKeyboard } from "../../keyboards/categories.keyboard";
import { ChatState } from "../../types/chat";
import { isAdmin } from "../../services/users.service";
import { renderProductsList } from "../../render/renderProductsList";
import { registerBotMessage } from "../../state/chat.state";

async function renderBrands(bot: TelegramBot, chatId: number, products: ReturnType<typeof getProducts>) {
	const userId = chatId;

	const brands = getBrands(products);
	if (!brands.length) {
		const msg = await bot.sendMessage(chatId, CATALOG_TEXTS.UNAVAILABLE);
		// setChatState(chatId, {messageIds: [msg.message_id]});
		registerBotMessage(chatId, msg.message_id);
		return;
	}

	const msg = await bot.sendMessage(chatId, CATALOG_TEXTS.CHOOSE_BRAND, {
		reply_markup: brandsKeyboard(brands, { showBack: isAdmin(userId) }),
	});
	// setChatState(chatId, {messageIds: [msg.message_id]});
	registerBotMessage(chatId, msg.message_id);
}

async function renderCategories(bot: TelegramBot, chatId: number, state: ChatState, products: ReturnType<typeof getProducts>) {
	if (!state.selectedBrand) return;

	const categories = getCategoriesByBrand(products, state.selectedBrand);
	if (!categories.length) {
		const msg = await bot.sendMessage(chatId, CATALOG_TEXTS.UNAVAILABLE);
		// setChatState(chatId, {messageIds: [msg.message_id]});
		registerBotMessage(chatId, msg.message_id);
		return;
	}

	const msg = await bot.sendMessage(chatId, CATALOG_TEXTS.CHOOSE_CATEGORY + state.selectedBrand + ":", {
		reply_markup: categoriesKeyboard(categories)
	});
	// setChatState(chatId, {messageIds: [msg.message_id]});
	registerBotMessage(chatId, msg.message_id);
}

export async function renderCatalogStep(bot: TelegramBot, chatId: number) {
	const state = getChatState(chatId);

	const products = getProducts(state.selectedBrand, state.selectedCategory);

	if (!products || products.length === 0) {
		await bot.sendMessage(chatId, CATALOG_TEXTS.UNAVAILABLE);
		return;
	}

	switch (state.catalogStep) {
		case "brands":
			await renderBrands(bot, chatId, products);
			break;

		case "categories":
			await renderCategories(bot, chatId, state, products);
			break;

		case "products":
			await renderProductsList(bot, chatId, products, { backToStep: "categories" });
			break;

		default:
			break;
	}
}
