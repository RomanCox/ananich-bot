import { ProductForCart } from "./product";

export interface IOrder {
  id: string;
  userId: number;
  username?: string;
  fullName?: string;
  items: ProductForCart[];
  total: number;
  status: "new" | "accepted" | "rejected";
  createdAt: string;
}