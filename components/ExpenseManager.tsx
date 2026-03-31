
import React, { useState } from 'react';
import { Expense } from '../types';
import { supabase } from '../supabaseClient';
import Modal from './common/Modal';
import Icon from './common/Icon';
import { toDbExpense } from '../dbMappers';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID');

const ExpenseForm: React.FC<{
    expense: Expense | null,
    onSave: (expense: Expense) => void,
    onClose: () => void,
}> = ({ expense, onSave, onClose }) => {
    const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
        date: expense?.date.slice(0, 10) || new Date().toISOString().slice(0, 10),
        category: expense?.category || 'Other',
        description: expense?.description || '',
        amount: expense?.amount || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: expense?.id || `exp-${Date.now()}` });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Tanggal</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
            </div>
            <div>
                <label className="block text-sm font-medium">Kategori</label>
                <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required>
                    <option value="Salary">Gaji</option>
                    <option value="Rent">Sewa</option>
                    <option value="Utilities">Listrik, Air, Internet</option>
                    <option value="Marketing">Pemasaran</option>
                    <option value="Transport">Transportasi</option>
                    <option value="Other">Lainnya</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">Deskripsi</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" placeholder="e.g. Gaji Karyawan Bulan Mei" required />
            </div>
             <div>
                <label className="block text-sm font-medium">Jumlah (Rp)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Simpan</button>
            </div>
        </form>
    );
};

const ExpenseManager: React.FC<{
    expenses: Expense[],
    onRefresh: () => void
}> = ({ expenses, onRefresh }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    
    const handleSave = async (expense: Expense) => {
        const { error } = await supabase.from('expenses').upsert(toDbExpense(expense));
        if (!error) {
            onRefresh();
            setModalOpen(false);
            setSelectedExpense(null);
        } else {
            alert("Gagal menyimpan pengeluaran.");
        }
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Hapus data biaya ini?")) return;
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (!error) onRefresh();
    }

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Catat Biaya Operasional</h1>
                <button onClick={() => { setSelectedExpense(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Icon name="plus" className="w-5 h-5" />
                    Tambah Biaya
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Tanggal</th>
                            <th className="px-6 py-3">Deskripsi</th>
                            <th className="px-6 py-3">Kategori</th>
                            <th className="px-6 py-3">Jumlah</th>
                            <th className="px-6 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(e => (
                            <tr key={e.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{formatDate(e.date)}</td>
                                <td className="px-6 py-4 font-medium">{e.description}</td>
                                <td className="px-6 py-4">{e.category}</td>
                                <td className="px-6 py-4 font-semibold">{formatCurrency(e.amount)}</td>
                                <td className="px-6 py-4 flex gap-2">
                                     <button onClick={() => { setSelectedExpense(e); setModalOpen(true); }} className="p-1 text-blue-600 hover:text-blue-800">
                                        <Icon name="edit" className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(e.id)} className="p-1 text-red-600 hover:text-red-800">
                                        <Icon name="trash" className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={selectedExpense ? 'Edit Biaya' : 'Tambah Biaya Baru'}>
                <ExpenseForm expense={selectedExpense} onSave={handleSave} onClose={() => setModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ExpenseManager;
