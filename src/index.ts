import "dotenv/config";
import { createBot } from "./bot";
import { getSheet } from "./sheets";

const bot = createBot();

bot.onText(/\/start/, (msg) => {
	bot.sendMessage(msg.chat.id, "pnpm + Google Sheets + Telegram 🚀");
});

bot.onText(/\/data/, async (msg) => {
	const rows = await getSheet("Товары!A2:B10");

	const text = rows.length
		? rows.map(r => r.join(" — ")).join("\n")
		: "Данных нет";

	bot.sendMessage(msg.chat.id, text);
});
