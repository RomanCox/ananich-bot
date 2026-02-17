import TelegramBot from "node-telegram-bot-api";
import { getProductById, getProducts } from "../services/products.service";
import {
	getBrands,
	getCategories,
	getModels,
	getStorageValues
} from "../utils";
import { getChatState, registerBotMessage } from "../state/chat.state";
import { brandsKeyboard } from "../keyboards";
import { CART_TEXTS, CATALOG_TEXTS } from "../texts";
import { categoriesKeyboard } from "../keyboards";
import { Product, ProductForCart, SECTION } from "../types";
import { isAdmin } from "../services/users.service";
import { renderProductsList } from "../render/renderProductsList";
import { cartRootKeyboard } from "../keyboards";
import { modelsKeyboard } from "../keyboards";
import { storageValuesKeyboard } from "../keyboards";
import { choosingProductKeyboard } from "../keyboards";
import { choosingAmountKeyboard } from "../keyboards";
import { editCartKeyboard } from "../keyboards/editCart.keyboard";
import { getCurrency } from "../services/price.service";
import { editProductInCartKeyboard } from "../keyboards/editProductInCart.keyboard";

async function renderRoot(bot: TelegramBot, chatId: number) {
	const state = getChatState(chatId);

	const buildText = (order: ProductForCart[] = []) => {
		if (!order.length) {
			return (
				CART_TEXTS.CART_TITLE +
				"\n\n" +
				CART_TEXTS.EMPTY_CART
			);
		}
		const currency = getCurrency(chatId);

		let totalSum = 0;

		const lines = order.map((item, index) => {
			const price = Number(item.price);
			const amount = item.amount;
			const country = item.country ?? "";

			const itemTotal = price * amount;
			totalSum += itemTotal;

			return (
				`${index + 1}. <i>${item.name}</i>\n` +
				`  📦 ${amount} шт. × ${price} ${currency} ${country} = ${itemTotal} ${currency}`
			);
		});

		return (
			CART_TEXTS.CART_TITLE +
			"\n\n" +
			lines.join("\n\n") +
			"\n\n" +
			`💰 Итого: ${totalSum} ${currency}`
		);
	};

	const msg = await bot.sendMessage(chatId, buildText(state.currentOrder), {
		parse_mode: "HTML",
		reply_markup: cartRootKeyboard(state.currentOrder, {
			showBack: isAdmin(chatId),
		}),
	});

	registerBotMessage(chatId, msg.message_id);
}

async function renderEditCart (bot: TelegramBot, chatId: number) {
	const state = getChatState(chatId);

	const buildText = (order: ProductForCart[] = []) => {
		if (!order.length) {
			return CART_TEXTS.EMPTY_CART;
		}

		const lines = order.map((item, index) => {
			const amount = item.amount;

			return `🔷 ${index + 1}. ${item.name} × ${amount}`;
		});

		return (
			CART_TEXTS.EDIT_CART +
			lines.join("\n") +
			"\n\n" +
			CART_TEXTS.EDIT_CART_DESCRIPTION
		);
	};

	const msg = await bot.sendMessage(chatId, buildText(state.currentOrder), {
		parse_mode: "HTML",
		reply_markup: editCartKeyboard(chatId),
	});
	registerBotMessage(chatId, msg.message_id);
	return;
}

async function renderEditProductInCart (bot: TelegramBot, chatId: number) {
	const state = getChatState(chatId);
	const product = state.currentOrder?.find(({ id } ) => id === state.selectedProductIdForCart);

	const buildText = (product: ProductForCart | undefined) => {
		if (!state.currentOrder?.length || !product) {
			return CART_TEXTS.ERROR_PRODUCT_IN_CART;
		}

		const currency = getCurrency(chatId);

		return (
			`🛍 <b>${product.name}</b>\n` +
			CART_TEXTS.CART_PRICE + product.price + " " + currency +
			CART_TEXTS.PRODUCT_AMOUNT + product.amount +
			CART_TEXTS.EDIT_PRODUCT_IN_CART +
			CART_TEXTS.INCREASE_AMOUNT +
			(product.amount > 1 ? "\n" + CART_TEXTS.DECREASE_AMOUNT : "") +
			CART_TEXTS.CHANGE_AMOUNT +
			CART_TEXTS.DELETE_PRODUCT_FROM_CART
		)
	}

	const msg = await bot.sendMessage(chatId, buildText(product), {
		parse_mode: "HTML",
		reply_markup: editProductInCartKeyboard(chatId),
	});
	registerBotMessage(chatId, msg.message_id);
}

