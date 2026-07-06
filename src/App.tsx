import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Receipt, Package, Users, BarChart2, Settings, LogOut, Building,
  Wifi, Bluetooth, Sparkles, Clock, ShieldAlert, Heart, RefreshCw, AlertCircle, Stethoscope, MessageSquare,
  Activity, Menu, LayoutDashboard, ChevronDown, Bell, Check
} from 'lucide-react';

import {
  Medicine, Customer, Supplier, StockInflow, Sale, Employee, AppSettings, Doctor
} from './types';

import {
  INITIAL_MEDICINES, INITIAL_CUSTOMERS, INITIAL_SUPPLIERS,
  INITIAL_STOCK_INFLOWS, INITIAL_SALES, INITIAL_DOCTORS
} from './data';

import Login from './components/Login';
import POS from './components/POS';
import Inventory from './components/Inventory';
import SalesSuppliers from './components/SalesSuppliers';
import Customers from './components/Customers';
import Doctors from './components/Doctors';
import Reports from './components/Reports';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import SettingsComponent from './components/Settings';
import WhatsappSettings from './components/WhatsappSettings';
import CuteLogo from './components/CuteLogo';

export default function App() {
  // 1. Core State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockInflows, setStockInflows] = useState<StockInflow[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'ApoCute Ceria',
    companyLogoType: 'cute-pill',
    theme: 'lavender',
    printerConnected: true,
    printerName: 'ApoCute Thermal BT-58'
  });

  // 2. Authentication State
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  // 3. Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'transactions' | 'inventory' | 'suppliers' | 'customers' | 'doctors' | 'reports' | 'whatsapp' | 'settings'>('pos');
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // 4. Load initial database state from local storage or static seed data
  useEffect(() => {
    try {
      const storedMedicines = localStorage.getItem('apocute_medicines');
      const storedCustomers = localStorage.getItem('apocute_customers');
      const storedSuppliers = localStorage.getItem('apocute_suppliers');
      const storedInflows = localStorage.getItem('apocute_inflows');
      const storedSales = localStorage.getItem('apocute_sales');
      const storedDoctors = localStorage.getItem('apocute_doctors');
      const storedSettings = localStorage.getItem('apocute_settings');
      const storedEmployee = sessionStorage.getItem('apocute_active_employee');

      if (storedMedicines) setMedicines(JSON.parse(storedMedicines));
      else {
        setMedicines(INITIAL_MEDICINES);
        localStorage.setItem('apocute_medicines', JSON.stringify(INITIAL_MEDICINES));
      }

      if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
      else {
        setCustomers(INITIAL_CUSTOMERS);
        localStorage.setItem('apocute_customers', JSON.stringify(INITIAL_CUSTOMERS));
      }

      if (storedSuppliers) setSuppliers(JSON.parse(storedSuppliers));
      else {
        setSuppliers(INITIAL_SUPPLIERS);
        localStorage.setItem('apocute_suppliers', JSON.stringify(INITIAL_SUPPLIERS));
      }

      if (storedInflows) setStockInflows(JSON.parse(storedInflows));
      else {
        setStockInflows(INITIAL_STOCK_INFLOWS);
        localStorage.setItem('apocute_inflows', JSON.stringify(INITIAL_STOCK_INFLOWS));
      }

      if (storedSales) setSalesHistory(JSON.parse(storedSales));
      else {
        setSalesHistory(INITIAL_SALES);
        localStorage.setItem('apocute_sales', JSON.stringify(INITIAL_SALES));
      }

      if (storedDoctors) {
        setDoctors(JSON.parse(storedDoctors));
      } else {
        setDoctors(INITIAL_DOCTORS);
        localStorage.setItem('apocute_doctors', JSON.stringify(INITIAL_DOCTORS));
      }

      if (storedSettings) setSettings(JSON.parse(storedSettings));

      if (storedEmployee) setActiveEmployee(JSON.parse(storedEmployee));
    } catch (e) {
      console.error('Gagal memuat local storage database', e);
    }
  }, []);

  // 5. Automatic background saving (Offline-first persistence)
  useEffect(() => {
    if (medicines.length > 0) localStorage.setItem('apocute_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    if (customers.length > 0) localStorage.setItem('apocute_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    if (suppliers.length > 0) localStorage.setItem('apocute_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    if (stockInflows.length > 0) localStorage.setItem('apocute_inflows', JSON.stringify(stockInflows));
  }, [stockInflows]);

  useEffect(() => {
    if (salesHistory.length > 0) localStorage.setItem('apocute_sales', JSON.stringify(salesHistory));
  }, [salesHistory]);

  useEffect(() => {
    if (doctors.length > 0) localStorage.setItem('apocute_doctors', JSON.stringify(doctors));
  }, [doctors]);

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('apocute_settings', JSON.stringify(newSettings));
  };

  // 6. Security login actions
  const handleLoginSuccess = (employee: Employee) => {
    setActiveEmployee(employee);
    sessionStorage.setItem('apocute_active_employee', JSON.stringify(employee));
  };

  const handleLogout = () => {
    setActiveEmployee(null);
    sessionStorage.removeItem('apocute_active_employee');
  };

  // 7. Inventory update handlers
  const handleNewSale = (sale: Sale) => {
    setSalesHistory([sale, ...salesHistory]);
  };

  const updateMedicineStock = (id: string, newStock: number) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, stock: Math.max(0, newStock) } : m));
  };

  const updateCustomerPoints = (id: string, newPoints: number) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, points: newPoints } : c));
  };

  // 8. Stock Inflow & Debt update handlers
  const addStockInflow = (inflow: StockInflow) => {
    setStockInflows([inflow, ...stockInflows]);
  };

  const updateSupplierDebt = (supplierId: string, amountToAdd: number) => {
    setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, debt: s.debt + amountToAdd } : s));
  };

  const handlePaySupplierDebt = (supplierId: string, amountToPay: number) => {
    setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, debt: Math.max(0, s.debt - amountToPay) } : s));
  };

  // 9. Customer management handlers
  const addCustomer = (cust: Customer) => {
    setCustomers([cust, ...customers]);
  };

  const updateCustomer = (cust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === cust.id ? cust : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // 10. Medicine management handlers
  const addMedicine = (med: Medicine) => {
    setMedicines([med, ...medicines]);
  };

  const updateMedicine = (med: Medicine) => {
    setMedicines(prev => prev.map(m => m.id === med.id ? med : m));
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  // 11. Supplier management handlers
  const addSupplier = (sup: Supplier) => {
    setSuppliers([sup, ...suppliers]);
  };

  const updateSupplier = (sup: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === sup.id ? sup : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // 11.5. Doctor management handlers
  const addDoctor = (doc: Doctor) => {
    setDoctors([doc, ...doctors]);
  };

  const updateDoctor = (doc: Doctor) => {
    setDoctors(prev => prev.map(d => d.id === doc.id ? doc : d));
  };

  const deleteDoctor = (id: string) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
  };

  // 12. Backup & Restore logic
  const handleBackupData = () => {
    const dataToBackup = {
      medicines,
      customers,
      suppliers,
      stockInflows,
      salesHistory,
      doctors,
      settings
    };
    const blob = new Blob([JSON.stringify(dataToBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apocute_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.medicines && parsed.customers && parsed.suppliers && parsed.salesHistory) {
          setMedicines(parsed.medicines);
          setCustomers(parsed.customers);
          setSuppliers(parsed.suppliers);
          setStockInflows(parsed.stockInflows || []);
          setSalesHistory(parsed.salesHistory);
          if (parsed.doctors) setDoctors(parsed.doctors);
          if (parsed.settings) setSettings(parsed.settings);
          alert('Data ApoCute berhasil dipulihkan dari file backup!');
        } else {
          alert('Format file backup tidak valid! Pastikan Anda memulihkan berkas JSON ApoCute.');
        }
      } catch (err) {
        alert('Gagal membaca file backup!');
      }
    };
    reader.readAsText(file);
  };

  // 13. Theme definitions mapper
  const getThemeConfig = () => {
    return {
      bg: 'bg-3d-app',
      sidebarBg: 'bg-[var(--color-card-bg)] text-purple-900 shadow-3d-card',
      sidebarGlass: 'bg-[var(--color-card-bg)]/80 text-purple-900 border border-white/60 backdrop-blur-xl shadow-3d-card rounded-3xl m-2',
      activeItem: 'bg-white shadow-3d-button text-pink-600 font-bold',
      primaryText: 'text-[var(--grad-end)]',
      accent: 'text-[var(--grad-end)]',
      gradient: 'text-3d-gradient',
      glow: 'shadow-3d-gradient'
    };
  };

  const themeStyle = getThemeConfig();

  // If user is not logged in, show security gate
  if (!activeEmployee) {
    return <Login onLoginSuccess={handleLoginSuccess} theme={settings.theme} />;
  }

  // Low Stock Items summary badge
  const lowStockCount = medicines.filter(m => m.stock <= m.minStock).length;

  return (
    <div className={`min-h-screen flex flex-col theme-${settings.theme} ${themeStyle.bg} transition-colors duration-300 font-sans`}>
      
      {/* TOP STATUS BAR / HEADER (Menu & Notifikasi Dropdown) */}
      <header className="sticky top-0 z-50 bg-[var(--color-card-bg)]/90 backdrop-blur-md px-4 py-3 sm:px-6 flex items-center justify-between shadow-3d-card rounded-b-3xl mb-4 mx-2">
        {/* Left Side: Brand Logo and Title */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMenuDropdown(!showMenuDropdown);
              setShowNotificationDropdown(false);
            }}
            className="flex items-center gap-3 cursor-pointer text-left active:scale-[0.98] transition-transform outline-none"
          >
            <div className="bg-white p-2 rounded-2xl shadow-3d-icon flex items-center justify-center shrink-0">
              <CuteLogo type={settings.companyLogoType} theme={settings.theme} size={28} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-black text-sm sm:text-base tracking-tight text-[var(--grad-end)] leading-none">
                  {settings.companyName}
                </h1>
                <span className="w-2 h-2 rounded-full bg-[var(--grad-start)] shadow-[0_0_8px_var(--grad-start)] animate-pulse" title="Sistem Aktif" />
              </div>
              <span className="text-[10px] text-purple-500 font-mono tracking-widest uppercase block mt-1 leading-none">
                Panel: {activeTab === 'dashboard' ? 'Dasbor Utama' : activeTab === 'pos' ? 'Kasir Kas Utama' : activeTab === 'transactions' ? 'Transaksi Keuangan' : activeTab === 'inventory' ? 'Database Inventori' : activeTab === 'suppliers' ? 'Sales Representative' : activeTab === 'customers' ? 'Loyalty Pelanggan' : activeTab === 'doctors' ? 'Jadwal & Dokter Jaga' : activeTab === 'reports' ? 'Analitis Keuangan' : activeTab === 'whatsapp' ? 'WhatsApp API & Template' : 'Pengaturan Identitas'}
              </span>
            </div>
          </button>

          {/* Menu Dropdown Panel */}
          <AnimatePresence>
            {showMenuDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95, originX: 0, originY: 0 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 mt-4 w-72 bg-[var(--color-card-bg)] rounded-[2rem] shadow-3d-card border border-white/50 p-5 z-50 text-purple-900 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-purple-200/50 pb-3 px-1">
                  <span className="font-display font-black text-[10px] text-purple-500/80 uppercase tracking-widest">Navigasi Panel</span>
                  <span className="text-[9px] bg-[var(--color-input-bg)] shadow-3d-button text-[var(--grad-start)] px-3 py-1 rounded-full font-bold capitalize">{activeEmployee.role}</span>
                </div>

                {/* Navigation Grid (Compact Icon panel with captions) */}
                <div className="grid grid-cols-4 gap-3">
                                    {/* Dashboard */}
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setShowMenuDropdown(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent ${
                      activeTab === 'dashboard' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                    }`}
                    title="Dasbor Utama"
                  >
                    <span className="flex items-center justify-center">
                      <LayoutDashboard className="w-5 h-5 drop-shadow-sm" />
                    </span>
                    <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">Dasbor</span>
                  </button>
                  {/* POS */}
                  <button
                    onClick={() => {
                      setActiveTab('pos');
                      setShowMenuDropdown(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent ${
                      activeTab === 'pos' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                    }`}
                    title="Kasir (POS)"
                  >
                    <span className="flex items-center justify-center">
                      <Receipt className="w-5 h-5 drop-shadow-sm" />
                    </span>
                    <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">Kasir</span>
                  </button>

                  {/* Inventory */}
                  <button
                    onClick={() => {
                      setActiveTab('inventory');
                      setShowMenuDropdown(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent ${
                      activeTab === 'inventory' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                    }`}
                    title="Manajemen Stok"
                  >
                    <span className="flex items-center justify-center">
                      <Package className="w-5 h-5 drop-shadow-sm" />
                    </span>
                    <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">Stok</span>
                  </button>

                  {/* Suppliers */}
                  <button
                    onClick={() => {
                      setActiveTab('suppliers');
                      setShowMenuDropdown(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent ${
                      activeTab === 'suppliers' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                    }`}
                    title="Sales & Hutang"
                  >
                    <span className="flex items-center justify-center">
                      <Building className="w-5 h-5 drop-shadow-sm" />
                    </span>
                    <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">Sales</span>
                  </button>

                  {/* Customers */}
                  <button
                    onClick={() => {
                      setActiveTab('customers');
                      setShowMenuDropdown(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent ${
                      activeTab === 'customers' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                    }`}
                    title="Pelanggan (Loyalty)"
                  >
                    <span className="flex items-center justify-center">
                      <Users className="w-5 h-5 drop-shadow-sm" />
                    </span>
                    <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">Pasien</span>
                  </button>

                  {/* Doctors */}
                  <button
                    onClick={() => {
                      setActiveTab('doctors');
                      setShowMenuDropdown(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent ${
                      activeTab === 'doctors' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                    }`}
                    title="Dokter & Jaga"
                  >
                    <span className="flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 drop-shadow-sm" />
                    </span>
                    <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">Dokter</span>
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={() => {
                      setActiveTab('whatsapp');
                      setShowMenuDropdown(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent ${
                      activeTab === 'whatsapp' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                    }`}
                    title="WhatsApp API & Gateway"
                  >
                    <span className="flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 drop-shadow-sm" />
                    </span>
                    <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">WA API</span>
                  </button>

                                    {activeEmployee.role.toLowerCase() === 'admin' && (
                    <button
                      onClick={() => {
                        setActiveTab('transactions');
                        setShowMenuDropdown(false);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent ${
                        activeTab === 'transactions' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                      }`}
                      title="Riwayat Transaksi"
                    >
                      <span className="flex items-center justify-center">
                        <Activity className="w-5 h-5 drop-shadow-sm" />
                      </span>
                      <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">Transaksi</span>
                    </button>
                  )}

                  {/* Reports - Admin Only */}
                  {activeEmployee.role.toLowerCase() === 'admin' && (
                    <button
                      onClick={() => {
                        setActiveTab('reports');
                        setShowMenuDropdown(false);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent ${
                        activeTab === 'reports' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                      }`}
                      title="Laporan & Laba"
                    >
                      <span className="flex items-center justify-center">
                        <BarChart2 className="w-5 h-5 drop-shadow-sm" />
                      </span>
                      <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">Laporan</span>
                    </button>
                  )}

                  {/* Settings - Available for all */}
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowMenuDropdown(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent ${
                      activeTab === 'settings' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                    }`}
                    title="Pengaturan Sistem"
                  >
                    <span className="flex items-center justify-center">
                      <Settings className="w-5 h-5 drop-shadow-sm" />
                    </span>
                    <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">Sistem</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-purple-200/50 mt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-white shadow-3d-button hover:bg-rose-50 text-rose-500 font-display font-black text-[11px] transition-all border-transparent active:shadow-3d-input cursor-pointer tracking-wide uppercase"
                  >
                    <LogOut className="w-4 h-4" />
                    Kunci Aplikasi
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Notification Icon & Menu Dropdown Icon */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationDropdown(!showNotificationDropdown);
                setShowMenuDropdown(false);
              }}
              className="relative p-2.5 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button text-[var(--grad-start)] transition-all flex items-center justify-center cursor-pointer active:scale-95"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-mono font-bold text-[10px] rounded-full flex items-center justify-center shadow-lg shadow-pink-500/50 animate-bounce">
                  {lowStockCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT STAGE */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">

        {/* Tab Router Switch */}
        <div className="transition-all duration-300">
                    {activeTab === 'dashboard' && (
            <Dashboard
              medicines={medicines}
              customers={customers}
              salesHistory={salesHistory}
              doctors={doctors}
              activeEmployee={activeEmployee!}
              settings={settings}
              setActiveTab={setActiveTab}
              theme={settings.theme}
            />
          )}

          {activeTab === 'pos' && (
            <POS
              medicines={medicines}
              customers={customers}
              onNewSale={handleNewSale}
              onUpdateMedicineStock={updateMedicineStock}
              onUpdateCustomerPoints={updateCustomerPoints}
              activeEmployee={activeEmployee}
              settings={settings}
              theme={settings.theme}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              medicines={medicines}
              suppliers={suppliers}
              stockInflows={stockInflows}
              onAddMedicine={addMedicine}
              onUpdateMedicine={updateMedicine}
              onDeleteMedicine={deleteMedicine}
              onAddStockInflow={addStockInflow}
              onUpdateSupplierDebt={updateSupplierDebt}
              theme={settings.theme}
            />
          )}

          {activeTab === 'suppliers' && (
            <SalesSuppliers
              suppliers={suppliers}
              stockInflows={stockInflows}
              medicines={medicines}
              onAddSupplier={addSupplier}
              onUpdateSupplier={updateSupplier}
              onDeleteSupplier={deleteSupplier}
              onPayDebt={handlePaySupplierDebt}
              theme={settings.theme}
            />
          )}

          {activeTab === 'customers' && (
            <Customers
              customers={customers}
              salesHistory={salesHistory}
              onAddCustomer={addCustomer}
              onUpdateCustomer={updateCustomer}
              onDeleteCustomer={deleteCustomer}
              theme={settings.theme}
            />
          )}

          {activeTab === 'doctors' && (
            <Doctors
              doctors={doctors}
              onAddDoctor={addDoctor}
              onUpdateDoctor={updateDoctor}
              onDeleteDoctor={deleteDoctor}
              settings={settings}
              theme={settings.theme}
            />
          )}

          {activeTab === 'transactions' && (
            <Transactions
              salesHistory={salesHistory}
              theme={settings.theme}
              settings={settings}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              salesHistory={salesHistory}
              medicines={medicines}
              suppliers={suppliers}
              theme={settings.theme}
            />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsappSettings
              settings={settings}
              onUpdateSettings={updateSettings}
              theme={settings.theme}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsComponent
              settings={settings}
              onUpdateSettings={updateSettings}
              activeEmployee={activeEmployee}
              onLogout={handleLogout}
              onBackupData={handleBackupData}
              onRestoreData={handleRestoreData}
              theme={settings.theme}
            />
          )}
        </div>
      </main>

      {/* Center Popup Notification */}
      <AnimatePresence>
        {showNotificationDropdown && (
          <>
            {/* Full screen backdrop for centering */}
            <div
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[998] flex items-center justify-center p-4"
              onClick={() => setShowNotificationDropdown(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[var(--color-card-bg)] rounded-[2rem] shadow-3d-card border border-white/50 p-6 text-purple-900 space-y-5 z-[999]"
              >
                <div className="flex justify-between items-center border-b border-[var(--color-bg-light)] pb-3">
                  <span className="font-display font-black text-xs text-[var(--grad-end)] uppercase tracking-widest">Notifikasi Sistem</span>
                  <button onClick={() => setShowNotificationDropdown(false)} className="text-[10px] text-purple-500 font-bold hover:underline bg-[var(--color-input-bg)] shadow-3d-button px-3 py-1 rounded-full active:shadow-3d-input transition-all">TUTUP</button>
                </div>

                <div className="space-y-4 max-h-[280px] overflow-y-auto scrollbar-thin px-1 pb-2">
                  {/* Low Stock Alerts */}
                  {lowStockCount > 0 ? (
                    <div className="p-4 bg-white shadow-3d-input border-transparent rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-[var(--grad-end)] font-black text-xs uppercase tracking-wide">
                        <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse drop-shadow-sm" />
                        <span>{lowStockCount} Obat Butuh Restock</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                        Beberapa obat telah mencapai atau di bawah batas minimum stok yang ditentukan. Segera lakukan pemesanan ke Sales Representative.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-white shadow-3d-input border-transparent rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-wide">
                        <Check className="w-4 h-4 shrink-0 drop-shadow-sm" />
                        <span>Stok Obat Aman</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                        Seluruh katalog obat memiliki stok di atas ambang minimum. Kinerja operasional optimal.
                      </p>
                    </div>
                  )}

                  {/* Printer status info */}
                  <div className="p-4 bg-white shadow-3d-button border-transparent rounded-2xl flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-3 text-purple-900">
                      <Bluetooth className={`w-5 h-5 drop-shadow-sm ${settings.printerConnected ? 'text-[var(--grad-start)] animate-pulse' : 'text-slate-400'}`} />
                      <div>
                        <span className="font-black block text-[11px] uppercase tracking-wide">Bluetooth Printer</span>
                        <span className="text-purple-500/80 font-mono text-[10px] font-bold">{settings.printerName}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full font-mono text-[9px] font-black uppercase tracking-widest shadow-inner ${settings.printerConnected ? 'bg-[var(--color-input-bg)] text-[var(--grad-start)]' : 'bg-slate-100 text-slate-400'}`}>
                      {settings.printerConnected ? 'Connected' : 'Offline'}
                    </span>
                  </div>

                  {/* Employee Status */}
                  <div className="p-4 bg-white shadow-3d-button border-transparent rounded-2xl flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-3 text-purple-900">
                      <span className="w-3 h-3 rounded-full bg-[var(--grad-start)] shadow-[0_0_8px_var(--grad-start)] animate-pulse shrink-0" />
                      <div>
                        <span className="font-black block text-[11px] uppercase tracking-wide">Karyawan Aktif</span>
                        <span className="text-purple-500/80 font-bold capitalize">{activeEmployee.role} - {activeEmployee.username}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
