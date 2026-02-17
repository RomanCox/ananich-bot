export function stringWithoutSpaces(str: string) {
	return str.trim().replace(/\s+/g, "_");
}