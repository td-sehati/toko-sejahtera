
import React, { useState, useMemo } from 'react';
import { Transaction, Expense, Receivable, Payable, ManualJournalEntry } from '../types';
import { supabase } from '../supabaseClient';
import Icon from './common/Icon';
import Modal from './common/Modal';
import { toDbManualJournalEntry } from '../dbMappers';
import { toLocalDateInputValue } from '../dateUtils';

interface JournalManagerProps {
  transactions: Transaction[];
  expenses: Expense[];
  receivables: Receivable[];
  payables: Payable[];
  manualEntries: ManualJournalEntry[];
  onRefresh: () => void;
}

interface JournalItem {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'Masuk' | 'Keluar';
    source: 'Penjualan' | 'Pengeluaran' | 'Piutang' | 'Utang' | 'Manual';
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('id-ID');

const JournalManager: React.FC<JournalManagerProps> = ({ transactions, expenses, receivables, payables, manualEntries, onRefresh }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(toLocalDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    const [endDate, setEndDate] = useState(toLocalDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)));
    const [filterType, setFilterType] = useState<'All' | 'Masuk' | 'Keluar'>('All');

    // Manual Entry Form State
    const [manualForm, setManualForm] = useState<Partial<ManualJournalEntry>>({
        date: toLocalDateInputValue(new Date()),
        type: 'Masuk',
        category: 'Modal Awal'
    });

    const aggregatedJournal: JournalItem[] = useMemo(() => {
        const items: JournalItem[] = [];

        // 1. Sales (Cash & Transfer & QRIS)
        transactions.forEach(t => {
            if (t.paymentMethod !== 'Pay Later') {
                items.push({
                    id: `TRX-${t.id}`,
                    date: t.createdAt,
                    description: `Penjualan #${t.id.slice(-4)} (${t.paymentMethod})`,
                    category: 'Penjualan',
                    amount: t.total,
                    type: 'Masuk',
                    source: 'Penjualan'
                });
            }
        });

        // 2. Expenses
        expenses.forEach(e => {
             items.push({
                id: `EXP-${e.id}`,
                date: e.date,
                description: e.description,
                category: e.category,
                amount: e.amount,
                type: 'Keluar',
                source: 'Pengeluaran'
            });
        });

        // 3. Receivable Payments (Income from debt payments)
        receivables.forEach(r => {
            r.payments.forEach(p => {
                 items.push({
                    id: p.id,
                    date: p.paymentDate,
                    description: `Pembayaran Piutang (Inv: #${r.transactionId.slice(-4)})`,
                    category: 'Pelunasan Piutang',
                    amount: p.amount,
                    type: 'Masuk',
                    source: 'Piutang'
                });
            });
        });

        // 4. Payable Payments (Outcome for paying suppliers)
        payables.forEach(p => {
            p.payments.forEach(pay => {
                 items.push({
                    id: pay.id,
                    date: pay.paymentDate,
                    description: `Pembayaran Utang Supplier`,
                    category: 'Pelunasan Utang',
                    amount: pay.amount,
                    type: 'Keluar',
                    source: 'Utang'
                });
            });
        });

        // 5. Manual Entries
        manualEntries.forEach(m => {
            items.push({
                id: m.id,
                date: m.date,
                description: m.description,
                category: m.category,
                amount: m.amount,
                type: m.type,
                source: 'Manual'
            });
        });

        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, expenses, receivables, payables, manualEntries]);

