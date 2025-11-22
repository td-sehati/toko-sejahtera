import { Product, Customer, Supplier, Category } from './types';

export const initialProducts: Product[] = [
  { id: 'prod-1', name: 'Kopi Susu Gula Aren', sku: 'KS-GA-01', category: 'Minuman', price: 18000, hpp: 7000, stock: 50, imageUrl: 'https://picsum.photos/id/237/200/200', isDivisible: false, trackStock: true },
  { id: 'prod-2', name: 'Croissant Cokelat', sku: 'CR-CH-01', category: 'Roti', price: 22000, hpp: 9000, stock: 30, imageUrl: 'https://picsum.photos/id/238/200/200', isDivisible: false, trackStock: true },
  { id: 'prod-3', name: 'Teh Melati', sku: 'TM-01', category: 'Minuman', price: 12000, hpp: 3000, stock: 100, imageUrl: 'https://picsum.photos/id/239/200/200', isDivisible: false, trackStock: true },
  { id: 'prod-4', name: 'Kaos Polos Hitam S', sku: 'KP-H-S', category: 'Pakaian', price: 75000, hpp: 35000, stock: 25, imageUrl: 'https://picsum.photos/id/240/200/200', isDivisible: false, trackStock: true },
  { id: 'prod-5', name: 'Buku Tulis A5', sku: 'BT-A5', category: 'ATK', price: 8000, hpp: 4000, stock: 200, imageUrl: 'https://picsum.photos/id/241/200/200', isDivisible: false, trackStock: true },
  { id: 'prod-6', name: 'Air Mineral 600ml', sku: 'AM-600', category: 'Minuman', price: 5000, hpp: 2000, stock: 150, imageUrl: 'https://picsum.photos/id/242/200/200', isDivisible: false, trackStock: true },
  { id: 'prod-7', name: 'Mentimun (per kg)', sku: 'VEG-CU-01', category: 'Sayuran', price: 10000, hpp: 8000, stock: 15, imageUrl: 'https://picsum.photos/id/243/200/200', isDivisible: true, trackStock: true },
];

export const initialCustomers: Customer[] = [
  { id: 'cust-1', name: 'Andi Budianto', phone: '081234567890' },
  { id: 'cust-2', name: 'Citra Lestari', phone: '082345678901' },
];

export const initialSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Supplier Kopi Nusantara', phone: '085678901234' },
  { id: 'sup-2', name: 'Pabrik Roti Lezat', phone: '087890123456' },
];

export const initialCategories: Category[] = [
    { id: 'cat-1', name: 'Minuman' },
    { id: 'cat-2', name: 'Roti' },
    { id: 'cat-3', name: 'Pakaian' },
    { id: 'cat-4', name: 'ATK' },
    { id: 'cat-5', name: 'Sayuran' },
];