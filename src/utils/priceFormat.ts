import { PriceFormation, UserRole } from "../types";

export function priceFormat(price: string, priceFormation: PriceFormation, clientType?: UserRole) {
	const numberPrice = Number(price);

	if (Number.isNaN(numberPrice)) {
		console.log("price format must be a number: " + price);
		return price;
	}

	let calculatePrice: number;

	if (clientType === "retail") {
		calculatePrice =
			(numberPrice / 100) *
			priceFormation.rates.rub_to_byn *
			priceFormation.multipliers.retail;

		return String(Math.round(calculatePrice / 10) * 10);
	}

	if (clientType === "wholesale") {
		calculatePrice =
			numberPrice /
			priceFormation.rates.rub_to_usd *
			priceFormation.multipliers.wholesale;

		return String(Math.round(calculatePrice));
	}

	return price;
}