export function stringWithoutSpaces(str: string) {
	return str.trim().replace(/\s+/g, "_");
}

export function normalizeModel(model: string): string {
	return model
		.toLowerCase()
		.replace(/[\s-]/g, "") // убираем пробелы и дефисы
		.trim();
}