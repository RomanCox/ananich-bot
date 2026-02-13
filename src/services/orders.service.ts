import { ProductForCart } from "../types";

export function buildOrderMessage(order: ProductForCart[], userId: number): string {
	const total = order.reduce(
		(sum, product) => sum + Number(product.price) * product.amount,
		0
	);

	const items = order.map(product =>
		`• ${product.name}
  Кол-во: ${product.amount}
  Цена: ${product.price}
  Сумма: ${Number(product.price) * product.amount}`
	).join("\n\n");

	return `
🛒 <b>Новый заказ</b>

👤 User ID: ${userId}

${items}

💰 <b>Итого:</b> ${total}
`;
}