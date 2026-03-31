
import React, { useState, useRef } from 'react';
import { Customer, Supplier } from '../types';
import { supabase } from '../supabaseClient';
import Modal from './common/Modal';
import Icon from './common/Icon';
import { toDbCustomer, toDbSupplier } from '../dbMappers';

interface CrmManagerProps {
  customers: Customer[];
  suppliers: Supplier[];
  onRefresh: () => void;
}

const CrmForm: React.FC<{
    entity: Customer | Supplier | null,
    type: 'Customer' | 'Supplier',
    onSave: (entity: Customer | Supplier) => void,
    onClose: () => void,
}> = ({ entity, type, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: entity?.name || '',
        phone: entity?.phone || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const idKey = type === 'Customer' ? 'cust' : 'sup';
        const id = entity?.id || `${idKey}-${Date.now()}`;
        onSave({ id, ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Nama</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
            </div>
            <div>
                <label className="block text-sm font-medium">No. Telepon/WhatsApp</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
            </div>
             <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Simpan</button>
            </div>
        </form>
    );
};

const CrmManager: React.FC<CrmManagerProps> = ({ customers, suppliers, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Customer | Supplier | null>(null);
  const [clearingEntityType, setClearingEntityType] = useState<'customers' | 'suppliers' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveCustomer = async (customer: Customer) => {
      const { error } = await supabase.from('customers').upsert(toDbCustomer(customer));
      if (!error) {
          onRefresh();
          setModalOpen(false);
      } else {
          alert("Gagal menyimpan pelanggan.");
      }
  };
  
  const handleSaveSupplier = async (supplier: Supplier) => {
      const { error } = await supabase.from('suppliers').upsert(toDbSupplier(supplier));
      if (!error) {
          onRefresh();
          setModalOpen(false);
      } else {
          alert("Gagal menyimpan supplier.");
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Yakin hapus data ini?")) return;
      
      const table = activeTab === 'customers' ? 'customers' : 'suppliers';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) onRefresh();
      else alert("Gagal menghapus data.");
  }
  
  const handleClearData = async () => {
    const table = clearingEntityType === 'customers' ? 'customers' : 'suppliers';
    const { error } = await supabase.from(table).delete().neq('id', '0');
    if (!error) {
        onRefresh();
        setClearingEntityType(null);
    } else {
        alert("Gagal mengosongkan data.");
    }
  };

  // --- CSV Helper Functions ---

  const parseCSVLine = (text: string) => {
    const result: string[] = [];
    let curr = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            if (inQuote && text[i + 1] === '"') {
                curr += '"';
                i++;
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            result.push(curr);
            curr = '';
        } else {
            curr += char;
        }
    }
    result.push(curr);
    return result;
  };

  const downloadCSV = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Import / Export Handlers ---

  const handleDownloadTemplate = () => {
      const headers = ['name', 'phone'];
      let row1, row2, filename;

      if (activeTab === 'customers') {
          row1 = ['Budi Santoso', '081234567890'];
          row2 = ['Siti Aminah', '08987654321'];
          filename = 'template_pelanggan.csv';
      } else {
          row1 = ['PT Supplier Utama', '081122334455'];
          row2 = ['Toko Grosir Abadi', '089988776655'];
          filename = 'template_supplier.csv';
      }

      const csvContent = [headers.join(','), row1.join(','), row2.join(',')].join('\n');
      downloadCSV(csvContent, filename);
  };

  const handleExportData = () => {
      const data = activeTab === 'customers' ? customers : suppliers;
      const label = activeTab === 'customers' ? 'pelanggan' : 'supplier';
      const headers = ['id', 'name', 'phone'];

      const rows = data.map(item => {
          const escape = (field: any) => {
              const str = String(field || '');
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                  return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
          };
          return [escape(item.id), escape(item.name), escape(item.phone)].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      downloadCSV(csvContent, `data_${label}_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
          const text = e.target?.result as string;
          if (!text) return;

          const lines = text.split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length < 2) {
              alert("File CSV kosong atau format salah.");
              return;
          }

          // Parse headers
          const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
          
          const newItems: any[] = [];
          let successCount = 0;
          const label = activeTab === 'customers' ? 'pelanggan' : 'supplier';
          const idPrefix = activeTab === 'customers' ? 'cust' : 'sup';

          for (let i = 1; i < lines.length; i++) {
              const values = parseCSVLine(lines[i]);
              if (values.length < 2) continue; 

              const getVal = (key: string) => {
                  const idx = headers.indexOf(key);
                  return idx !== -1 ? values[idx]?.trim() : '';
              };

              const name = getVal('name');
              const phone = getVal('phone');

              if (!name) continue;

              const newItem = {
                  id: getVal('id') || `${idPrefix}-imp-${Date.now()}-${i}`,
                  name,
                  phone
              };
              newItems.push(newItem);
              successCount++;
          }

          if (successCount > 0) {
              const table = activeTab === 'customers' ? 'customers' : 'suppliers';
              const { error } = await supabase.from(table).insert(
                activeTab === 'customers' ? newItems.map(toDbCustomer) : newItems.map(toDbSupplier)
              );
              
              if (!error) {
                  alert(`Berhasil mengimpor ${successCount} data ${label}.`);
                  onRefresh();
              } else {
                  alert("Gagal insert ke database.");
              }
          } else {
              alert(`Gagal mengimpor data. Pastikan format sesuai template (name, phone).`);
          }

          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-3xl font-bold">Manajemen Kontak</h1>
        
        <div className="flex flex-wrap items-center gap-2">
            {/* Hidden File Input */}
            <input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border text-sm" title="Unduh Template CSV">
                    <Icon name="file-text" className="w-4 h-4" />
                    Template
                </button>
                <button onClick={handleExportData} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border text-sm" title="Export Data">
                    <Icon name="download" className="w-4 h-4" />
                    Export
                </button>
                <button onClick={handleImportClick} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm" title="Import Data">
                    <Icon name="upload" className="w-4 h-4" />
                    Import
                </button>
            </div>
             
            <div className="h-8 w-px bg-gray-300 mx-1 hidden lg:block"></div>

            <button
                onClick={() => setClearingEntityType(activeTab)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 text-sm"
                disabled={(activeTab === 'customers' && customers.length === 0) || (activeTab === 'suppliers' && suppliers.length === 0)}
            >
                <Icon name="trash" className="w-4 h-4" />
                Kosongkan
            </button>
            <button onClick={() => { setSelectedEntity(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <Icon name="plus" className="w-4 h-4" />
                Tambah {activeTab === 'customers' ? 'Pelanggan' : 'Supplier'}
            </button>
        </div>
      </div>

       <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button onClick={() => setActiveTab('customers')} className={`${activeTab === 'customers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                  <Icon name="users" className="w-5 h-5" /> Pelanggan
              </button>
              <button onClick={() => setActiveTab('suppliers')} className={`${activeTab === 'suppliers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                  <Icon name="truck" className="w-5 h-5" /> Supplier
              </button>
          </nav>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        {activeTab === 'customers' && (
           <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">Nama Pelanggan</th>
                        <th className="px-6 py-3">No. Telepon</th>
                        <th className="px-6 py-3">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(c => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{c.name}</td>
                            <td className="px-6 py-4">{c.phone}</td>
                            <td className="px-6 py-4 flex space-x-2">
                                <button onClick={() => { setSelectedEntity(c); setModalOpen(true); }} className="p-1 text-blue-600 hover:text-blue-800">
                                    <Icon name="edit" className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(c.id)} className="p-1 text-red-600 hover:text-red-800">
                                    <Icon name="trash" className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                     {customers.length === 0 && (
                        <tr>
                            <td colSpan={3} className="text-center py-8 text-gray-500">
                                Belum ada data pelanggan. Tambah manual atau Import CSV.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}
         {activeTab === 'suppliers' && (
           <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">Nama Supplier</th>
                        <th className="px-6 py-3">No. Telepon</th>
                        <th className="px-6 py-3">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map(s => (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{s.name}</td>
                            <td className="px-6 py-4">{s.phone}</td>
                            <td className="px-6 py-4 flex space-x-2">
                                <button onClick={() => { setSelectedEntity(s); setModalOpen(true); }} className="p-1 text-blue-600 hover:text-blue-800">
                                    <Icon name="edit" className="w-5 h-5" />
                                </button>
                                 <button onClick={() => handleDelete(s.id)} className="p-1 text-red-600 hover:text-red-800">
                                    <Icon name="trash" className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                     {suppliers.length === 0 && (
                        <tr>
                            <td colSpan={3} className="text-center py-8 text-gray-500">
                                Belum ada data supplier. Tambah manual atau Import CSV.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}
      </div>

       <Modal 
            isOpen={isModalOpen} 
            onClose={() => setModalOpen(false)} 
            title={selectedEntity ? `Edit ${activeTab === 'customers' ? 'Pelanggan' : 'Supplier'}` : `Tambah ${activeTab === 'customers' ? 'Pelanggan' : 'Supplier'} Baru`}
        >
            <CrmForm 
                entity={selectedEntity} 
                type={activeTab === 'customers' ? 'Customer' : 'Supplier'}
                onSave={activeTab === 'customers' ? handleSaveCustomer : handleSaveSupplier} 
                onClose={() => setModalOpen(false)}
            />
        </Modal>

        <Modal 
            isOpen={!!clearingEntityType} 
            onClose={() => setClearingEntityType(null)} 
            title={`Konfirmasi Kosongkan Data ${clearingEntityType === 'customers' ? 'Pelanggan' : 'Supplier'}`}
        >
            <div className="space-y-4">
                <p>
                    Apakah Anda yakin ingin menghapus semua data {clearingEntityType === 'customers' ? 'pelanggan' : 'supplier'}? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={() => setClearingEntityType(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
                    <button type="button" onClick={handleClearData} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Ya, Kosongkan</button>
                </div>
            </div>
        </Modal>

    </div>
  );
};

export default CrmManager;
