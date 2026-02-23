// Static data bundled at build time — zero network calls needed.
import db from '../../db.json';

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverType: string;
  category: string;
  description: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

export const BOOKS: Book[]       = db.books     as Book[];
export const CATEGORIES: Category[] = db.categories as Category[];
export const ORDERS: Order[]     = db.orders    as Order[];
