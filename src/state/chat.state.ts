import { ChatState } from "../types/chat";

const DEFAULT_CHAT_STATE: ChatState = {};

const chatState = new Map<number, ChatState>();

export function getChatState(chatId: number): ChatState {
	if (!chatState.has(chatId)) {
		chatState.set(chatId, structuredClone(DEFAULT_CHAT_STATE));
	}
	return chatState.get(chatId)!;
}

export function setChatState(chatId: number, patch: Partial<ChatState>) {
	const current = getChatState(chatId);
	chatState.set(chatId, { ...current, ...patch });
}

function patchChatState(chatId: number, patch: Partial<ChatState>) {
	const state = getChatState(chatId);

	setChatState(chatId, {
		...state,
		...patch,
	});
}

export function registerBotMessage(chatId: number, messageId: number) {
	const state = getChatState(chatId);

	setChatState(chatId, {
		messageIds: [...(state.messageIds ?? []), messageId],
	});
}

export function resetChatState(chatId: number) {
	chatState.delete(chatId);
}

export function clearChatState(chatId: number) {
	chatState.delete(chatId);
}