    const filteredItems = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        return aggregatedJournal.filter(item => {
            const itemDate = new Date(item.date);
            const dateMatch = itemDate >= start && itemDate <= end;
            const typeMatch = filterType === 'All' || item.type === filterType;
            return dateMatch && typeMatch;
        });
    }, [aggregatedJournal, startDate, endDate, filterType]);

    const totalIn = filteredItems.filter(i => i.type === 'Masuk').reduce((sum, i) => sum + i.amount, 0);
    const totalOut = filteredItems.filter(i => i.type === 'Keluar').reduce((sum, i) => sum + i.amount, 0);
    const balance = totalIn - totalOut;

    const handleSaveManualEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualForm.amount || !manualForm.description) return;

        const newEntry: ManualJournalEntry = {
            id: `JRN-${Date.now()}`,
            date: manualForm.date || new Date().toISOString(),
            description: manualForm.description || '',
            amount: Number(manualForm.amount),
            type: manualForm.type as 'Masuk' | 'Keluar',
            category: manualForm.category as any,
        };
        
        const { error } = await supabase.from('manual_journal_entries').insert([toDbManualJournalEntry(newEntry)]);
        if (!error) {
            onRefresh();
            setModalOpen(false);
            setManualForm({
                date: toLocalDateInputValue(new Date()),
                type: 'Masuk',
                category: 'Modal Awal',
                description: '',
                amount: 0
            });
        } else {
            alert("Gagal menyimpan data jurnal.");
        }
    };

    const handleDeleteManualEntry = async (id: string) => {
        if (confirm("Hapus entri jurnal ini?")) {
            const { error } = await supabase.from('manual_journal_entries').delete().eq('id', id);
            if (!error) onRefresh();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Jurnal Keuangan (Arus Kas)</h1>
                <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Icon name="plus" className="w-5 h-5" />
                    Input Manual
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <p className="text-sm text-gray-500">Total Masuk</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIn)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                    <p className="text-sm text-gray-500">Total Keluar</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOut)}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500">Selisih (Cashflow)</p>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(balance)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-end gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dari Tanggal</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Tipe</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="mt-1 block w-full border rounded-md p-2">
                        <option value="All">Semua</option>
                        <option value="Masuk">Uang Masuk</option>
                        <option value="Keluar">Uang Keluar</option>
                    </select>
                </div>
            </div>

            {/* Journal Table */}
            <div className="bg-white p-4 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Tanggal</th>
                                <th className="px-6 py-3">Keterangan</th>
                                <th className="px-6 py-3">Kategori</th>
                                <th className="px-6 py-3">Sumber</th>
                                <th className="px-6 py-3 text-right">Masuk</th>
                                <th className="px-6 py-3 text-right">Keluar</th>
                                <th className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(item.date)}</td>
                                    <td className="px-6 py-4 font-medium">{item.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs ${item.type === 'Masuk' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{item.source}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                                        {item.type === 'Masuk' ? formatCurrency(item.amount) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-semibold text-red-600">
                                        {item.type === 'Keluar' ? formatCurrency(item.amount) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {item.source === 'Manual' && (
                                            <button onClick={() => handleDeleteManualEntry(item.id)} className="text-red-500 hover:text-red-700" title="Hapus">
                                                <Icon name="trash" className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">Tidak ada data transaksi pada periode ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Input Jurnal Manual">
                <form onSubmit={handleSaveManualEntry} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Tanggal</label>
                            <input 
                                type="date" 
                                value={manualForm.date} 
                                onChange={e => setManualForm({...manualForm, date: e.target.value})} 
                                className="mt-1 block w-full border rounded-md p-2" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tipe Arus Kas</label>
                            <select 
                                value={manualForm.type} 
                                onChange={e => setManualForm({...manualForm, type: e.target.value as any})} 
                                className="mt-1 block w-full border rounded-md p-2"
                            >
                                <option value="Masuk">Uang Masuk</option>
                                <option value="Keluar">Uang Keluar</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium">Kategori</label>
                        <select 
                            value={manualForm.category} 
                            onChange={e => setManualForm({...manualForm, category: e.target.value as any})} 
                            className="mt-1 block w-full border rounded-md p-2"
                        >
                            {manualForm.type === 'Masuk' ? (
                                <>
                                    <option value="Modal Awal">Modal Awal</option>
                                    <option value="Pendapatan Lain">Pendapatan Lain-lain</option>
                                    <option value="Adjustment">Penyesuaian Stok (Adjustment)</option>
                                </>
                            ) : (
                                <>
                                    <option value="Prive">Prive / Tarik Tunai Owner</option>
                                    <option value="Pengeluaran Lain">Pengeluaran Lain-lain</option>
                                    <option value="Adjustment">Penyesuaian Stok (Adjustment)</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Keterangan</label>
                        <input 
                            type="text" 
                            value={manualForm.description} 
                            onChange={e => setManualForm({...manualForm, description: e.target.value})} 
                            className="mt-1 block w-full border rounded-md p-2" 
                            placeholder="Contoh: Setor modal tambahan"
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Jumlah (Rp)</label>
                        <input 
                            type="number" 
                            value={manualForm.amount} 
                            onChange={e => setManualForm({...manualForm, amount: parseFloat(e.target.value)})} 
                            className="mt-1 block w-full border rounded-md p-2" 
                            min="0"
                            required 
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default JournalManager;
