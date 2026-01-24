import TelegramBot from "node-telegram-bot-api";

export function createBot() {
	return new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
		polling: true,
	});
}