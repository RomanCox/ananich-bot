import TelegramBot from "node-telegram-bot-api";
import { deleteUser } from "../../services/users.service";
import { USERS_ERRORS, USERS_TEXTS } from "../../texts";
import { registerBotMessage, setChatState } from "../../state/chat.state";
import { COMMON_TEXTS } from "../../texts";
import { CALLBACK_TYPE } from "../../types";

export async function deleteUserInputHandler(
	bot: TelegramBot,
	chatId: number,
	text: string
) {
	const userIdToDelete = Number(text.trim());

	if (Number.isNaN(userIdToDelete)) {
		const msg = await bot.sendMessage(chatId, USERS_ERRORS.ID_NUMBER);
		registerBotMessage(chatId, msg.message_id);

		return;
	}

	if (userIdToDelete === chatId) {
		const msg = await bot.sendMessage(chatId, USERS_ERRORS.DELETE_MYSELF);
		registerBotMessage(chatId, msg.message_id);

		return;
	}

	let msg;

	try {
		await deleteUser(userIdToDelete);

		setChatState(chatId, { mode: "idle" });

		msg = await bot.sendMessage(
			chatId,
      USERS_TEXTS.DELETE_SUCCESSFUL,
			{
				reply_markup: {
					inline_keyboard: [[{ text: COMMON_TEXTS.BACK_BUTTON, callback_data: CALLBACK_TYPE.BACK }]]
				}
			}
		);
	} catch (error) {
		if (error instanceof Error) {
			switch (error.message) {
				case USERS_ERRORS.USER_NOT_FOUND:
					msg = await bot.sendMessage(chatId, USERS_ERRORS.USER_NOT_FOUND_MESSAGE,
						{
							reply_markup: {
								inline_keyboard: [[{
									text: COMMON_TEXTS.BACK_BUTTON,
									callback_data: CALLBACK_TYPE.BACK,
								}]]
							},
						});
					break;

				default:
					msg = await bot.sendMessage(
						chatId,
						USERS_ERRORS.CANT_DELETE_USER,
					);
					break;
			}
		}
	}

	if (msg) {
		registerBotMessage(chatId, msg.message_id);
	}
}