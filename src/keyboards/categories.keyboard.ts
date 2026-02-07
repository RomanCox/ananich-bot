import { InlineKeyboardMarkup } from "node-telegram-bot-api";
import { CALLBACK_TYPE, CATALOG_VALUE } from "../types/actions";
import { COMMON_TEXTS } from "../texts/common.texts";
import { CATALOG_TEXTS } from "../texts/catalog.texts";
import { buildCallbackData } from "../utils/callbackBuilder";

export function categoriesKeyboard(categories: string[]): InlineKeyboardMarkup {
	const keyboard: InlineKeyboardMarkup["inline_keyboard"] = [];

	keyboard.push([
		{text: CATALOG_TEXTS.ALL, callback_data: buildCallbackData(CALLBACK_TYPE.CATEGORY, CATALOG_VALUE.ALL)},
	]);

	for (let i = 0; i < categories.length; i += 2) {
		keyboard.push(
			categories.slice(i, i + 2).map(cat => ({
				text: cat,
				callback_data: buildCallbackData(CALLBACK_TYPE.CATEGORY, cat),
			}))
		);
	}

	keyboard.push(
		[{text: COMMON_TEXTS.BACK_BUTTON, callback_data: buildCallbackData(CATALOG_VALUE.BACK, CALLBACK_TYPE.CATALOG)}],
		[{text: CATALOG_TEXTS.DOWNLOAD_CATALOG, callback_data: buildCallbackData(CALLBACK_TYPE.CATALOG, CALLBACK_TYPE.DOWNLOAD_XLSX)}]
	);

	return {inline_keyboard: keyboard};
}