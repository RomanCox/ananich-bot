import TelegramBot from "node-telegram-bot-api";
import { CALLBACK_TYPE, CATALOG_VALUE, Product, ProductForCart, SECTION, UserRole } from "../types";
import { getChatState, registerBotMessage, setChatState } from "../state/chat.state";
import { renderFlow } from "./renderFlow";
import { parseCallbackData, removeNavigationMessage } from "../utils";
import { handleBack } from "./back.handler";
import { addUser, deleteUser, editUser, startUserManagement, startXlsxUpload } from "../services/admin.service";
import { renderAdminPanel } from "./main/renderAdminPanel";
import { clearChatMessages } from "../utils";
import { getProductById, getProducts, tempExports } from "../services/products.service";
import { renderProductsList } from "../render/renderProductsList";
import { openUsersList, showUsersList } from "./users/users.handler";
import { CART_TEXTS, COMMON_TEXTS, PAGINATION_TEXTS, USERS_ERRORS, USERS_TEXTS } from "../texts";
import { createUser, updateUserRole } from "../services/users.service";
import { sendPriceList } from "../services/xlsx.service";
import { editPriceFormation } from "../services/price.service";
import { buildOrderMessage, createOrder } from "../services/orders.service";

const ADMIN_CHAT_ID = Number(process.env.ADMIN_CHAT_ID);

