import { ChatMode } from "./chat";

export interface PriceFormation {
	rates: {
		rub_to_byn: number;
		rub_to_usd: number;
	};
	multipliers: {
		retail: number;
		wholesale: number;
	};
}

export type PriceFormationUpdate = { type: ChatMode; value: number };