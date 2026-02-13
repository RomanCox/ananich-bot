import TelegramBot from "node-telegram-bot-api";
import { COMMON_TEXTS } from "../texts";
import { clearChatMessages } from "../utils";
import { ADMIN_TEXTS } from "../texts";
import { CALLBACK_TYPE } from "../types";
import { getChatState, registerBotMessage, setChatState } from "../state/chat.state";
import { SECTION } from "../types";
import { USERS_TEXTS } from "../texts";

export async function startXlsxUpload(bot: TelegramBot, chatId: number) {
	await clearChatMessages(bot, chatId);

	const msg = await bot.sendMessage(
		chatId,
		ADMIN_TEXTS.UPLOAD_XLSX_MESSAGE,
		{
			parse_mode: "Markdown",
			reply_markup: {
				inline_keyboard: [
					[
						{text: COMMON_TEXTS.BACK_BUTTON, callback_data: CALLBACK_TYPE.BACK},
					],
				],
			},
		},
	);

	const prevState = getChatState(chatId);

	setChatState(chatId, {
		section: SECTION.UPLOAD_XLSX,
		mode: "upload_xlsx",
		messageIds: [...(prevState.messageIds ?? []), msg.message_id]
	})
}

export async function startUserManagement(bot: TelegramBot, chatId: number) {
	await clearChatMessages(bot, chatId);

	const msg = await bot.sendMessage(
		chatId,
		ADMIN_TEXTS.MANAGE_USERS_MESSAGE,
		{
			parse_mode: "Markdown",
			reply_markup: {
				inline_keyboard: [
					[{text: ADMIN_TEXTS.ADD_USER_BTN, callback_data: CALLBACK_TYPE.ADD_USER}],
          [{text: ADMIN_TEXTS.DELETE_USER_BTN, callback_data: CALLBACK_TYPE.DELETE_USER}],
          [{text: ADMIN_TEXTS.EDIT_USER_BTN, callback_data: CALLBACK_TYPE.EDIT_USER}],
					[{text: ADMIN_TEXTS.USERS_LIST, callback_data: CALLBACK_TYPE.USERS_LIST}],
					[
						{text: COMMON_TEXTS.BACK_BUTTON, callback_data: CALLBACK_TYPE.BACK},
					],
				],
			},
		}
	);

	const prevState = getChatState(chatId);

	setChatState(chatId, {
		section: SECTION.MANAGE_USERS,
		messageIds: [...(prevState.messageIds?? []), msg.message_id]
	});
}

export async function addUser(bot: TelegramBot, chatId: number) {
	await clearChatMessages(bot, chatId);

	setChatState(chatId, {
		mode: "add_user",
		adminStep: "add_user",
	});

	const msg = await bot.sendMessage(
		chatId,
		USERS_TEXTS.ENTER_ID_USER_ADD,
		{
			reply_markup: {
				inline_keyboard: [[{
					text: COMMON_TEXTS.BACK_BUTTON, callback_data: CALLBACK_TYPE.BACK
				}]]
			}
		}
	);
	registerBotMessage(chatId, msg.message_id);

	return;
}

export async function deleteUser(bot: TelegramBot, chatId: number) {
	await clearChatMessages(bot, chatId);

	setChatState(chatId, {
		mode: "delete_user",
		adminStep: "delete_user",
	});

	const msg = await bot.sendMessage(
		chatId,
		USERS_TEXTS.ENTER_ID_USER_DELETE,
		{
			reply_markup: {
				inline_keyboard: [[{
					text: COMMON_TEXTS.BACK_BUTTON, callback_data: CALLBACK_TYPE.BACK
				}]]
			}
		}
	);
	registerBotMessage(chatId, msg.message_id);

	return;
}

export async function editUser(bot: TelegramBot, chatId: number) {
  await clearChatMessages(bot, chatId);

	setChatState(chatId, {
		mode: "edit_user",
		adminStep: "edit_user",
	});

  const msg = await bot.sendMessage(
    chatId,
    USERS_TEXTS.ENTER_ID_USER_EDIT,
		{
			reply_markup: {
				inline_keyboard: [[{
					text: COMMON_TEXTS.BACK_BUTTON, callback_data: CALLBACK_TYPE.BACK
				}]]
			}
		}
  );
  registerBotMessage(chatId, msg.message_id);

	return;
}