async function renderBrands(bot: TelegramBot, chatId: number) {
	const state = getChatState(chatId);

	const products = getProducts(chatId);
	const brands = getBrands(products);
	if (!brands.length) {
		const msg = await bot.sendMessage(chatId, CATALOG_TEXTS.UNAVAILABLE);
		registerBotMessage(chatId, msg.message_id);
		return;
	}

	const msg = await bot.sendMessage(chatId, CATALOG_TEXTS.CHOOSE_BRAND, {
		reply_markup: brandsKeyboard(brands, { withAllBtn: state.section === SECTION.CATALOG, withDownloadBtn: state.section === SECTION.CATALOG, showBack: isAdmin(chatId) }),
	});
	registerBotMessage(chatId, msg.message_id);
}

async function renderCategories(bot: TelegramBot, chatId: number) {
	const state = getChatState(chatId);
	const products = getProducts(chatId, {brand: state.selectedBrand});

	const categories = getCategories(products, state.selectedBrand);

	if (!state.selectedBrand || !categories.length) {
		const msg = await bot.sendMessage(chatId, CATALOG_TEXTS.UNAVAILABLE);
		registerBotMessage(chatId, msg.message_id);
		return;
	}

	const text = state.section === SECTION.CATALOG
		? CATALOG_TEXTS.CHOOSE_CATEGORY + state.selectedBrand + ":"
		: CART_TEXTS.YOU_CHOOSE + CART_TEXTS.CHOSE_BRAND + state.selectedBrand;

	const msg = await bot.sendMessage(chatId, text, {
		parse_mode: "HTML",
		reply_markup: categoriesKeyboard(categories, { withAllBtn: state.section === SECTION.CATALOG, withDownloadBtn: state.section === SECTION.CATALOG })
	});
	registerBotMessage(chatId, msg.message_id);
}

async function renderModels(bot: TelegramBot, chatId: number) {
	const state = getChatState(chatId);
	const products = getProducts(chatId, {
		brand: state.selectedBrand,
		category: state.selectedCategory,
	});

	const models = getModels(products, state.selectedBrand, state.selectedCategory);

	if (!state.selectedBrand || !state.selectedCategory || !models.length) {
		const msg = await bot.sendMessage(chatId, CATALOG_TEXTS.UNAVAILABLE);
		registerBotMessage(chatId, msg.message_id);
		return;
	}

	const text =
		CART_TEXTS.YOU_CHOOSE +
		CART_TEXTS.CHOSE_BRAND +
		`<b>${state.selectedBrand}</b>` +
		CART_TEXTS.CHOSE_CATEGORY +
		`<b>${state.selectedCategory}</b>` +
		CART_TEXTS.CHOOSE_MODEL;

	const msg = await bot.sendMessage(chatId, text, {
		parse_mode: "HTML",
		reply_markup: modelsKeyboard(models),
	});
	registerBotMessage(chatId, msg.message_id);
}

async function renderStorage(bot: TelegramBot, chatId: number) {
	const state = getChatState(chatId);
	const products = getProducts(chatId, {
		brand: state.selectedBrand,
		category: state.selectedCategory,
		model: state.selectedModel,
	});

	const storageValues = getStorageValues(
		products, state.selectedBrand, state.selectedCategory, state.selectedModel
	);

	if (
		!state.selectedBrand ||
		!state.selectedCategory ||
		!state.selectedModel ||
		!storageValues.length
	) {
		const msg = await bot.sendMessage(chatId, CATALOG_TEXTS.UNAVAILABLE);
		registerBotMessage(chatId, msg.message_id);
		return;
	}

	const text =
		CART_TEXTS.YOU_CHOOSE +
		CART_TEXTS.CHOSE_BRAND +
		`<b>${state.selectedBrand}</b>` +
		CART_TEXTS.CHOSE_CATEGORY +
		`<b>${state.selectedCategory}</b>` +
		CART_TEXTS.CHOSE_MODEL +
		`<b>${state.selectedModel}</b>` +
		CART_TEXTS.CHOOSE_STORAGE;

	const msg = await bot.sendMessage(chatId, text, {
		parse_mode: "HTML",
		reply_markup: storageValuesKeyboard(storageValues),
	});
	registerBotMessage(chatId, msg.message_id);
}

