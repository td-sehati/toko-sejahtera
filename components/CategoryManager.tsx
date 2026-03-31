
import React, { useState } from 'react';
import { Category } from '../types';
import { supabase } from '../supabaseClient';
import Modal from './common/Modal';
import Icon from './common/Icon';
import { toDbCategory } from '../dbMappers';

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

const CategoryForm: React.FC<{
    category: Category | null,
    onSave: (category: Category) => void,
    onClose: () => void,
}> = ({ category, onSave, onClose }) => {
    const [name, setName] = useState(category?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return; // Basic validation
        onSave({ id: category?.id || `cat-${Date.now()}`, name });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Nama Kategori</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded-md p-2" required />
            </div>
             <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Simpan</button>
            </div>
        </form>
    );
};

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onRefresh }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleSave = async (category: Category) => {
      const { error } = await supabase.from('categories').upsert(toDbCategory(category));
      if (!error) {
          onRefresh();
          setModalOpen(false);
          setSelectedCategory(null);
      } else {
          alert("Gagal menyimpan kategori.");
      }
  };
  
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    const { error } = await supabase.from('categories').delete().eq('id', categoryToDelete.id);
    if (!error) {
        onRefresh();
        setCategoryToDelete(null);
    } else {
        alert("Gagal menghapus kategori.");
    }
  }

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  }
  
  const openAddModal = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Kategori Produk</h1>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Icon name="plus" className="w-5 h-5" />
            Tambah Kategori
        </button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Nama Kategori</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{c.name}</td>
                                <td className="px-6 py-4 text-right flex items-center justify-end space-x-2">
                                    <button onClick={() => openEditModal(c)} className="p-2 text-blue-600 hover:bg-gray-100 rounded-full" title="Edit">
                                        <Icon name="edit" className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setCategoryToDelete(c)} className="p-2 text-red-600 hover:bg-gray-100 rounded-full" title="Hapus">
                                        <Icon name="trash" className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={2} className="text-center py-10 text-gray-500">
                                    Belum ada kategori yang ditambahkan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
           </div>
      </div>
       <Modal 
            isOpen={isModalOpen} 
            onClose={() => setModalOpen(false)} 
            title={selectedCategory ? `Edit Kategori` : `Tambah Kategori Baru`}
        >
            <CategoryForm 
                category={selectedCategory} 
                onSave={handleSave} 
                onClose={() => setModalOpen(false)}
            />
        </Modal>
        <Modal 
            isOpen={!!categoryToDelete} 
            onClose={() => setCategoryToDelete(null)} 
            title="Konfirmasi Hapus Kategori"
            size="sm"
        >
            <div className="space-y-4">
                <p>
                    Apakah Anda yakin ingin menghapus kategori <strong>"{categoryToDelete?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={() => setCategoryToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
                    <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Ya, Hapus</button>
                </div>
            </div>
        </Modal>
    </div>
  );
};
export default CategoryManager;
