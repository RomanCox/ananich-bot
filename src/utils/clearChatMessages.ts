import TelegramBot from "node-telegram-bot-api";
import { getChatState, setChatState } from "../state/chat.state";

export async function clearChatMessages(
	bot: TelegramBot,
	chatId: number,
) {
	const state = getChatState(chatId);

	const ids = [
		state.inlineMessageId,
		state.replyMessageId,
		...(state.messageIds ?? []),
	].filter(Boolean);

	for (const id of ids) {
		await bot
			.deleteMessage(chatId, id!)
			.catch(err => {
				console.error(
					"❌ deleteMessage failed",
					id,
					err.response?.body || err.message
				);
		});
	}

	setChatState(chatId, {
		inlineMessageId: undefined,
		replyMessageId: undefined,
		messageIds: [],
	});
}