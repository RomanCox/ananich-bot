import TelegramBot from "node-telegram-bot-api";
import { CALLBACK_TYPE, CATALOG_VALUE } from "../types/actions";
import { getChatState, registerBotMessage, setChatState } from "../state/chat.state";
import { renderCatalogStep } from "./catalog/renderCatalogStep";
import { parseCallbackData } from "../utils/parseCallbackData";
import { SECTION } from "../types/navigation";
import { handleBack } from "./back.handler";
import { deleteUser, editUser, startUserManagement, startXlsxUpload } from "../services/admin.service";
import { renderAdminPanel } from "./main/renderAdminPanel";
import { clearChatMessages } from "../utils/clearChatMessages";
import { getProducts } from "../services/products.service";
import { renderProductsList } from "../render/renderProductsList";
import { openUsersList, showUsersList } from "./users/users.handler";
import { getUserState, setUserState } from "../state/user.state";
import { PAGINATION_TEXTS } from "../texts/pagination.texts";
import { UserRole } from "../types/user";
import { USERS_ERRORS, USERS_TEXTS } from "../texts/users.texts";
import { updateUserRole } from "../services/users.service";
import { COMMON_TEXTS } from "../texts/common.texts";

export function registerCallbacks(bot: TelegramBot) {
	bot.on("callback_query", async (query) => {
		const chatId = query.message?.chat.id;
		const messageId = query.message?.message_id;
		const data = query.data;

		if (!chatId || !data) return;

		await bot.answerCallbackQuery(query.id);

		const {action, params} = parseCallbackData(data);

		switch (action) {
			case CALLBACK_TYPE.BACK: {
				await handleBack(bot, chatId, messageId);
				const nextState = getChatState(chatId);

				if (nextState.section === SECTION.MAIN) {
					await renderAdminPanel(bot, chatId);
					return;
				}

				if (nextState.section === SECTION.CATALOG) {
					await renderCatalogStep(bot, chatId);
					return;
				}

        if (nextState.section === SECTION.MANAGE_USERS) {
          await renderAdminPanel(bot, chatId);
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
					setUserState(chatId, { mode: "await_page_number" });
					await bot.sendMessage(chatId, PAGINATION_TEXTS.ENTER_PAGE_NUMBER);
					return;
				}

				await clearChatMessages(bot, chatId);

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

      case CALLBACK_TYPE.CHOOSE_NEW_ROLE: {
        const role = params[0] as UserRole;
        const userState = getUserState(chatId);

        if (!userState.editingUserId) {
          await bot.sendMessage(chatId, USERS_ERRORS.USER_NOT_CHOOSE_MESSAGE);
          return;
        }

        await updateUserRole(userState.editingUserId, role);

        setUserState(chatId, { mode: "idle" });

        console.log(getChatState(chatId).section);

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

			case CALLBACK_TYPE.BRAND: {
				await clearChatMessages(bot, chatId);

				const [brandValue] = params;

				if (brandValue === CATALOG_VALUE.ALL) {
					const products = getProducts();

					await renderProductsList(bot, chatId, products, {
						backToStep: "brands",
					});

					return;
				}

				setChatState(chatId, {
					section: SECTION.CATALOG,
					catalogStep: "categories",
					selectedBrand: brandValue,
					selectedCategory: undefined,
				});

				await renderCatalogStep(bot, chatId);
				return;
			}

			case CALLBACK_TYPE.CATEGORY: {
				await clearChatMessages(bot, chatId);

				const [, categoryValue] = params;

				const products = getProducts(
					getChatState(chatId).selectedBrand,
					categoryValue !== CATALOG_VALUE.ALL ? categoryValue : undefined,
				);

				setChatState(chatId, {
					section: SECTION.CATALOG,
					catalogStep: "products",
					selectedCategory: categoryValue,
				});

				await renderProductsList(bot, chatId, products, {
					backToStep: "categories",
				});
				return;
			}
		}
	});
}
