import { google } from "googleapis";
import path from "path";

const auth = new google.auth.GoogleAuth({
	keyFile: path.resolve("google-service-account.json"),
	scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

export async function getSheet(range: string) {
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: process.env.SPREADSHEET_ID!,
		range,
	});

	return res.data.values ?? [];
}
