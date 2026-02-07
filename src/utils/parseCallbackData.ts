interface ParsedCallback {
	action: string;
	params: string[];
}

export function parseCallbackData(data: string): ParsedCallback {
	const [action, ...params] = data.split(":");

	return {
		action,
		params,
	};
}