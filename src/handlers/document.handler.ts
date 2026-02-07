import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import { getUserState, setUserState } from "../state/user.state";
import { parseXlsxToProducts } from "../services/xlsx.service";
import { saveProducts } from "../services/products.service";
import { isAdmin } from "../services/users.service";
import { registerBotMessage, setChatState } from "../state/chat.state";


export function registerDocumentHandler(bot: TelegramBot) {
	bot.on("document", async (query) => {
		if (!query.from) return;

		const userId = query.from.id;
		const chatId = query.chat.id;
		const state = getUserState(userId);

		if (!isAdmin(chatId)) return;

		if (state.mode !== "upload_xlsx") {
			const msg = await bot.sendMessage(query.chat.id, "⛔ Сейчас я не жду файл");
			registerBotMessage(chatId, msg.message_id);
			return;
		}

		const document = query.document;
		if (!document) {
			const msg = await bot.sendMessage(chatId, "❌ Файл не найден");
			registerBotMessage(chatId, msg.message_id);
			return;
		}

		try {
			const tmpDir = path.resolve("tmp");
			if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

			const filePath = await bot.downloadFile(document.file_id, tmpDir);
			const buffer = fs.readFileSync(filePath);

			const products = parseXlsxToProducts(buffer);

			if (!products.length) {
				const msg = await bot.sendMessage(chatId, "❌ Файл не содержит валидных товаров");
				registerBotMessage(chatId, msg.message_id);
				return;
			}

			saveProducts(products);

			const msg = await bot.sendMessage(
				chatId,
				`✅ Прайс успешно загружен\nТоваров: ${products.length}`
			);
			registerBotMessage(chatId, msg.message_id);

			setUserState(userId, { mode: "idle" });
		} catch (error) {
			console.error("❌ XLSX upload error:", error);
			await bot.sendMessage(chatId, "❌ Ошибка при обработке файла");
		}
	});
}