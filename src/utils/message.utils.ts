import { Product } from "../types/product";

const TELEGRAM_MESSAGE_LIMIT = 4096;

export function splitMessage(lines: string[], limit = TELEGRAM_MESSAGE_LIMIT): string[] {
	const messages: string[] = [];
	let current = "";

	for (const line of lines) {
		if ((current + line + "\n").length > limit) {
			if (current) messages.push(current.trim());
			current = line + "\n";
		} else {
			current += line + "\n";
		}
	}

	if (current) messages.push(current.trim());
	return messages;
}

function buildLinesWithWordSplit(products: Product[]): string[] {
	const lines: string[] = [];
	let prevFirstWord: string | null = null;

	for (const product of products) {
		const firstWord = product.name.split(" ")[0];

		if (prevFirstWord && prevFirstWord !== firstWord) {
			lines.push(""); // пустая строка
		}

		lines.push(formatProductLine(product));
		prevFirstWord = firstWord;
	}

	return lines;
}

function formatProductLine(product: Product): string {
	const name = product.name
	const price = product.price
	const country = product.country ?? ""

	return `${name} - ${price} ${country}`.trim()
}

function extractStorage(product: Product): string {
	let rest = product.name;

	if (product.brand) {
		rest = rest.replace(product.brand, "").trim();
	}

	if (product.model) {
		rest = rest.replace(product.model, "").trim();
	}

	return rest.split(" ")[0] ?? "";
}

export function buildMessages(products: Product[]): string[] {
	const messages: string[] = [];

	let currentMessage = "";
	let currentBrand: string | null = null;
	let currentCategory: string | null = null;

	let prevModel: string | null = null;
	let prevStorage: string | null = null;

	for (const product of products) {
		const brand = product.brand ?? "";
		const category = product.category ?? "";

		// новый бренд или категория → новое сообщение
		if (
			currentBrand !== brand ||
			currentCategory !== category
		) {
			if (currentMessage) {
				messages.push(currentMessage.trim());
			}

			currentMessage = "";
			currentBrand = brand;
			currentCategory = category;
			prevModel = null;
			prevStorage = null;
		}

		const model = product.model ?? "";
		const storage = extractStorage(product);

		// пустая строка при смене модели или памяти
		if (
			currentMessage &&
			(
				(prevModel && model !== prevModel) ||
				(prevStorage && storage !== prevStorage)
			)
		) {
			currentMessage += "\n";
		}

		const line = formatProductLine(product);

		// проверка лимита Telegram
		if ((currentMessage + line + "\n").length > 4096) {
			messages.push(currentMessage.trim());
			currentMessage = "";
			prevModel = null;
			prevStorage = null;
		}

		currentMessage += line + "\n";

		prevModel = model;
		prevStorage = storage;
	}

	if (currentMessage) {
		messages.push(currentMessage.trim());
	}

	return messages;
}
