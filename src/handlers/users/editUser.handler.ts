import TelegramBot from "node-telegram-bot-api";
import { isAdmin, isSuperAdmin } from "../../services/users.service";
import { setUserState } from "../../state/user.state";
import { ROLE_LABELS, USERS_ERRORS, USERS_TEXTS } from "../../texts/users.texts";
import { UserRole } from "../../types/user";

function editUserRoleKeyboard(isSuperAdmin: boolean) {
	const buttons: UserRole[] = isSuperAdmin
		? ["retail", "wholesale", "admin", "superadmin"]
		: ["retail", "wholesale"];

	return {
		inline_keyboard: buttons.map(role => [
			{
				text: ROLE_LABELS[role],
				callback_data: `EDIT_USER_ROLE:${role}`,
			},
		]),
	};
}

export async function editUserInputHandler(
	bot: TelegramBot,
	chatId: number,
	text: string
) {
	const userIdToEdit = Number(text.trim());

	if (Number.isNaN(userIdToEdit)) {
		await bot.sendMessage(chatId, USERS_ERRORS.ID_NUMBER);
		return;
	}

	if (userIdToEdit === chatId) {
		await bot.sendMessage(chatId, USERS_ERRORS.EDIT_MYSELF);
		return;
	}

  if (!isAdmin(chatId)) {
    await bot.sendMessage(chatId, USERS_ERRORS.ONLY_ADMIN);
    return;
  }

	setUserState(chatId, {
		mode: "edit_user",
		editingUserId: userIdToEdit,
	});

	const isSuperAdminUser = isSuperAdmin(chatId);

	await bot.sendMessage(
		chatId,
		USERS_TEXTS.CHOOSE_ROLE,
		{
			reply_markup: editUserRoleKeyboard(isSuperAdminUser),
		}
	)
}