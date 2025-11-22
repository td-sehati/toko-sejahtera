
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, CartItem, Customer, PaymentMethod, Transaction, SavedOrder } from '../types';
import Icon from './common/Icon';
import Modal from './common/Modal';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const PriceEntryModal: React.FC<{
    item: CartItem;
    onClose: () => void;
    onSetPrice: (itemId: string, targetPrice: number) => void;
}> = ({ item, onClose, onSetPrice }) => {
    const [priceString, setPriceString] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Get only the digits from the input to store a clean numeric string
        const numericString = e.target.value.replace(/[^0-9]/g, '');
        setPriceString(numericString);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetPrice = parseInt(priceString, 10);
        
        if (!isNaN(targetPrice) && targetPrice > 0) {
            onSetPrice(item.id, targetPrice);
        } else {
            alert("Harap masukkan jumlah harga yang valid.");
        }
    };
    
    // Format the numeric string for display purposes (e.g., "6200" becomes "6.200")
    const displayValue = priceString === '' ? '' : new Intl.NumberFormat('id-ID').format(Number(priceString));

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold">Jual <span className="text-blue-600">{item.name}</span> Seharga</h3>
            <div>
                <label htmlFor="price-entry" className="block text-sm font-medium text-gray-700">Masukkan Jumlah Uang Pembeli (Rp)</label>
                <input
                    id="price-entry"
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 6200"
                    autoFocus
                    required
                />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Terapkan</button>
            </div>
        </form>
    );
};

interface POSProps {
  products: Product[];
  customers: Customer[];
  onProcessSale: (transaction: Transaction, receivableInfo?: { customerId: string; dueDate: string; downPayment: number }) => void;
  savedOrders: SavedOrder[];
  onSaveOrder: (order: SavedOrder) => void;
  onDeleteSavedOrder: (orderId: string) => void;
}

