import type {
  Category,
  Customer,
  Expense,
  ManualJournalEntry,
  Payable,
  PayablePaymentRecord,
  PaymentRecord,
  Product,
  Receivable,
  SavedOrder,
  Supplier,
  Transaction,
} from './types';

const pick = <T = unknown>(record: any, camelKey: string, snakeKey: string, fallback?: T): T =>
  (record?.[camelKey] ?? record?.[snakeKey] ?? fallback) as T;

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePaymentRecord = (payment: any): PaymentRecord => ({
  id: String(payment?.id ?? `PAYREC-${Date.now()}`),
  receivableId: String(pick(payment, 'receivableId', 'receivable_id', '')),
  amount: asNumber(payment?.amount),
  paymentDate: String(pick(payment, 'paymentDate', 'payment_date', new Date().toISOString())),
});

const normalizePayablePaymentRecord = (payment: any): PayablePaymentRecord => ({
  id: String(payment?.id ?? `PAYPAY-${Date.now()}`),
  payableId: String(pick(payment, 'payableId', 'payable_id', '')),
  amount: asNumber(payment?.amount),
  paymentDate: String(pick(payment, 'paymentDate', 'payment_date', new Date().toISOString())),
});

const toDbPaymentRecord = (payment: PaymentRecord) => ({
  id: payment.id,
  receivable_id: payment.receivableId,
  amount: payment.amount,
  payment_date: payment.paymentDate,
});

const toDbPayablePaymentRecord = (payment: PayablePaymentRecord) => ({
  id: payment.id,
  payable_id: payment.payableId,
  amount: payment.amount,
  payment_date: payment.paymentDate,
});

export const normalizeProduct = (product: any): Product => ({
  id: String(product?.id ?? `prod-${Date.now()}`),
  name: String(product?.name ?? ''),
  sku: String(product?.sku ?? ''),
  category: String(product?.category ?? ''),
  price: asNumber(product?.price),
  hpp: asNumber(product?.hpp),
  stock: asNumber(product?.stock),
  imageUrl: pick(product, 'imageUrl', 'image_url', ''),
  isDivisible: Boolean(pick(product, 'isDivisible', 'is_divisible', false)),
  trackStock: Boolean(pick(product, 'trackStock', 'track_stock', true)),
});

export const toDbProduct = (product: Product) => ({
  id: product.id,
  name: product.name,
  sku: product.sku,
  category: product.category,
  price: product.price,
  hpp: product.hpp,
  stock: product.stock,
  image_url: product.imageUrl ?? null,
  is_divisible: Boolean(product.isDivisible),
  track_stock: Boolean(product.trackStock),
});

export const normalizeCustomer = (customer: any): Customer => ({
  id: String(customer?.id ?? `cust-${Date.now()}`),
  name: String(customer?.name ?? ''),
  phone: String(customer?.phone ?? ''),
});

export const toDbCustomer = (customer: Customer) => ({
  id: customer.id,
  name: customer.name,
  phone: customer.phone,
});

export const normalizeSupplier = (supplier: any): Supplier => ({
  id: String(supplier?.id ?? `sup-${Date.now()}`),
  name: String(supplier?.name ?? ''),
  phone: String(supplier?.phone ?? ''),
});

export const toDbSupplier = (supplier: Supplier) => ({
  id: supplier.id,
  name: supplier.name,
  phone: supplier.phone,
});

export const normalizeCategory = (category: any): Category => ({
  id: String(category?.id ?? `cat-${Date.now()}`),
  name: String(category?.name ?? ''),
});

export const toDbCategory = (category: Category) => ({
  id: category.id,
  name: category.name,
});

export const normalizeTransaction = (transaction: any): Transaction => ({
  id: String(transaction?.id ?? `TXN-${Date.now()}`),
  items: Array.isArray(transaction?.items) ? transaction.items : [],
  subtotal: asNumber(transaction?.subtotal ?? transaction?.total),
  discount: asNumber(transaction?.discount),
  total: asNumber(transaction?.total),
  totalHPP: asNumber(pick(transaction, 'totalHPP', 'total_hpp', 0)),
  paymentMethod: String(pick(transaction, 'paymentMethod', 'payment_method', 'Cash')) as Transaction['paymentMethod'],
  customerId: pick(transaction, 'customerId', 'customer_id', undefined),
  createdAt: String(pick(transaction, 'createdAt', 'created_at', new Date().toISOString())),
});

