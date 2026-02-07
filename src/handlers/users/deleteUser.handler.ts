import TelegramBot from "node-telegram-bot-api";
import { deleteUser } from "../../services/users.service";
import { setUserState } from "../../state/user.state";

export async function deleteUserInputHandler(
	bot: TelegramBot,
	chatId: number,
	text: string
) {
	const userIdToDelete = Number(text.trim());

	if (Number.isNaN(userIdToDelete)) {
		await bot.sendMessage(chatId, "❌ ID должен быть числом");
		return;
	}

	if (userIdToDelete === chatId) {
		await bot.sendMessage(chatId, "❌ Нельзя удалить самого себя");
		return;
	}

	try {
		await deleteUser(userIdToDelete);

		setUserState(chatId, { mode: "idle" });

		await bot.sendMessage(
			chatId,
			"✅ Пользователь успешно удалён"
		);
	} catch (error) {
		if (error instanceof Error) {
			switch (error.message) {
				case "USER_NOT_FOUND":
					await bot.sendMessage(chatId, "❌ Пользователь не найден");
					break;

				default:
					await bot.sendMessage(
						chatId,
						"❌ Не удалось удалить пользователя"
					);
			}
		}
	}
}