export function registerCallbacks(bot: TelegramBot) {
	bot.on("callback_query", async (query) => {
		const chatId = query.message?.chat.id;
		const data = query.data;

		if (!chatId || !data) return;

		await bot.answerCallbackQuery(query.id);

		const {action, params} = parseCallbackData(data);

		switch (action) {
			case CALLBACK_TYPE.BACK: {
				await handleBack(bot, chatId);
				const nextState = getChatState(chatId);

				if (nextState.section === SECTION.MAIN) {
					await renderAdminPanel(bot, chatId);
					return;
				}

				if (nextState.section === SECTION.CATALOG) {
					setChatState(chatId, { selectedCategory: undefined });
					await renderFlow(bot, chatId);
					return;
				}

				if (nextState.section === SECTION.CART) {
					await renderFlow(bot, chatId);
					return;
				}

				return;
			}

			case CALLBACK_TYPE.UPLOAD_XLSX: {
				await startXlsxUpload(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.MANAGE_USERS: {
				await startUserManagement(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.USERS_LIST: {
				const paramValue = params[0];

				if (!paramValue) {
					await openUsersList(bot, chatId);
					return;
				}

				if (paramValue === "goto") {
					setChatState(chatId, { mode: "await_page_number" });
					await bot.sendMessage(chatId, PAGINATION_TEXTS.ENTER_PAGE_NUMBER);
					return;
				}

				const state = getChatState(chatId);
				let newPage = state.page ?? 1;
				if (paramValue === "next") newPage++;
				if (paramValue === "prev") newPage--;

				setChatState(chatId, {
					page: newPage,
				});

				await clearChatMessages(bot, chatId);
				await showUsersList(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.ADD_USER: {
				await addUser(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.DELETE_USER: {
				await deleteUser(bot, chatId);
				return;
			}

      case CALLBACK_TYPE.EDIT_USER: {
				await editUser(bot, chatId);
				return;
      }

			case CALLBACK_TYPE.ROLE_FOR_NEW_USER: {
				const role = params[0] as UserRole;
				const state = getChatState(chatId);

				if (!state.newUserId) {
					await bot.sendMessage(chatId, USERS_ERRORS.USER_NOT_CHOOSE_MESSAGE);
					return;
				}

				await createUser({ id: state.newUserId, role });

				setChatState(chatId, { mode: "idle" });

				await clearChatMessages(bot, chatId);

				const msg = await bot.sendMessage(chatId, USERS_TEXTS.ADD_SUCCESSFUL, {
					reply_markup: {
						inline_keyboard: [[{ text: COMMON_TEXTS.BACK_BUTTON, callback_data: CALLBACK_TYPE.BACK }]]
					}
				});
				registerBotMessage(chatId, msg.message_id);
				return;
			}

      case CALLBACK_TYPE.NEW_ROLE_FOR_EXIST_USER: {
        const role = params[0] as UserRole;
        const state = getChatState(chatId);

        if (!state.editingUserId) {
          await bot.sendMessage(chatId, USERS_ERRORS.USER_NOT_CHOOSE_MESSAGE);
          return;
        }

        await updateUserRole(state.editingUserId, role);

        setChatState(chatId, { mode: "idle" });

				await clearChatMessages(bot, chatId);

        const msg = await bot.sendMessage(
          chatId,
          USERS_TEXTS.ROLE_RENEWED + role,
          {
            reply_markup: {
              inline_keyboard: [[{ text: COMMON_TEXTS.BACK_BUTTON, callback_data: CALLBACK_TYPE.BACK }]]
            }
          }
        );
        registerBotMessage(chatId, msg.message_id);
        return;
      }

			case CALLBACK_TYPE.EDIT_RUB_TO_BYN: {
				await editPriceFormation(bot, chatId, "edit_rub_to_byn");
				return;
			}

			case CALLBACK_TYPE.EDIT_RUB_TO_USD: {
				await editPriceFormation(bot, chatId, "edit_rub_to_usd");
				return;
			}

			case CALLBACK_TYPE.EDIT_RETAIL_MULT: {
				await editPriceFormation(bot, chatId, "edit_retail_mult");
				return;
			}

			case CALLBACK_TYPE.EDIT_WHOLESALE_MULT: {
				await editPriceFormation(bot, chatId, "edit_wholesale_mult");
				return;
			}

			case CALLBACK_TYPE.BRAND: {
				await clearChatMessages(bot, chatId);

				const [brandValue] = params;

				if (brandValue === CATALOG_VALUE.ALL) {
					await renderProductsList(bot, chatId);

					return;
				}

				setChatState(chatId, {
					flowStep: "categories",
					selectedBrand: brandValue,
					selectedCategory: undefined,
				});

				await renderFlow(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.CATEGORY: {
				await clearChatMessages(bot, chatId);

				const [categoryValue] = params;

				const selectedCategory = categoryValue !== CATALOG_VALUE.ALL ? categoryValue : undefined;

				const state = getChatState(chatId);

				const nextStep = state.section === SECTION.CATALOG ? "products" : "models";

				setChatState(chatId, {
					flowStep: nextStep,
					selectedCategory,
				});

				if (state.section === SECTION.CATALOG) {
					await renderProductsList(bot, chatId);
					return;
				}

				if (state.section === SECTION.CART) {
					await renderFlow(bot, chatId);
					return;
				}
				return;
			}

			case CALLBACK_TYPE.MODEL: {
				await clearChatMessages(bot, chatId);

				const [modelValue] = params;

				setChatState(chatId, {
					flowStep: "storage",
					selectedModel: modelValue,
				});

				await renderFlow(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.STORAGE: {
				await clearChatMessages(bot, chatId);

				const [storageValue] = params;

				setChatState(chatId, {
					flowStep: "products_for_cart",
					selectedStorage: storageValue,
				});

				await renderFlow(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.DOWNLOAD_XLSX: {
        const productIds = tempExports.get(params[0]) || [];
        const productsToExport = productIds
          .map(id => getProductById(chatId, id))
          .filter(Boolean) as Product[];

        if (!productsToExport.length) {
          await bot.sendMessage(chatId, "Товары для экспорта не найдены.");
          return;
        }

				await sendPriceList(bot, chatId, productsToExport);
				return;
			}

			case CALLBACK_TYPE.ADD_ITEM_TO_CART: {
				await clearChatMessages(bot, chatId);

				setChatState(chatId, {
					section: SECTION.CART,
					flowStep: "brands",
					selectedBrand: undefined,
					selectedCategory: undefined,
					selectedModel: undefined,
					selectedStorage: undefined,
				});

				await renderFlow(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.CHOOSING_PRODUCT: {
				await clearChatMessages(bot, chatId);

				const [ selectedProductId ] = params;

				setChatState(chatId, {
					mode: "amount_product_for_cart",
					flowStep: "amount",
					selectedProductId,
				});

				await renderFlow(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.CHOOSING_AMOUNT: {
				await clearChatMessages(bot, chatId);

				const state = getChatState(chatId);
				const [ amount ] = params;

				if (Number.isNaN(amount)) {
					const msg = await bot.sendMessage(chatId, CART_TEXTS.AMOUNT_WILL_BE_NUMBER);
					registerBotMessage(chatId, msg.message_id);
					return;
				}

				const choseProduct = getProductById(chatId, state.selectedProductId);

				if (!choseProduct) {
					const msg = await bot.sendMessage(chatId, CART_TEXTS.PRODUCT_UNAVAILABLE);
					registerBotMessage(chatId, msg.message_id);
					return;
				}

				const productForOrder: ProductForCart = {
					...choseProduct,
					amount: Number(amount),
				};

				const currentOrder = [ ...(state.currentOrder || []), productForOrder ];

				setChatState(chatId, {
          mode: "idle",
					selectedProductId: undefined,
					flowStep: "products_for_cart",
					currentOrder,
				});

				await renderFlow(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.CART: {
				await clearChatMessages(bot, chatId);
				await removeNavigationMessage(bot, chatId);

				setChatState(chatId, {
					section: SECTION.CART,
					selectedBrand: undefined,
					selectedCategory: undefined,
					selectedModel: undefined,
					selectedStorage: undefined,
				});

				await renderFlow(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.CHECK_CART: {
				await clearChatMessages(bot, chatId);

				setChatState(chatId, {
					flowStep: "main",
					selectedBrand: undefined,
					selectedCategory: undefined,
					selectedModel: undefined,
					selectedStorage: undefined,
				});

				await renderFlow(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.EDITING_ORDER: {
				await clearChatMessages(bot, chatId);

				setChatState(chatId, {
					flowStep: "edit_cart",
				});

				await renderFlow(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.EDIT_CART_ITEM: {
				await clearChatMessages(bot, chatId);
				const [productId] = params;

				setChatState(chatId, {
					flowStep: "edit_product_in_cart",
					selectedProductIdForCart: productId,
				});

				await renderFlow(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.CLEAR_CART: {
				await clearChatMessages(bot, chatId);

				setChatState(chatId, {
					currentOrder: undefined,
				});

				await renderFlow(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.INCREASE_AMOUNT: {
				await clearChatMessages(bot, chatId);
				const state = getChatState(chatId);

				if (!state.currentOrder?.length || !state.selectedProductIdForCart) {
					console.log("empty currentOrder or selectedProductIdForCart or currentOrder have not this product")
					return;
				}

				const updatedOrder = state.currentOrder.map(product =>
					product.id === state.selectedProductIdForCart
						? { ...product, amount: product.amount + 1 }
						: product
				);

				setChatState(chatId, {
					currentOrder: updatedOrder,
				});

				await renderFlow(bot, chatId);

				return;
			}

			case CALLBACK_TYPE.DECREASE_AMOUNT: {
				await clearChatMessages(bot, chatId);

				const state = getChatState(chatId);

				if (!state.currentOrder?.length || !state.selectedProductIdForCart) {
					console.log("empty currentOrder or selectedProductIdForCart or currentOrder have not this product");
					return;
				}

				const updatedOrder = state.currentOrder.map(product =>
					product.id === state.selectedProductIdForCart
						? { ...product, amount: product.amount - 1 }
						: product
				);

				setChatState(chatId, {
					currentOrder: updatedOrder,
				});

				await renderFlow(bot, chatId);

				return;
			}

			case CALLBACK_TYPE.DELETE_POSITION_FROM_CART: {
				await clearChatMessages(bot, chatId);
				const state = getChatState(chatId);

				if (!state.currentOrder?.length || !state.selectedProductIdForCart) {
					console.log("empty currentOrder or selectedProductIdForCart");
					return;
				}

				const updatedOrder = state.currentOrder.filter(({ id }) => id !== state.selectedProductIdForCart);

				setChatState(chatId, {
					flowStep: "main",
					currentOrder: updatedOrder,
					selectedProductIdForCart: undefined,
				});

				await renderFlow(bot, chatId);

				return;
			}

			case CALLBACK_TYPE.SUBMIT_ORDER: {
				const state = getChatState(chatId);

				if (!state.currentOrder?.length) {
					return;
				}

        const order = createOrder(query.from, state.currentOrder);

        // const orders = loadOrders();
        // orders.push(order);
        // saveOrders(orders);
				const message = buildOrderMessage(
					order,
					chatId
				);

				await bot.sendMessage(ADMIN_CHAT_ID, message, {
					parse_mode: "HTML",
				});

				// Очистить корзину
				setChatState(chatId, {
					currentOrder: undefined,
					selectedProductIdForCart: undefined,
				});

				await bot.sendMessage(chatId, "✅ Заказ отправлен администратору!");

				return;
			}
		}
	});
}
