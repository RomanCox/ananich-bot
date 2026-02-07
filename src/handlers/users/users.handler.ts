import TelegramBot from "node-telegram-bot-api";
import { getAllUsers } from "../../services/users.service";
import { paginationKeyboard } from "../../utils/pagination";
import { getChatState, setChatState } from "../../state/chat.state";
import { clearChatMessages } from "../../utils/clearChatMessages";
import { CALLBACK_TYPE } from "../../types/actions";

const USERS_PER_PAGE = 5;

export async function openUsersList(
	bot: TelegramBot,
	chatId: number
) {
	const users = getAllUsers();
	const totalPages = Math.max(
		1,
		Math.ceil(users.length / USERS_PER_PAGE)
	);

	setChatState(chatId, {
		page: 1,
		totalPages,
	});

	await clearChatMessages(bot, chatId);
	await showUsersList(bot, chatId);
}

export async function showUsersList(
	bot: TelegramBot,
	chatId: number
) {
	const state = getChatState(chatId);
	const page = state.page ?? 1;

	const users = getAllUsers();
	const totalPages = Math.max(
		1,
		Math.ceil(users.length / USERS_PER_PAGE)
	);

	setChatState(chatId, {
		adminStep: "users_list",
		page,
		totalPages,
		messageIds: [],
	});

	const start = (page - 1) * USERS_PER_PAGE;
	const slice = users.slice(start, start + USERS_PER_PAGE);

	for (let i = 0; i < slice.length; i++) {
		const user = slice[i];
		const isLast = i === slice.length - 1;

		const text = `👤 Пользователь:\n` +
				`🆔 <code>${user.id}</code>\n` +
				`🔐 <b>${user.role}</b>`;

		const msg = await bot.sendMessage(
			chatId,
			text,
			isLast
				? {
					parse_mode: "HTML",
					reply_markup: paginationKeyboard(
						page,
						totalPages,
						CALLBACK_TYPE.USERS_LIST
					),
				}
				: { parse_mode: "HTML", },
		);

		const currentState = getChatState(chatId);
		setChatState(chatId, {
			messageIds: [...(currentState.messageIds ?? []), msg.message_id],
		});
	}
}