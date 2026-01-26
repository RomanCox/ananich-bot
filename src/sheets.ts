import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
	keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
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
