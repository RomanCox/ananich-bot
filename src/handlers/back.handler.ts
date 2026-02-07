import TelegramBot from "node-telegram-bot-api";
import { getChatState, setChatState } from "../state/chat.state";
import { SECTION } from "../types/navigation";
import { clearChatMessages } from "../utils/clearChatMessages";
import { setUserState } from "../state/user.state";
import { startUserManagement } from "../services/admin.service";

export async function handleBack(bot: TelegramBot, chatId: number, messageId?: number) {
	const state = getChatState(chatId);

	await clearChatMessages(bot, chatId);

	if (state.section === SECTION.UPLOAD_XLSX) {
		setUserState(chatId, {
			mode: "idle",
		});
		setChatState(chatId, { section: SECTION.MAIN });
		return;
	}

	if (state.section === SECTION.MANAGE_USERS) {
		if (state.adminStep === "users_list") {
			setChatState(chatId, { adminStep: "main" });
			await startUserManagement(bot, chatId);
			return;
		}

		setChatState(chatId, { section: SECTION.MAIN });
		return;
	}

	if (state.section === SECTION.CATALOG) {
		switch (state.catalogStep) {
			case "brands":
				setChatState(chatId, {
					section: SECTION.MAIN,
					catalogStep: undefined,
				});
				return;

			case "categories":
				setChatState(chatId, {
					section: SECTION.CATALOG,
					catalogStep: "brands",
					selectedBrand: undefined,
				});
				return;

			case "products":
				setChatState(chatId, {
					catalogStep: "categories",
					selectedCategory: undefined,
				});
				return;
		}
	}
}