async function renderChoosingProduct(bot: TelegramBot, chatId: number) {
	const state = getChatState(chatId);
	const products = getProducts(chatId, {
		brand: state.selectedBrand,
		category: state.selectedCategory,
		model: state.selectedModel,
		storage: state.selectedStorage
	});

	if (
		!state.selectedBrand ||
		!state.selectedCategory ||
		!state.selectedModel ||
		!state.selectedStorage ||
		!products.length
	) {
		const msg = await bot.sendMessage(chatId, CATALOG_TEXTS.UNAVAILABLE);
		registerBotMessage(chatId, msg.message_id);
		return;
	}

	const buildText = (products: Product[]) => {
		const lines = products.map((item, index) => {
			const price = Number(item.price);
			const country = item.country ?? "";

			return (
				`${index + 1}. ${item.name} - ${price} ${country}`
			);
		});

		return (
			CART_TEXTS.YOU_CHOOSE +
			CART_TEXTS.CHOSE_BRAND +
			`<b>${state.selectedBrand}</b>` +
			CART_TEXTS.CHOSE_CATEGORY +
			`<b>${state.selectedCategory}</b>` +
			CART_TEXTS.CHOSE_MODEL +
			`<b>${state.selectedModel}</b>` +
			CART_TEXTS.CHOSE_STORAGE +
			`<b>${state.selectedStorage}</b>` +
			CART_TEXTS.CHOOSE_PRODUCT +
			lines.join("\n")
		);
	};

	const msg = await bot.sendMessage(chatId, buildText(products), {
		parse_mode: "HTML",
		reply_markup: choosingProductKeyboard(chatId, products),
	});
	registerBotMessage(chatId, msg.message_id);
}

async function renderAmount(bot: TelegramBot, chatId: number) {
	const state = getChatState(chatId);
	const product = getProductById(chatId, state.selectedProductId);

	if (!state.selectedBrand || !product) {
		const msg = await bot.sendMessage(chatId, CART_TEXTS.PRODUCT_UNAVAILABLE);
		registerBotMessage(chatId, msg.message_id);
		return;
	}

	const text =
		`${product.name}\n` +
		CART_TEXTS.CART_PRICE +
		product.price +
		product.country + "\n" +
		CART_TEXTS.CHOOSE_AMOUNT

	const msg = await bot.sendMessage(chatId, text, {
		parse_mode: "HTML",
		reply_markup: choosingAmountKeyboard(),
	});
	registerBotMessage(chatId, msg.message_id);
}

export async function renderFlow(bot: TelegramBot, chatId: number) {
	const state = getChatState(chatId);

	const products = getProducts(chatId, {
		brand: state.selectedBrand,
		category: state.selectedCategory,
	});

	if (!products || products.length === 0) {
		await bot.sendMessage(chatId, CATALOG_TEXTS.UNAVAILABLE);
		return;
	}

	switch (state.flowStep) {
		case "main": {
			await renderRoot(bot, chatId);
			break;
		}

		case "brands":
			await renderBrands(bot, chatId);
			break;

		case "categories":
			await renderCategories(bot, chatId);
			break;

		case "products":
			await renderProductsList(bot, chatId);
			break;

		case "models":
			await renderModels(bot, chatId);
			break;

		case "storage":
			await renderStorage(bot, chatId);
			break;

		case "products_for_cart":
			await renderChoosingProduct(bot, chatId);
			break;

		case "amount":
			await renderAmount(bot, chatId);
			break;

		case "edit_cart":
			await renderEditCart(bot, chatId);
			break;

		case "edit_product_in_cart":
			await renderEditProductInCart(bot, chatId);
			break;

		default:
			break;
	}
}
