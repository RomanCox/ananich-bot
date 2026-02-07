import TelegramBot from "node-telegram-bot-api";

export type PaginationRenderer<T> = (item: T) => {
	text: string;
	options?: TelegramBot.SendMessageOptions;
}