const POS: React.FC<POSProps> = ({ products, customers, onProcessSale, savedOrders, onSaveOrder, onDeleteSavedOrder }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [priceEntryModal, setPriceEntryModal] = useState<{item: CartItem | null}>({ item: null });
  const [isSaveOrderModalOpen, setSaveOrderModalOpen] = useState(false);
  const [isLoadOrderModalOpen, setLoadOrderModalOpen] = useState(false);
  const [saveOrderName, setSaveOrderName] = useState('');
  
  // Pre-selection Quantity State
  const [inputQty, setInputQty] = useState<number>(1);
  
  // Refs for shortcuts and navigation
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const customerInputRef = useRef<HTMLInputElement>(null);

  // Navigation State
  const [selectedIndex, setSelectedIndex] = useState(0);


  // State for checkout modal
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [downPayment, setDownPayment] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('');

  const filteredProducts = useMemo(() =>
    products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (!p.trackStock || p.stock > 0)
    ),
    [products, searchTerm]
  );

  const filteredCustomers = useMemo(() => 
    customers.filter(c => c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) || c.phone.includes(customerSearchTerm)),
    [customers, customerSearchTerm]
  );

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm, filteredProducts.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
        itemRefs.current[selectedIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
    }
  }, [selectedIndex]);

  // Auto-focus customer input when checkout opens
  useEffect(() => {
      if (isCheckoutOpen) {
          setTimeout(() => {
              customerInputRef.current?.focus();
          }, 100);
          setCustomerSearchTerm('');
          setShowCustomerDropdown(false);
      }
  }, [isCheckoutOpen]);

  const addToCart = (product: Product) => {
    const quantityToAdd = inputQty > 0 ? inputQty : 1;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        const newTotalQty = existingItem.quantity + quantityToAdd;
        if (!product.trackStock || newTotalQty <= product.stock) {
           return prevCart.map(item => item.id === product.id ? { ...item, quantity: newTotalQty } : item);
        } else {
             alert(`Stok tidak cukup. Maksimal stok tersedia: ${product.stock}`);
             return prevCart;
        }
      }
      
      if (product.trackStock && quantityToAdd > product.stock) {
          alert(`Stok tidak cukup. Maksimal stok tersedia: ${product.stock}`);
          return prevCart;
      }

      return [...prevCart, { ...product, quantity: quantityToAdd }];
    });
    
    // Reset input Qty back to 1 after adding
    setInputQty(1);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else if (!product.trackStock || newQuantity <= product.stock) {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
    } else {
      // If desired quantity exceeds stock, set it to max available stock
      setCart(cart.map(item => item.id === productId ? { ...item, quantity: product.stock } : item));
      alert(`Stok tidak cukup. Kuantitas maksimal untuk ${product.name} adalah ${product.stock}.`);
    }
  };

  const handleSetPrice = (itemId: string, targetPrice: number) => {
    const product = products.find(p => p.id === itemId);
    if (!product || !product.isDivisible) return;
    
    const newQuantity = targetPrice / product.price;
    updateQuantity(itemId, newQuantity);
    setPriceEntryModal({ item: null });
  };
  
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartTotalHPP = useMemo(() => cart.reduce((sum, item) => sum + item.hpp * item.quantity, 0), [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutOpen(true);
  };
  
  const handleSelectCustomer = (customer: Customer) => {
      setSelectedCustomerId(customer.id);
      setCustomerSearchTerm(customer.name);
      setShowCustomerDropdown(false);
  };

  const handleCustomerInputData = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomerSearchTerm(e.target.value);
      setSelectedCustomerId(''); // Reset ID if typing manually (unless re-selected)
      setShowCustomerDropdown(true);
  };

  const handleInitiateSaveOrder = () => {
    if (cart.length === 0) return;
    setSaveOrderName(`Pesanan ${savedOrders.length + 1}`);
    setSaveOrderModalOpen(true);
  };

  const handleConfirmSaveOrder = () => {
    if (!saveOrderName.trim()) {
        alert("Nama pesanan tidak boleh kosong.");
        return;
    }
    const newSavedOrder: SavedOrder = {
        id: `order-${Date.now()}`,
        name: saveOrderName,
        cart: cart,
        createdAt: new Date().toISOString(),
    };
    onSaveOrder(newSavedOrder);
    setCart([]);
    setSaveOrderModalOpen(false);
    setSaveOrderName('');
  };

  const handleLoadOrder = (orderId: string) => {
    if (cart.length > 0) {
        if (!window.confirm("Keranjang saat ini tidak kosong. Apakah Anda yakin ingin menggantinya dengan pesanan yang disimpan?")) {
            return;
        }
    }
    const orderToLoad = savedOrders.find(o => o.id === orderId);
    if (orderToLoad) {
        setCart(orderToLoad.cart);
        onDeleteSavedOrder(orderId);
        setLoadOrderModalOpen(false);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
     if (window.confirm("Apakah Anda yakin ingin menghapus pesanan yang disimpan ini?")) {
        onDeleteSavedOrder(orderId);
     }
  };

  const handleFinalizeSale = () => {
    // 1. Validate Customer for Pay Later
    if (paymentMethod === 'Pay Later' && !selectedCustomerId) {
      alert('Pilih pelanggan untuk transaksi Piutang.');
      return;
    }

    // 2. Validate Cash Amount
    let finalCashReceived = parseFloat(cashReceived) || 0;
    
    // If Cash method and input is empty/0, assume exact amount (Uang Pas)
    if (paymentMethod === 'Cash') {
        if (finalCashReceived === 0) {
            finalCashReceived = cartTotal;
        } else if (finalCashReceived < cartTotal) {
            alert('Uang tunai yang diterima kurang dari total tagihan.');
            return;
        }
    }

    // 3. Validate Down Payment for Pay Later
    const dpAmount = parseFloat(downPayment) || 0;
    if (paymentMethod === 'Pay Later' && dpAmount > cartTotal) {
        alert('Uang Muka tidak boleh melebihi total tagihan.');
        return;
    }

    const transaction: Transaction = {
      id: `TXN-${Date.now()}`,
      items: cart,
      total: cartTotal,
      totalHPP: cartTotalHPP,
      paymentMethod,
      // Save customer ID if selected, regardless of payment method
      customerId: selectedCustomerId || undefined, 
      createdAt: new Date().toISOString(),
    };

    const receivableInfo = paymentMethod === 'Pay Later'
      ? { customerId: selectedCustomerId, dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), downPayment: dpAmount }
      : undefined;

    onProcessSale(transaction, receivableInfo);
    
    // Reset State
    setCart([]);
    setCheckoutOpen(false);
    setPaymentMethod('Cash');
    setSelectedCustomerId('');
    setCustomerSearchTerm('');
    setDueDate('');
    setDownPayment('');
    setCashReceived('');
  };

  // --- Keyboard Navigation Logic ---

  // Calculate how many columns are currently visible in grid mode
  const getGridColumnCount = () => {
    if (viewMode === 'list') return 1;
    const w = window.innerWidth;
    // These breakpoints match Tailwind's default breakpoints
    if (w >= 1280) return 4; // xl
    if (w >= 1024) return 3; // lg
    if (w >= 768) return 4;  // md
    if (w >= 640) return 3;  // sm
    return 2;                // default/xs
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        // Move focus to the results container
        if (filteredProducts.length > 0) {
            resultsContainerRef.current?.focus();
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        // Add the top result if exists
        if (filteredProducts.length > 0) {
            const productToAdd = filteredProducts[selectedIndex >= 0 ? selectedIndex : 0];
            addToCart(productToAdd);
            setSearchTerm(''); // Clear search to be ready for next scan/type
            searchInputRef.current?.focus();
        }
    }
  };

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (filteredProducts.length === 0) return;

    const cols = getGridColumnCount();
    let nextIndex = selectedIndex;

    switch (e.key) {
        case 'ArrowRight':
            e.preventDefault();
            nextIndex = Math.min(selectedIndex + 1, filteredProducts.length - 1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            nextIndex = Math.max(selectedIndex - 1, 0);
            break;
        case 'ArrowDown':
            e.preventDefault();
            nextIndex = Math.min(selectedIndex + cols, filteredProducts.length - 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            nextIndex = Math.max(selectedIndex - cols, 0);
            break;
        case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
                addToCart(filteredProducts[selectedIndex]);
                setSearchTerm('');
                searchInputRef.current?.focus();
            }
            return;
        case 'Escape':
            e.preventDefault();
            searchInputRef.current?.focus();
            return;
        default:
            return;
    }

    setSelectedIndex(nextIndex);
  };

  // Global Keyboard Shortcuts (F keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isCheckoutOpen || isSaveOrderModalOpen || isLoadOrderModalOpen || priceEntryModal.item) return;

        if (e.key === 'F2') {
            e.preventDefault();
            searchInputRef.current?.focus();
        } else if (e.key === 'F4') {
            e.preventDefault();
            handleCheckout();
        } else if (e.key === 'F8') {
            e.preventDefault();
            handleInitiateSaveOrder();
        } else if (e.key === 'F9') {
            e.preventDefault();
            setLoadOrderModalOpen(true);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isCheckoutOpen, isSaveOrderModalOpen, isLoadOrderModalOpen, priceEntryModal]);


  const cashReceivedAmount = parseFloat(cashReceived) || 0;
  const changeDue = cashReceivedAmount >= cartTotal ? cashReceivedAmount - cartTotal : 0;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-6">
      {/* Product Selection */}
      <div className="flex-1 lg:w-3/5 bg-white p-4 rounded-lg shadow-md flex flex-col">
        <div className="flex items-end gap-2 mb-4">
             <div className="relative flex-grow">
                <label className="text-xs text-gray-500 font-semibold ml-1">Cari Produk (F2)</label>
                <div className="relative">
                    <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        ref={searchInputRef}
                        type="text"
                        placeholder="Nama atau SKU..."
                        className="pl-10 p-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        autoComplete="off"
                    />
                </div>
                <div className="absolute right-3 top-8 -translate-y-1/2 text-xs text-gray-400 hidden sm:block pointer-events-none">
                    Enter: Pilih
                </div>
             </div>
             
             <div className="w-20">
                <label className="text-xs text-gray-500 font-semibold ml-1">Qty</label>
                <input 
                    type="number" 
                    min="1"
                    value={inputQty}
                    onChange={(e) => setInputQty(parseFloat(e.target.value) || 1)}
                    className="p-2 border rounded-md w-full text-center focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                />
             </div>

            <div className="flex items-center space-x-1 self-end">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} title="Grid View">
                    <Icon name="menu" className="w-5 h-5" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} title="List View">
                    <Icon name="file-text" className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div 
            className="flex-1 overflow-y-auto pr-2 outline-none" 
            ref={resultsContainerRef}
            tabIndex={0}
            onKeyDown={handleGridKeyDown}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
              {filteredProducts.map((p, index) => (
                <div 
                    key={p.id} 
                    ref={(el) => { itemRefs.current[index] = el; }}
                    onClick={() => { addToCart(p); setSearchTerm(''); searchInputRef.current?.focus(); }} 
                    className={`border rounded-lg p-2 text-center cursor-pointer transition-all duration-150
                        ${index === selectedIndex ? 'ring-4 ring-blue-400 border-blue-500 bg-blue-50 transform scale-105 z-10 shadow-lg' : 'hover:shadow-lg'}
                    `}
                >
                  <img src={p.imageUrl} alt={p.name} className="w-full h-24 object-cover rounded-md mb-2" />
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <div className="flex justify-center items-center gap-1 mt-1">
                       <p className="text-xs text-gray-500">{formatCurrency(p.price)}</p>
                       {p.trackStock && <span className={`text-[10px] px-1 rounded ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.stock}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 p-1">
              {filteredProducts.map((p, index) => (
                <div 
                    key={p.id} 
                    ref={(el) => { itemRefs.current[index] = el; }}
                    onClick={() => { addToCart(p); setSearchTerm(''); searchInputRef.current?.focus(); }} 
                    className={`flex items-center justify-between p-2 border rounded-md cursor-pointer transition-all duration-150
                        ${index === selectedIndex ? 'ring-2 ring-blue-400 border-blue-500 bg-blue-50 shadow-md' : 'hover:bg-gray-50'}
                    `}
                >
                  <div className="flex items-center space-x-3">
                    <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded" />
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-gray-500">Stok: {p.trackStock ? p.stock : '∞'}</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(p.price)}</p>
                </div>
              ))}
            </div>
          )}
          {filteredProducts.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                  Tidak ada produk ditemukan.
              </div>
          )}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="lg:w-2/5 bg-white p-4 rounded-lg shadow-md flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Keranjang</h2>
          <button onClick={() => setLoadOrderModalOpen(true)} className="relative px-3 py-1 text-sm bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-500" title="Shortcut: F9">
            Pesanan Tersimpan
            {savedOrders.length > 0 && <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">{savedOrders.length}</span>}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Keranjang kosong</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {item.isDivisible && (
                    <button onClick={() => setPriceEntryModal({ item })} className="p-1 text-blue-600 hover:text-blue-800 bg-blue-100 rounded-md" title="Jual Seharga Tertentu">
                      Rp
                    </button>
                  )}
                  <input 
                    type="number"
                    value={item.quantity}
                    onChange={e => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                    className="w-20 p-1 border rounded"
                    step={item.isDivisible ? "0.001" : "1"}
                    min="0"
                    max={item.trackStock ? item.stock : undefined}
                  />
                  <button onClick={() => updateQuantity(item.id, 0)} className="text-red-500 hover:text-red-700">
                    <Icon name="trash" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <button onClick={handleInitiateSaveOrder} disabled={cart.length === 0} className="w-full bg-yellow-500 text-white p-2 rounded-lg font-bold hover:bg-yellow-600 disabled:bg-gray-400" title="Shortcut: F8">
            Simpan Pesanan (F8)
          </button>
          <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400" title="Shortcut: F4">
            Bayar (F4)
          </button>
        </div>
      </div>

      <Modal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} title="Pembayaran">
        <div className="space-y-4">
          <div className="text-right border-b pb-4">
            <p className="text-gray-500">Total Tagihan</p>
            <p className="text-3xl font-bold">{formatCurrency(cartTotal)}</p>
          </div>

          {/* Customer Selection - Searchable Combobox */}
          <div className="relative">
              <label className="font-semibold">Pelanggan {paymentMethod !== 'Pay Later' && <span className="font-normal text-gray-500">(Opsional)</span>}</label>
              <input
                  ref={customerInputRef}
                  type="text"
                  className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={paymentMethod === 'Pay Later' ? 'Ketik Nama Pelanggan (Wajib)' : 'Ketik Nama Pelanggan / Kosongkan untuk Umum'}
                  value={customerSearchTerm}
                  onChange={handleCustomerInputData}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onKeyDown={e => {
                      if (e.key === 'Enter') {
                          e.preventDefault(); // Prevent form submission
                          if (showCustomerDropdown && filteredCustomers.length > 0) {
                              handleSelectCustomer(filteredCustomers[0]);
                          } else {
                              setShowCustomerDropdown(false);
                              // Just keep the text as is for "Walk-in" or custom name if desired,
                              // but strictly speaking, ID remains empty unless selected from list.
                              // Focus moves to payment method or handleFinalizeSale if desired?
                              // For safety, let's just close dropdown.
                          }
                      }
                  }}
              />
              {showCustomerDropdown && customerSearchTerm && filteredCustomers.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {filteredCustomers.map(c => (
                          <li 
                            key={c.id} 
                            className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-none"
                            onClick={() => handleSelectCustomer(c)}
                          >
                              <div className="font-medium">{c.name}</div>
                              <div className="text-xs text-gray-500">{c.phone}</div>
                          </li>
                      ))}
                  </ul>
              )}
              {showCustomerDropdown && customerSearchTerm && filteredCustomers.length === 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-2 text-sm text-gray-500">
                      Pelanggan tidak ditemukan.
                  </div>
              )}
          </div>

          <div>
            <label className="font-semibold">Metode Pembayaran</label>
            <select
              className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              onKeyDown={e => e.key === 'Enter' && handleFinalizeSale()}
            >
              <option>Cash</option>
              <option>QRIS</option>
              <option>Card</option>
              <option>Transfer</option>
              <option>Pay Later</option>
            </select>
          </div>

          {paymentMethod === 'Cash' && (
            <div className="space-y-3 pt-2">
                <div>
                    <label className="font-semibold">Uang Tunai Diterima</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={cashReceived}
                        onChange={e => setCashReceived(e.target.value)}
                        placeholder={`Kosongkan = Uang Pas (${formatCurrency(cartTotal)})`}
                        min="0"
                        onKeyDown={e => e.key === 'Enter' && handleFinalizeSale()}
                    />
                    <p className="text-xs text-gray-400 mt-1">Tekan <strong>Enter</strong> untuk langsung memproses (Uang Pas).</p>
                </div>
                {cashReceivedAmount >= cartTotal && (
                    <div className="text-right p-3 bg-green-50 rounded-lg">
                        <p className="text-gray-500">Kembalian</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(changeDue)}</p>
                    </div>
                )}
            </div>
          )}

          {paymentMethod === 'Pay Later' && (
            <div className="p-4 bg-yellow-50 rounded-lg space-y-3">
              <h4 className="font-semibold text-yellow-800">Detail Piutang</h4>
               <div>
                <label className="font-semibold">Uang Muka (DP)</label>
                <input
                    type="number"
                    className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-yellow-500 outline-none"
                    value={downPayment}
                    onChange={e => setDownPayment(e.target.value)}
                    placeholder="0"
                    min="0"
                    max={cartTotal}
                    onKeyDown={e => e.key === 'Enter' && handleFinalizeSale()}
                />
              </div>
               <div>
                <label className="font-semibold">Tanggal Jatuh Tempo</label>
                <input
                    type="date"
                    className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-yellow-500 outline-none"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFinalizeSale()}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <button onClick={() => setCheckoutOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal (Esc)</button>
            <button onClick={handleFinalizeSale} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Selesaikan (Enter)
            </button>
          </div>
        </div>
      </Modal>

      {priceEntryModal.item && (
          <Modal isOpen={!!priceEntryModal.item} onClose={() => setPriceEntryModal({item: null})} title="Jual Berdasarkan Harga">
              <PriceEntryModal 
                item={priceEntryModal.item}
                onClose={() => setPriceEntryModal({item: null})}
                onSetPrice={handleSetPrice}
              />
          </Modal>
      )}

        <Modal isOpen={isSaveOrderModalOpen} onClose={() => setSaveOrderModalOpen(false)} title="Simpan Pesanan">
            <div className="space-y-4">
                <label htmlFor="orderName" className="block text-sm font-medium text-gray-700">Beri nama untuk pesanan ini:</label>
                <input
                    id="orderName"
                    type="text"
                    value={saveOrderName}
                    onChange={(e) => setSaveOrderName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., Ibu Baju Merah"
                    autoFocus
                />
                <div className="flex justify-end space-x-2 pt-2">
                    <button onClick={() => setSaveOrderModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
                    <button onClick={handleConfirmSaveOrder} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
                </div>
            </div>
        </Modal>

        <Modal isOpen={isLoadOrderModalOpen} onClose={() => setLoadOrderModalOpen(false)} title="Buka Pesanan Tersimpan" size="lg">
            <div className="space-y-3">
                {savedOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-5">Tidak ada pesanan yang disimpan.</p>
                ) : (
                    savedOrders.map(order => {
                        const total = order.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                        return (
                            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold">{order.name}</p>
                                    <p className="text-sm text-gray-500">{order.cart.length} item - Total: {formatCurrency(total)}</p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => handleLoadOrder(order.id)} className="px-3 py-1 text-sm bg-blue-50 text-white rounded hover:bg-blue-600">Buka</button>
                                    <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-red-500 hover:bg-gray-100 rounded-full">
                                        <Icon name="trash" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </Modal>
    </div>
  );
};

export default POS;
