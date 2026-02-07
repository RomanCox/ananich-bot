import { InlineKeyboardMarkup } from "node-telegram-bot-api";
import { CALLBACK_TYPE, CATALOG_VALUE } from "../types/actions";
import { CATALOG_TEXTS } from "../texts/catalog.texts";
import { buildCallbackData } from "../utils/callbackBuilder";
import { COMMON_TEXTS } from "../texts/common.texts";

export function brandsKeyboard(brands: string[], options?: { showBack?: boolean }): InlineKeyboardMarkup {
	const keyboard = [];

	keyboard.push([
		{text: CATALOG_TEXTS.ALL, callback_data: buildCallbackData(CALLBACK_TYPE.BRAND, CATALOG_VALUE.ALL)},
	]);

	for (let i = 0; i < brands.length; i += 2) {
		keyboard.push(
			brands.slice(i, i + 2).map(brand => ({
				text: brand,
				callback_data: buildCallbackData(CALLBACK_TYPE.BRAND, brand),
			}))
		);
	}

	if (options?.showBack) {
		keyboard.push([
			{
				text: COMMON_TEXTS.BACK_BUTTON,
				callback_data: buildCallbackData(CATALOG_VALUE.BACK, CALLBACK_TYPE.CATALOG),
			},
		]);
	}

	keyboard.push(
		[{
			text: CATALOG_TEXTS.DOWNLOAD_CATALOG,
			callback_data: buildCallbackData(CALLBACK_TYPE.CATALOG, CALLBACK_TYPE.DOWNLOAD_XLSX)
		}]
	);

	return {inline_keyboard: keyboard};
}