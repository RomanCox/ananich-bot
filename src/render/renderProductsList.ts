import TelegramBot from "node-telegram-bot-api";
import { buildMessages } from "../utils/message.utils";
import { COMMON_TEXTS } from "../texts/common.texts";
import { buildCallbackData } from "../utils/callbackBuilder";
import { CALLBACK_TYPE } from "../types/actions";
import { setChatState } from "../state/chat.state";
import { CATALOG_TEXTS } from "../texts/catalog.texts";
import { Product } from "../types/product";

interface RenderProductsListOptions {
	backToStep: "brands" | "categories";
}

export async function renderProductsList(
	bot: TelegramBot,
	chatId: number,
	products: Product[],
	options: RenderProductsListOptions,
) {
	if (!products.length) {
		await bot.sendMessage(chatId, CATALOG_TEXTS.UNAVAILABLE);
		return;
	}

	const parts = buildMessages(products);

	const sentIds: number[] = [];

	for (const part of parts) {
		const msg = await bot.sendMessage(chatId, part);
		sentIds.push(msg.message_id);
	}

	await bot.editMessageReplyMarkup(
		{
			inline_keyboard: [[
				{
					text: COMMON_TEXTS.BACK_BUTTON,
					callback_data: buildCallbackData(CALLBACK_TYPE.BACK),
				},
			]],
		},
		{
			chat_id: chatId,
			message_id: sentIds[sentIds.length - 1],
		}
	);

	setChatState(chatId, {
		messageIds: sentIds,
		catalogStep: options.backToStep,
	});
}