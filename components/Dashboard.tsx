import React from 'react';
import { Transaction, Receivable, Payable, Expense, Product } from '../types';
import Icon from './common/Icon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  receivables: Receivable[];
  payables: Payable[];
  expenses: Expense[];
  products: Product[];
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const StatCard: React.FC<{ title: string; value: string; iconName: React.ComponentProps<typeof Icon>['name']; color: string }> = ({ title, value, iconName, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon name={iconName} className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ transactions, receivables, payables, expenses, products }) => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTransactions = transactions.filter(t => t.createdAt.startsWith(today));

    const totalRevenueToday = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalHppToday = todayTransactions.reduce((sum, t) => sum + t.totalHPP, 0);
    const grossProfitToday = totalRevenueToday - totalHppToday;

    const totalReceivables = receivables.reduce((sum, r) => sum + (r.totalAmount - r.paidAmount), 0);
    const totalPayables = payables.reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0);
    
    // Calculate actual cash inflow for today
    const cashSalesToday = todayTransactions
        .filter(t => t.paymentMethod !== 'Pay Later')
        .reduce((sum, t) => sum + t.total, 0);
    
    const debtPaymentsToday = receivables
        .flatMap(r => r.payments)
        .filter(p => p.paymentDate.startsWith(today))
        .reduce((sum, p) => sum + p.amount, 0);

    const totalCashInflowToday = cashSalesToday + debtPaymentsToday;

    const lowStockProducts = products.filter(p => p.trackStock && p.stock <= 10);

    // Data for sales chart (last 7 days)
    const salesData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().slice(0, 10);
        const dailySales = transactions
            .filter(t => t.createdAt.startsWith(dateString))
            .reduce((sum, t) => sum + t.total, 0);
        return { name: d.toLocaleDateString('id-ID', { weekday: 'short' }), Omzet: dailySales };
    }).reverse();

    // Data for product category pie chart
    const categoryData = products.reduce((acc, product) => {
        const category = product.category || 'Lainnya';
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += product.stock;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Omzet Hari Ini" value={formatCurrency(totalRevenueToday)} iconName="dollar" color="bg-green-500" />
        <StatCard title="Kas Masuk Hari Ini" value={formatCurrency(totalCashInflowToday)} iconName="check" color="bg-indigo-500" />
        <StatCard title="Laba Kotor Hari Ini" value={formatCurrency(grossProfitToday)} iconName="trending-up" color="bg-blue-500" />
        <StatCard title="Total Piutang" value={formatCurrency(totalReceivables)} iconName="arrow-down" color="bg-yellow-500" />
        <StatCard title="Total Utang" value={formatCurrency(totalPayables)} iconName="arrow-up" color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Omzet 7 Hari Terakhir</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value as number)} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="Omzet" fill="#3B82F6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Notifikasi Stok Menipis</h2>
            {lowStockProducts.length > 0 ? (
                <ul className="space-y-2 max-h-72 overflow-y-auto">
                    {lowStockProducts.map(p => (
                        <li key={p.id} className="flex justify-between items-center p-2 rounded bg-red-50 text-red-700">
                            <span>{p.name}</span>
                            <span className="font-bold">{p.stock}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center py-10">Semua stok aman.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;