export const toDbTransaction = (transaction: Transaction) => ({
  id: transaction.id,
  items: transaction.items,
  subtotal: transaction.subtotal,
  discount: transaction.discount,
  total: transaction.total,
  total_hpp: transaction.totalHPP,
  payment_method: transaction.paymentMethod,
  customer_id: transaction.customerId ?? null,
  created_at: transaction.createdAt,
});

export const normalizeReceivable = (receivable: any): Receivable => ({
  id: String(receivable?.id ?? `REC-${Date.now()}`),
  customerId: String(pick(receivable, 'customerId', 'customer_id', '')),
  transactionId: String(pick(receivable, 'transactionId', 'transaction_id', '')),
  totalAmount: asNumber(pick(receivable, 'totalAmount', 'total_amount', 0)),
  paidAmount: asNumber(pick(receivable, 'paidAmount', 'paid_amount', 0)),
  dueDate: String(pick(receivable, 'dueDate', 'due_date', new Date().toISOString())),
  createdAt: String(pick(receivable, 'createdAt', 'created_at', new Date().toISOString())),
  payments: Array.isArray(receivable?.payments) ? receivable.payments.map(normalizePaymentRecord) : [],
});

export const toDbReceivable = (receivable: Receivable) => ({
  id: receivable.id,
  customer_id: receivable.customerId,
  transaction_id: receivable.transactionId,
  total_amount: receivable.totalAmount,
  paid_amount: receivable.paidAmount,
  due_date: receivable.dueDate,
  created_at: receivable.createdAt,
  payments: receivable.payments.map(toDbPaymentRecord),
});

export const normalizePayable = (payable: any): Payable => ({
  id: String(payable?.id ?? `PAY-${Date.now()}`),
  supplierId: String(pick(payable, 'supplierId', 'supplier_id', '')),
  description: String(payable?.description ?? ''),
  totalAmount: asNumber(pick(payable, 'totalAmount', 'total_amount', 0)),
  paidAmount: asNumber(pick(payable, 'paidAmount', 'paid_amount', 0)),
  dueDate: String(pick(payable, 'dueDate', 'due_date', new Date().toISOString())),
  createdAt: String(pick(payable, 'createdAt', 'created_at', new Date().toISOString())),
  payments: Array.isArray(payable?.payments) ? payable.payments.map(normalizePayablePaymentRecord) : [],
});

export const toDbPayable = (payable: Payable) => ({
  id: payable.id,
  supplier_id: payable.supplierId,
  description: payable.description,
  total_amount: payable.totalAmount,
  paid_amount: payable.paidAmount,
  due_date: payable.dueDate,
  created_at: payable.createdAt,
  payments: payable.payments.map(toDbPayablePaymentRecord),
});

export const normalizeExpense = (expense: any): Expense => ({
  id: String(expense?.id ?? `exp-${Date.now()}`),
  category: String(expense?.category ?? 'Other') as Expense['category'],
  description: String(expense?.description ?? ''),
  amount: asNumber(expense?.amount),
  date: String(expense?.date ?? new Date().toISOString()),
});

export const toDbExpense = (expense: Expense) => ({
  id: expense.id,
  category: expense.category,
  description: expense.description,
  amount: expense.amount,
  date: expense.date,
});

export const normalizeSavedOrder = (order: any): SavedOrder => ({
  id: String(order?.id ?? `order-${Date.now()}`),
  name: String(order?.name ?? ''),
  cart: Array.isArray(order?.cart) ? order.cart : [],
  createdAt: String(pick(order, 'createdAt', 'created_at', new Date().toISOString())),
});

export const toDbSavedOrder = (order: SavedOrder) => ({
  id: order.id,
  name: order.name,
  cart: order.cart,
  created_at: order.createdAt,
});

export const normalizeManualJournalEntry = (entry: any): ManualJournalEntry => ({
  id: String(entry?.id ?? `JRN-${Date.now()}`),
  date: String(entry?.date ?? new Date().toISOString()),
  description: String(entry?.description ?? ''),
  amount: asNumber(entry?.amount),
  type: String(entry?.type ?? 'Masuk') as ManualJournalEntry['type'],
  category: String(entry?.category ?? 'Modal Awal') as ManualJournalEntry['category'],
});

export const toDbManualJournalEntry = (entry: ManualJournalEntry) => ({
  id: entry.id,
  date: entry.date,
  description: entry.description,
  amount: entry.amount,
  type: entry.type,
  category: entry.category,
});
