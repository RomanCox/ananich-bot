import TelegramBot from "node-telegram-bot-api";
import { buildMessages } from "../utils";
import { CALLBACK_TYPE } from "../types";
import { CATALOG_TEXTS } from "../texts";
import { getProducts } from "../services/products.service";
import { getChatState } from "../state/chat.state";

export async function renderProductsList(
	bot: TelegramBot,
	chatId: number,
) {
	const state = getChatState(chatId);
	const products = getProducts(chatId, {
		brand: state.selectedBrand,
		category: state.selectedCategory,
	});

	if (!products.length) {
		await bot.sendMessage(chatId, CATALOG_TEXTS.UNAVAILABLE,);
		return;
	}

	const parts = buildMessages(products);

	for (const part of parts) {
		await bot.sendMessage(chatId, part, {
			reply_markup: {
				inline_keyboard: [[{
					text: CATALOG_TEXTS.DOWNLOAD_CATALOG,
					callback_data: CALLBACK_TYPE.DOWNLOAD_XLSX,
				}]]
			}
		});
	}
}