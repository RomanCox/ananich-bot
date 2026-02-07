import TelegramBot from "node-telegram-bot-api";
import { isAdmin } from "../../services/users.service";
import { START_TEXTS } from "../../texts/start.texts";
import { adminKeyboard } from "../../keyboards";
import { setChatState } from "../../state/chat.state";

export async function renderAdminPanel(
	bot: TelegramBot,
	chatId: number,
) {
	let navMsg

	if (isAdmin(chatId)) {
		navMsg = await bot.sendMessage(chatId, START_TEXTS.ADMIN_PANEL, {
			reply_markup: adminKeyboard(),
		});
	} else {
		navMsg = await bot.sendMessage(chatId, START_TEXTS.SELECT_ACTION);
	}

	setChatState(chatId, {
		inlineMessageId: navMsg.message_id,
	});
}