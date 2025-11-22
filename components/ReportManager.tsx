
import React, { useState, useMemo } from 'react';
import { Transaction, Expense, Product, Customer } from '../types';
import Modal from './common/Modal';
import Icon from './common/Icon';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

interface ReportManagerProps {
  transactions: Transaction[];
  expenses: Expense[];
  products: Product[];
  customers: Customer[];
  onVoidTransaction: (transactionId: string, action: 'void' | 'edit') => void;
}

const ReportCard: React.FC<{ title: string; value: string; colorClass: string }> = ({ title, value, colorClass }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
);

const ReportManager: React.FC<ReportManagerProps> = ({ transactions, expenses, products, customers, onVoidTransaction }) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [productFilter, setProductFilter] = useState('');
    const [customerFilter, setCustomerFilter] = useState('');

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const getCustomerName = (customerId?: string) => {
        if (!customerId) return 'Walk-in Customer';
        return customers.find(c => c.id === customerId)?.name || 'Pelanggan Dihapus';
    };

    const reportData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filteredTransactions = transactions.filter(t => {
            const tDate = new Date(t.createdAt);
            return tDate >= start && tDate <= end;
        });

        const filteredExpenses = expenses.filter(e => {
            const eDate = new Date(e.date);
            return eDate >= start && eDate <= end;
        });

        const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
        const totalHPP = filteredTransactions.reduce((sum, t) => sum + t.totalHPP, 0);
        const grossProfit = totalRevenue - totalHPP;
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = grossProfit - totalExpenses;

        return { totalRevenue, totalHPP, grossProfit, totalExpenses, netProfit, filteredExpenses };
    }, [startDate, endDate, transactions, expenses]);
    
    const filteredHistory = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return transactions.filter(t => {
            const tDate = new Date(t.createdAt);
            const dateMatch = tDate >= start && tDate <= end;
            const customerMatch = !customerFilter || t.customerId === customerFilter;
            const productMatch = !productFilter || t.items.some(item => item.id === productFilter);
            return dateMatch && customerMatch && productMatch;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort newest first
    }, [startDate, endDate, customerFilter, productFilter, transactions]);

    const handleAction = (action: 'void' | 'edit') => {
        if (!selectedTransaction) return;

        const message = action === 'void' 
            ? "Apakah Anda yakin ingin MERETUR (Membatalkan) transaksi ini? \n\nStok produk akan dikembalikan, dan transaksi akan dihapus dari laporan."
            : "Apakah Anda yakin ingin MENGEDIT transaksi ini? \n\nTransaksi saat ini akan dibatalkan, dan item akan dipindahkan kembali ke keranjang Kasir (Pesanan Tersimpan) untuk Anda ubah.";

        if (window.confirm(message)) {
             onVoidTransaction(selectedTransaction.id, action);
             setSelectedTransaction(null);
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Laporan</h1>
            
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 flex-wrap">
                <div>
                    <label className="text-sm font-medium text-gray-700">Dari Tanggal</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full sm:w-auto p-2 border rounded-md" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Sampai Tanggal</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full sm:w-auto p-2 border rounded-md" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Filter Produk</label>
                    <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="mt-1 block w-full sm:w-auto p-2 border rounded-md">
                        <option value="">Semua Produk</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Filter Pelanggan</label>
                    <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} className="mt-1 block w-full sm:w-auto p-2 border rounded-md">
                        <option value="">Semua Pelanggan</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <h2 className="text-2xl font-semibold">Laporan Laba / Rugi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard title="Total Penjualan (Omzet)" value={formatCurrency(reportData.totalRevenue)} colorClass="text-blue-600" />
                <ReportCard title="Laba Kotor" value={formatCurrency(reportData.grossProfit)} colorClass="text-green-600" />
                <ReportCard title="Laba Bersih" value={formatCurrency(reportData.netProfit)} colorClass={reportData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-semibold mb-4">Riwayat Penjualan</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">ID Transaksi</th>
                                <th className="px-6 py-3">Tanggal</th>
                                <th className="px-6 py-3">Pelanggan</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map(t => (
                                <tr key={t.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-xs">{t.id}</td>
                                    <td className="px-6 py-4">{new Date(t.createdAt).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4">{getCustomerName(t.customerId)}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{formatCurrency(t.total)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => setSelectedTransaction(t)} className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 font-medium">
                                            Detail / Retur
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredHistory.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">Tidak ada transaksi pada periode ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>

            {selectedTransaction && (
                <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Detail Transaksi" size="lg">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded">
                           <div>
                                <p className="text-gray-500">ID Transaksi</p>
                                <p className="font-mono text-xs font-bold">{selectedTransaction.id}</p>
                           </div>
                            <div>
                                <p className="text-gray-500">Tanggal</p>
                                <p className="font-semibold">{new Date(selectedTransaction.createdAt).toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Pelanggan</p>
                                <p className="font-semibold">{getCustomerName(selectedTransaction.customerId)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Metode Pembayaran</p>
                                <p className="font-semibold">{selectedTransaction.paymentMethod}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-2">Rincian Item</h4>
                            <div className="max-h-40 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Produk</th>
                                            <th className="text-center py-2">Qty</th>
                                            <th className="text-right py-2">Harga Satuan</th>
                                            <th className="text-right py-2">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTransaction.items.map(item => (
                                            <tr key={item.id}>
                                                <td className="py-2">{item.name}</td>
                                                <td className="text-center py-2">{item.quantity}</td>
                                                <td className="text-right py-2">{formatCurrency(item.price)}</td>
                                                <td className="text-right py-2">{formatCurrency(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between font-bold border-t mt-2 pt-2">
                                <span>Total</span>
                                <span className="text-lg">{formatCurrency(selectedTransaction.total)}</span>
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                                <p className="text-sm text-yellow-800 font-semibold mb-2">Opsi Koreksi:</p>
                                <div className="flex gap-3">
                                    <button onClick={() => handleAction('edit')} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-yellow-400 text-yellow-700 rounded shadow-sm hover:bg-yellow-100 text-sm font-medium transition-colors">
                                        <Icon name="edit" className="w-4 h-4" />
                                        Edit Kembali
                                    </button>
                                    <button onClick={() => handleAction('void')} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded shadow-sm hover:bg-red-700 text-sm font-medium transition-colors">
                                        <Icon name="trash" className="w-4 h-4" />
                                        Retur / Batalkan
                                    </button>
                                </div>
                                <p className="text-xs text-yellow-700 mt-2">
                                    * <strong>Edit Kembali</strong>: Membatalkan transaksi ini dan memindahkan item ke Kasir untuk diedit ulang. <br/>
                                    * <strong>Retur</strong>: Menghapus transaksi dan mengembalikan stok.
                                </p>
                            </div>
                        </div>

                         <div className="flex justify-end">
                            <button onClick={() => setSelectedTransaction(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Tutup</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ReportManager;
