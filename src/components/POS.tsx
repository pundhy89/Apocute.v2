import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Barcode, Plus, Minus, Trash2, Search, Receipt, Printer, QrCode,
  UserCheck, Percent, Wifi, Smartphone, Bluetooth, Check, RefreshCw, X, Camera, Sparkles, Delete, Clock
} from 'lucide-react';
import { Medicine, Customer, Sale, AppSettings } from '../types';
import { formatRupiah, generateInvoiceNumber, calculateLoyaltyPoints } from '../utils';
import { sendWhatsAppMessage } from '../utils/whatsapp';

interface POSProps {
  medicines: Medicine[];
  customers: Customer[];
  onNewSale: (sale: Sale) => void;
  onUpdateMedicineStock: (id: string, newStock: number) => void;
  onUpdateCustomerPoints: (id: string, newPoints: number) => void;
  activeEmployee: any;
  settings: AppSettings;
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
}

export default function POS({
  medicines,
  customers,
  onNewSale,
  onUpdateMedicineStock,
  onUpdateCustomerPoints,
  activeEmployee,
  settings,
  theme
}: POSProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ medicine: Medicine; quantity: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashAmount, setCashAmount] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scannedCode, setScannedCode] = useState('');

  // Camera integration state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Bluetooth Print state
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [searchingPrinters, setSearchingPrinters] = useState(false);
  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState(settings.printerName || '');
  const [isPrinterConnected, setIsPrinterConnected] = useState(settings.printerConnected);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState<Sale | null>(null);

  // Digital Payment State
  const [showQRModal, setShowQRModal] = useState(false);
  const [isGeneratingDana, setIsGeneratingDana] = useState(false);
  const [danaPaymentData, setDanaPaymentData] = useState<any>(null);

  // Today's Sales State (For cashier dashboard)
  const [todaySales, setTodaySales] = useState<Sale[]>([]);

  // Focus scanner ref or search ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load today's transactions
  const loadTodaySales = () => {
    try {
      const stored = localStorage.getItem('apocute_sales');
      if (stored) {
        const parsed: Sale[] = JSON.parse(stored);
        const todayStr = new Date().toISOString().split('T')[0];
        const filtered = parsed.filter(s => s.date.startsWith(todayStr));
        setTodaySales(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTodaySales();
  }, []);

  // Filter medicines based on search term (name, code, category)
  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.includes(searchTerm) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add item to cart
  const addToCart = (medicine: Medicine) => {
    if (medicine.stock <= 0) {
      alert(`Maaf, stok ${medicine.name} habis!`);
      return;
    }

    const existing = cart.find(item => item.medicine.id === medicine.id);
    if (existing) {
      if (existing.quantity >= medicine.stock) {
        alert(`Tidak bisa menambah lebih banyak. Stok maksimum adalah ${medicine.stock}.`);
        return;
      }
      setCart(cart.map(item =>
        item.medicine.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { medicine, quantity: 1 }]);
    }
  };

  // Modify quantity
  const updateQuantity = (medicineId: string, delta: number) => {
    const item = cart.find(i => i.medicine.id === medicineId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.medicine.id !== medicineId));
    } else {
      if (newQty > item.medicine.stock) {
        alert(`Stok hanya tersedia ${item.medicine.stock} unit.`);
        return;
      }
      setCart(cart.map(i =>
        i.medicine.id === medicineId ? { ...i, quantity: newQty } : i
      ));
    }
  };

  // Remove from cart
  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter(i => i.medicine.id !== medicineId));
  };

  // Calculate totals
  const subtotal = cart.reduce((acc, curr) => acc + (curr.medicine.sellPrice * curr.quantity), 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const total = Math.max(0, subtotal - discountAmount);
  const changeAmount = cashAmount ? Math.max(0, parseInt(cashAmount) - total) : 0;

  // Simulate scanning code
  const triggerScanCode = (code: string) => {
    setScanStatus('scanning');
    setScannedCode(code);
    setTimeout(() => {
      const match = medicines.find(m => m.code === code);
      if (match) {
        setScanStatus('success');
        addToCart(match);
        setTimeout(() => {
          setShowScanner(false);
          setScanStatus('idle');
          setScannedCode('');
        }, 1000);
      } else {
        alert(`Produk dengan Barcode ${code} tidak ditemukan!`);
        setScanStatus('idle');
        setScannedCode('');
      }
    }, 1200);
  };

  // Camera integration effects
  const startCameraScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      setCameraActive(false);
    }
  };

  const stopCameraScan = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setCameraActive(false);
  };

  useEffect(() => {
    if (showScanner) {
      startCameraScan();
    } else {
      stopCameraScan();
    }
    return () => {
      stopCameraScan();
    };
  }, [showScanner]);

  // Touch Calculator keypad handler
  const handleNumpadPress = (val: string) => {
    if (val === 'C') {
      setCashAmount('');
    } else if (val === '00') {
      setCashAmount(prev => prev ? prev + '00' : '');
    } else if (val.startsWith('+')) {
      const addValue = parseInt(val.replace(/[^\d]/g, '')) || 0;
      setCashAmount(prev => {
        const current = parseInt(prev) || 0;
        return (current + addValue).toString();
      });
    } else {
      setCashAmount(prev => {
        // Prevent typing more than 9 digits (billion rupiah range) for safety
        if (prev.length >= 9) return prev;
        return prev + val;
      });
    }
  };

  // Connect Bluetooth Printer
  const connectBluetoothPrinter = async () => {
    setSearchingPrinters(true);
    // Real Web Bluetooth API implementation in a try/catch block
    try {
      if ('bluetooth' in navigator) {
        // Since we are in an iframe sandbox, requestDevice will usually reject with SecurityError
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }] // Standard printer service UUID
        });
        setSelectedPrinter(device.name || 'Bluetooth Printer');
        setIsPrinterConnected(true);
      } else {
        throw new Error('Bluetooth not supported');
      }
    } catch (err) {
      // Elegant simulated fallback connecting with beautiful thermal printer options
      setTimeout(() => {
        setPrinters([
          'ApoCute Thermal BT-58 (Terhubung)',
          'Thermal Printer PT-210',
          'Panda BT-Receipt-Printer'
        ]);
        setSearchingPrinters(false);
      }, 1500);
    }
  };

  // Handle DANA API Generation
  const handleGenerateDanaQris = async () => {
    setIsGeneratingDana(true);
    setShowQRModal(true);
    try {
      const response = await fetch('/api/dana/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: total,
          invoiceNumber: generateInvoiceNumber()
        })
      });
      const data = await response.json();
      setDanaPaymentData(data.data);
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi DANA API Sandbox.');
    } finally {
      setIsGeneratingDana(false);
    }
  };

  // Handle finalize sale
  const handleCheckout = (shouldPrint: boolean = false) => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }

    if (paymentMethod === 'Cash' && (!cashAmount || parseInt(cashAmount) < total)) {
      alert('Masukkan jumlah uang tunai pembayaran yang cukup!');
      return;
    }

    // Capture customer name
    const customer = customers.find(c => c.id === selectedCustomerId);

    const saleRecord: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString(),
      items: cart.map(item => ({
        medicineId: item.medicine.id,
        name: item.medicine.name,
        quantity: item.quantity,
        price: item.medicine.sellPrice,
        total: item.medicine.sellPrice * item.quantity
      })),
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      customerId: selectedCustomerId || undefined,
      customerName: customer ? customer.name : undefined,
      cashierName: activeEmployee ? activeEmployee.username : 'Kasir ApoCute'
    };

    // Deduct stock and grant points
    cart.forEach(item => {
      onUpdateMedicineStock(item.medicine.id, item.medicine.stock - item.quantity);
    });

    if (customer) {
      const earnedPoints = calculateLoyaltyPoints(total);
      onUpdateCustomerPoints(customer.id, customer.points + earnedPoints);
    }

    onNewSale(saleRecord);
    setPrintedReceipt(saleRecord);
    setTimeout(() => {
      loadTodaySales();
    }, 100);

    // If QRIS or digital, maybe show success screen first
    if (paymentMethod !== 'Cash' && paymentMethod !== 'Transfer') {
      setShowQRModal(false);
    }

    // Automatically send WhatsApp digital receipt if customer has phone number
    if (customer && customer.phone) {
      const receiptMessage = `Halo *${customer.name}*,\n\nTerima kasih telah berbelanja obat di *${settings.companyName || 'ApoCute Ceria'}*.\nBerikut adalah *Struk Nota Digital* Anda:\n\nNo. Invoice: *${saleRecord.invoiceNumber}*\nTanggal: ${new Date(saleRecord.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n*Rincian Belanja:*\n${cart.map(item => `- ${item.medicine.name} (${item.quantity} unit) @ ${formatRupiah(item.medicine.sellPrice)}: ${formatRupiah(item.medicine.sellPrice * item.quantity)}`).join('\n')}\n\n*Subtotal:* ${formatRupiah(subtotal)}\n*Diskon (${discountPercent}%):* -${formatRupiah(discountAmount)}\n*Total Pembayaran:* *${formatRupiah(total)}*\n*Metode:* ${paymentMethod}\n\n*Loyalty Poin:* +${calculateLoyaltyPoints(total)} Poin\n\n_Semoga lekas sembuh dan sehat selalu ya! ❤️_\n-- Layanan Pelanggan ${settings.companyName || 'ApoCute Ceria'}`;
      
      sendWhatsAppMessage(settings, customer.phone, customer.name, receiptMessage, 'struk_digital')
        .then(() => {
          console.log(`Digital receipt sent successfully to ${customer.name} (${customer.phone})`);
        })
        .catch(err => {
          console.error('WhatsApp sending failed:', err);
        });
    }

    if (shouldPrint) {
      setIsPrinting(true);
      setTimeout(() => {
        setIsPrinting(false);
        alert('Resi berhasil dicetak via printer Bluetooth ApoCute BT-58!');
        resetPOS();
      }, 2000);
    } else {
      setPrintedReceipt(saleRecord);
      setShowPrinterModal(true); // Open simulated receipt printing modal
    }
  };

  const resetPOS = () => {
    setCart([]);
    setSelectedCustomerId('');
    setDiscountPercent(0);
    setPaymentMethod('Cash');
    setCashAmount('');
    setPrintedReceipt(null);
  };

  // Theme styling helpers
  const getThemeStyles = () => {
    switch (theme) {
      case 'lavender':
        return {
          primary: 'bg-3d-gradient shadow-3d-gradient text-white active:scale-95',
          accent: 'purple',
          border: 'border-white/50',
          bg: 'bg-[var(--color-card-bg)]',
          gradient: 'text-3d-gradient',
          btnLight: 'bg-[var(--color-input-bg)] shadow-3d-button text-[var(--grad-start)] active:shadow-3d-input',
          glow: 'shadow-3d-gradient'
        };
      case 'minty':
        return {
          primary: 'bg-emerald-600 hover:bg-emerald-700 text-emerald-50',
          accent: 'emerald',
          border: 'border-emerald-100',
          bg: 'bg-emerald-50/40',
          gradient: 'from-emerald-400 to-teal-600',
          btnLight: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600',
          glow: 'shadow-emerald-100'
        };
      case 'ocean':
        return {
          primary: 'bg-sky-600 hover:bg-sky-700 text-sky-50',
          accent: 'sky',
          border: 'border-sky-100',
          bg: 'bg-sky-50/40',
          gradient: 'from-sky-400 to-blue-600',
          btnLight: 'bg-sky-50 hover:bg-sky-100 text-sky-600',
          glow: 'shadow-sky-100'
        };
      case 'sunset':
        return {
          primary: 'bg-orange-500 hover:bg-orange-600 text-orange-50',
          accent: 'orange',
          border: 'border-orange-100',
          bg: 'bg-orange-50/40',
          gradient: 'from-orange-400 to-amber-600',
          btnLight: 'bg-orange-50 hover:bg-orange-100 text-orange-600',
          glow: 'shadow-orange-100'
        };
      case 'cherry':
        return {
          primary: 'bg-rose-500 hover:bg-rose-600 text-rose-50',
          accent: 'rose',
          border: 'border-rose-100',
          bg: 'bg-rose-50/40',
          gradient: 'from-pink-400 to-rose-600',
          btnLight: 'bg-rose-50 hover:bg-rose-100 text-rose-600',
          glow: 'shadow-rose-100'
        };
    }
  };

  const themeStyle = getThemeStyles();

  return (
    <div className="space-y-6 pb-24 relative min-h-[85vh] font-sans">
      
      {/* 1. TOP SECTION: KERANJANG BELANJA (Keranjang Berada Paling Atas) */}
      <div className={`${themeStyle.bg} p-6 rounded-[2rem] ${themeStyle.border} shadow-3d-card flex flex-col justify-between mx-2`}>
        <div>
          <div className="flex justify-between items-center border-b border-purple-200/50 pb-3 mb-4">
            <h4 className="font-display font-black text-purple-900 text-sm flex items-center gap-1.5 uppercase tracking-wide">
              <Receipt className={`w-5 h-5 text-${themeStyle.accent}-500`} />
              Keranjang Belanja Utama
            </h4>
            <button
              onClick={resetPOS}
              className={`text-[10px] ${themeStyle.btnLight} px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer hover:text-rose-600`}
            >
              Kosongkan Keranjang
            </button>
          </div>

          {/* Cart Items List */}
          <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-purple-400 space-y-2">
                <div className="bg-[var(--color-input-bg)] w-16 h-16 rounded-full shadow-3d-icon flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-8 h-8 text-purple-300" />
                </div>
                <p className="text-sm font-black text-[var(--grad-start)] tracking-wide uppercase">Keranjang Kosong</p>
                <p className="text-[10px] font-bold text-purple-500/70">Scan obat atau gunakan bar pencarian di bawah untuk tebus obat.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.medicine.id} className="flex items-center justify-between gap-3 bg-[var(--color-input-bg)] p-3 rounded-2xl shadow-3d-input">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-display font-black text-purple-900 text-xs truncate uppercase tracking-tight">{item.medicine.name}</h5>
                    <span className="text-[10px] text-[var(--grad-end)] font-black font-mono">{formatRupiah(item.medicine.sellPrice)}</span>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2 shrink-0 bg-[var(--color-card-bg)] p-1 rounded-xl shadow-3d-card border border-white/40">
                    <button
                      onClick={() => updateQuantity(item.medicine.id, -1)}
                      className="w-6 h-6 rounded-lg bg-[var(--color-input-bg)] shadow-3d-button flex items-center justify-center text-[var(--grad-start)] active:shadow-3d-input cursor-pointer"
                    >
                      <Minus className="w-3 h-3 font-bold" />
                    </button>
                    <span className="font-mono font-black text-sm text-purple-900 w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.medicine.id, 1)}
                      className="w-6 h-6 rounded-lg bg-[var(--color-input-bg)] shadow-3d-button flex items-center justify-center text-[var(--grad-start)] active:shadow-3d-input cursor-pointer"
                    >
                      <Plus className="w-3 h-3 font-bold" />
                    </button>
                  </div>

                  <div className="text-right min-w-[75px] shrink-0">
                    <span className="font-display font-black text-purple-900 text-xs">{formatRupiah(item.medicine.sellPrice * item.quantity)}</span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.medicine.id)}
                    className="w-8 h-8 rounded-xl bg-[var(--color-input-bg)] shadow-3d-button flex items-center justify-center text-purple-400 hover:text-rose-500 transition-all shrink-0 cursor-pointer active:shadow-3d-input"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subtotal Display inside top card */}
        {cart.length > 0 && (
          <div className="border-t border-purple-200/50 pt-4 mt-4 flex justify-between items-center text-xs text-purple-500 font-mono font-bold tracking-wide">
            <span>Subtotal Item ({cart.reduce((a, b) => a + b.quantity, 0)} unit):</span>
            <span className="font-black text-purple-900 text-sm">{formatRupiah(subtotal)}</span>
          </div>
        )}
      </div>

      {/* 2. MIDDLE SECTION: PRISTINE WHITE TACTILE CASH CALCULATOR (Kalkulator Warna Putih Bersih di Tengah) */}
      <div className="bg-[var(--color-card-bg)] p-6 rounded-[2rem] shadow-3d-card border border-white/50 space-y-4 mx-2">
        <div className="flex justify-between items-center border-b border-purple-200/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[var(--color-input-bg)] shadow-3d-icon rounded-xl text-amber-500">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </span>
            <h3 className="font-display font-black text-purple-900 text-sm tracking-wide">Register Kalkulator</h3>
          </div>
          <span className="text-[10px] bg-[var(--color-input-bg)] shadow-3d-button text-[var(--grad-start)] font-bold px-3 py-1 rounded-full font-mono uppercase tracking-wider">Tunai / Non-Tunai</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LCD Digital Display (Total Bill, Cash received, Change amount) */}
          <div className="lg:col-span-4 bg-[var(--color-input-bg)] p-5 rounded-3xl flex flex-col justify-between font-mono text-purple-900 relative overflow-hidden shadow-3d-input border-transparent">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-purple-500/80">
                <span className="font-sans font-black tracking-widest uppercase">TOTAL TAGIHAN</span>
                <span className="font-black text-purple-800 text-lg">{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-purple-500/80 border-t border-purple-200/50 pt-3">
                <span className="font-sans font-black tracking-widest uppercase">JUMLAH DITERIMA</span>
                <span className="font-black text-[var(--grad-end)] text-lg">
                  {cashAmount ? formatRupiah(parseInt(cashAmount)) : 'Rp 0'}
                </span>
              </div>
            </div>

            <div className="border-t border-purple-200/50 pt-4 mt-4 flex justify-between items-end">
              <span className="text-[10px] text-purple-400 font-sans font-black uppercase tracking-widest">Kembalian</span>
              <span className={`font-black text-2xl leading-none ${cashAmount && parseInt(cashAmount) >= total ? 'text-[var(--grad-start)]' : 'text-purple-300'}`}>
                {cashAmount && parseInt(cashAmount) >= total ? formatRupiah(changeAmount) : 'Rp 0'}
              </span>
            </div>
          </div>

          {/* Clean White Tactile Numpad Grid */}
          <div className="lg:col-span-8 grid grid-cols-4 sm:grid-cols-8 gap-3">
            {/* Keys */}
            {['7', '8', '9'].map(num => (
              <button key={num} type="button" onClick={() => handleNumpadPress(num)} className="h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-purple-900 font-black text-sm border-transparent transition-all active:shadow-3d-input cursor-pointer">{num}</button>
            ))}
            <button type="button" onClick={() => handleNumpadPress('+10000')} className="h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button text-[var(--grad-end)] font-black text-[11px] border-transparent transition-all active:shadow-3d-input cursor-pointer">+10k</button>
            <button type="button" onClick={() => handleNumpadPress('+20000')} className="h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button text-[var(--grad-end)] font-black text-[11px] border-transparent transition-all active:shadow-3d-input cursor-pointer">+20k</button>

            {['4', '5', '6'].map(num => (
              <button key={num} type="button" onClick={() => handleNumpadPress(num)} className="h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-purple-900 font-black text-sm border-transparent transition-all active:shadow-3d-input cursor-pointer">{num}</button>
            ))}
            <button type="button" onClick={() => handleNumpadPress('+50000')} className="h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button text-[var(--grad-end)] font-black text-[11px] border-transparent transition-all active:shadow-3d-input cursor-pointer">+50k</button>

            {['1', '2', '3'].map(num => (
              <button key={num} type="button" onClick={() => handleNumpadPress(num)} className="h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-purple-900 font-black text-sm border-transparent transition-all active:shadow-3d-input cursor-pointer">{num}</button>
            ))}
            <button type="button" onClick={() => handleNumpadPress('+100000')} className="h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button text-[var(--grad-end)] font-black text-[11px] border-transparent transition-all active:shadow-3d-input cursor-pointer">+100k</button>

            <button type="button" onClick={() => handleNumpadPress('C')} className="h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button text-rose-500 font-black text-sm border-transparent transition-all active:shadow-3d-input cursor-pointer">C</button>
            <button type="button" onClick={() => handleNumpadPress('0')} className="h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-purple-900 font-black text-sm border-transparent transition-all active:shadow-3d-input cursor-pointer">0</button>
            <button type="button" onClick={() => handleNumpadPress('00')} className="h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-purple-900 font-black text-sm border-transparent transition-all active:shadow-3d-input cursor-pointer">00</button>
            
            <button
              type="button"
              onClick={() => setCashAmount(total.toString())}
              className="col-span-2 h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button text-[var(--grad-start)] font-display font-black tracking-wide text-[11px] uppercase transition-all active:shadow-3d-input cursor-pointer"
            >
              Uang Pas
            </button>
            <button
              type="button"
              onClick={() => {
                const roundedUp = Math.ceil(total / 50000) * 50000;
                setCashAmount(roundedUp.toString());
              }}
              className="col-span-2 h-12 rounded-2xl bg-[var(--color-input-bg)] shadow-3d-button text-[var(--grad-start)] font-display font-black tracking-wide text-[11px] uppercase transition-all active:shadow-3d-input cursor-pointer"
            >
              Pecahan Terdekat
            </button>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: CARA PEMBAYARAN, PELANGGAN, DISKON & PROSES BAYAR (Cara Pembayaran Berada Paling Bawah) */}
      <div className="bg-[var(--color-card-bg)] p-6 rounded-[2rem] shadow-3d-card border border-white/50 space-y-4 mx-2">
        <h4 className="font-display font-black text-purple-900 text-sm border-b border-purple-200/50 pb-3 tracking-wide uppercase">
          Proses Pembayaran & Checkout
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column Left: Select Payment Method Button Group */}
          <div className="lg:col-span-6 space-y-3">
            <label className="text-[10px] font-black text-purple-500/80 uppercase tracking-widest block">Pilih Metode</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Cash', label: 'Uang Tunai', icon: Receipt, color: 'text-emerald-500' },
                { name: 'QRIS', label: 'QRIS Dinamis', icon: QrCode, color: '0' },
                { name: 'DANA', label: 'DANA Sandbox', icon: Smartphone, color: 'text-blue-500' },
                { name: 'GoPay', label: 'E-Wallet GoPay', icon: Smartphone, color: 'text-sky-500' },
                { name: 'OVO', label: 'E-Wallet OVO', icon: Smartphone, color: 'text-purple-500' }
              ].map((m) => {
                const IconComp = m.icon;
                const isActive = paymentMethod === m.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.name);
                      if (m.name !== 'Cash') {
                        setCashAmount(total.toString());
                      } else {
                        setCashAmount('');
                      }
                    }}
                    className={`p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white shadow-3d-input border-transparent' 
                        : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white active:shadow-3d-input border-transparent'
                    }`}
                  >
                    <span className={`p-1.5 rounded-xl bg-white shadow-sm shrink-0 ${m.color}`}>
                      <IconComp className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 text-left">
                      <span className={`font-display font-black text-[11px] block leading-none uppercase tracking-tight ${isActive ? 'text-[var(--grad-end)]' : 'text-purple-800'}`}>{m.name}</span>
                      <span className="text-[9px] text-purple-400 font-bold block mt-1 truncate">{m.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-3 bg-[var(--color-input-bg)] shadow-inner rounded-xl border border-transparent text-[10px] text-purple-500 font-medium">
              Pilih <span className="font-bold text-[var(--grad-end)]">QRIS</span> atau <span className="font-bold text-[var(--grad-end)]">DANA</span> untuk pembayaran otomatis melalui sandbox API.
            </div>
          </div>

          {/* Column Right: Customer Select, Discount, and Pay Button */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-purple-500/80 uppercase tracking-widest block mb-2">Pelanggan Setia</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-[var(--color-input-bg)] shadow-3d-input border-transparent rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-purple-900 focus:outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="">-- Umum / Walk-in --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No Phone'})</option>
                    ))}
                  </select>
                </div>
                {selectedCustomerId && (
                  <div className="text-[10px] text-[var(--grad-start)] font-bold tracking-wide mt-2 block text-center">
                    + {calculateLoyaltyPoints(total)} Poin ApoCute!
                  </div>
                )}
              </div>

              {/* Discount Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-purple-500/80 uppercase tracking-widest block mb-2">Diskon (%)</label>
                <div className="relative">
                  <Percent className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent || ''}
                    onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-[var(--color-input-bg)] shadow-3d-input border-transparent rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-purple-900 focus:outline-none transition-all text-center"
                    placeholder="Diskon Khusus"
                  />
                </div>
                {discountPercent > 0 && (
                  <div className="text-[10px] text-[var(--grad-end)] font-black tracking-wide mt-2 block text-center uppercase">
                    Hemat: -{formatRupiah(discountAmount)}
                  </div>
                )}
              </div>
            </div>

            {/* Final Checkout Button */}
            <div className="pt-3">
              {paymentMethod === 'QRIS' || paymentMethod === 'DANA' ? (
                <button
                  id="qris-checkout-btn"
                  type="button"
                  onClick={handleGenerateDanaQris}
                  className={`w-full py-4 rounded-2xl font-display font-black text-sm text-center flex items-center justify-center gap-2 cursor-pointer ${themeStyle.primary}`}
                >
                  <QrCode className="w-5 h-5" />
                  Buat Pembayaran via DANA Sandbox
                </button>
              ) : (
                <button
                  id="pos-checkout-btn"
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => handleCheckout(false)}
                  className={`w-full py-4 rounded-2xl font-display font-black text-sm text-center flex items-center justify-center gap-2 cursor-pointer ${themeStyle.primary} disabled:opacity-40 disabled:pointer-events-none`}
                >
                  <Receipt className="w-5 h-5" />
                  Bayar & Simpan Penjualan Ke Kas Utama
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. TODAY'S TRANSACTIONS (Hanya transaksi hari ini untuk kasir, laba disembunyikan sepenuhnya!) */}
      <div className="bg-[var(--color-card-bg)] p-6 rounded-[2rem] shadow-3d-card border border-white/50 space-y-4 mx-2">
        <div className="flex justify-between items-center border-b border-purple-200/50 pb-3">
          <h4 className="font-display font-black text-purple-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Daftar Transaksi Hari Ini ({todaySales.length} Transaksi)
          </h4>
          <span className="text-[9px] bg-[var(--color-input-bg)] shadow-3d-button text-[var(--grad-start)] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Kasir Terbatas (No Profit Info)</span>
        </div>

        {todaySales.length === 0 ? (
          <div className="text-center py-8 text-purple-400 text-xs font-bold uppercase tracking-widest">
            Belum ada transaksi tersimpan hari ini.
          </div>
        ) : (
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
            {todaySales.map((sale) => (
              <div key={sale.id} className="p-4 bg-[var(--color-input-bg)] shadow-3d-input rounded-2xl flex items-center justify-between gap-4 transition-all">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-purple-900 text-xs uppercase tracking-tight">{sale.invoiceNumber}</span>
                    <span className="text-[10px] bg-[var(--color-card-bg)] shadow-3d-button border border-white text-[var(--grad-start)] px-2 py-0.5 rounded font-mono font-bold">
                      {new Date(sale.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-purple-500 mt-1.5 truncate max-w-[200px] font-bold">
                    Pelanggan: <span className="font-black text-purple-700">{sale.customerName || 'Umum / Walk-in'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-display font-black text-purple-900 text-sm block">{formatRupiah(sale.total)}</span>
                    <span className="text-[9px] text-slate-400 block uppercase font-mono">{sale.paymentMethod}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setPrintedReceipt(sale);
                      setShowPrinterModal(true);
                    }}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-slate-150 rounded-xl text-slate-500 transition-all"
                    title="Cetak Ulang Struk"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. FLOATING BOTTOM SEARCH & BARCODE BAR (Border Search & Barcode mengambang di bawah - tidak ikut discroll) */}
      <div className="fixed bottom-4 left-4 right-4 lg:left-6 lg:right-6 bg-[var(--color-card-bg)]/95 backdrop-blur-md rounded-3xl shadow-3d-card border border-white/50 p-3 z-40 flex items-center gap-3 transition-all">
        
        {/* POPUP OVERLAY ON TYPING (Menampilkan popup produk jika diketik) */}
        <AnimatePresence>
          {searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-full mb-4 left-0 right-0 max-h-[300px] overflow-y-auto bg-[var(--color-card-bg)] rounded-[2rem] shadow-3d-card border border-white/50 p-5 flex flex-col gap-3 z-50 scrollbar-thin"
            >
              <div className="flex justify-between items-center border-b border-[var(--color-bg-light)] pb-2 shrink-0">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Popup Hasil Pencarian</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-[10px] text-rose-500 font-bold hover:underline"
                >
                  Tutup Popup
                </button>
              </div>

              {filteredMedicines.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-bold">
                  Tidak ada produk obat yang cocok dengan "{searchTerm}"
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredMedicines.map((med) => {
                    const isLowStock = med.stock <= med.minStock;
                    return (
                      <div
                        key={med.id}
                        onClick={() => {
                          addToCart(med);
                          setSearchTerm(''); // Clear search on item click
                        }}
                        className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all active:shadow-3d-input ${
                          isLowStock ? 'bg-white shadow-3d-input border-transparent' : 'bg-white shadow-3d-button hover:bg-[var(--color-input-bg)] border-transparent'
                        }`}
                      >
                        <div className="min-w-0">
                          <h5 className="font-display font-black text-slate-700 text-xs truncate uppercase">{med.name}</h5>
                          <span className="text-[9px] bg-[var(--color-input-bg)] shadow-inner text-slate-500 px-2 py-0.5 rounded-full font-mono font-bold mt-1 inline-block">{med.code}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-display font-black text-[var(--grad-end)] text-xs block">{formatRupiah(med.sellPrice)}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">Stok: {med.stock}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Input Control */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 drop-shadow-sm" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari & ketik tebus obat (menampilkan popup produk)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--color-input-bg)] shadow-3d-input border-transparent rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-700 focus:outline-none transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase bg-white shadow-3d-button px-2 py-1 rounded-lg active:shadow-3d-input transition-all"
            >
              Clear
            </button>
          )}
        </div>

        {/* Floating Scan Button */}
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-display font-black text-[11px] border-transparent bg-white shadow-3d-button active:shadow-3d-input hover:bg-[var(--color-input-bg)] text-slate-700 transition-all shrink-0 uppercase tracking-wide`}
        >
          <Barcode className="w-5 h-5 text-[var(--grad-end)] animate-pulse drop-shadow-sm" />
          Scan Barcode Camera
        </button>
      </div>

      {/* MODAL 1: Barcode Scanner with Live Camera Support */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="bg-slate-950 p-4 text-white flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[var(--grad-end)] animate-pulse" />
                  <span className="font-display font-bold text-sm">Scan Barcode Kamera</span>
                </div>
                <button
                  onClick={() => {
                    stopCameraScan();
                    setShowScanner(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 bg-[var(--color-input-bg)] shadow-3d-button px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 text-center space-y-4">
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                  Arahkan barcode pada kemasan obat ke area kamera di bawah ini, atau gunakan tombol simulasi hardware di bawah jika kamera laptop Anda mati.
                </p>

                {/* Laser scan simulator and live video view */}
                <div className="relative w-full h-48 bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-4 border-slate-900 shadow-inner">
                  {/* Camera view if active */}
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover opacity-85"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2 z-0">
                      <Camera className="w-8 h-8 text-slate-600 animate-pulse" />
                      <span className="text-[10px] font-semibold text-slate-400">Menghubungkan Kamera...</span>
                    </div>
                  )}

                  {/* Laser bar animation overlay */}
                  {scanStatus === 'scanning' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/30 z-10">
                      <div className="absolute w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-bounce top-1/2 left-0" />
                      <span className="bg-emerald-500/90 text-slate-950 font-black px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-mono animate-pulse">
                        Scanning: {scannedCode}
                      </span>
                    </div>
                  ) : scanStatus === 'success' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/80 z-20 space-y-2">
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="p-3 bg-emerald-500 rounded-full text-slate-950 shadow-lg"
                      >
                        <Check className="w-6 h-6 stroke-[3]" />
                      </motion.div>
                      <span className="text-xs font-bold text-emerald-300 font-display">Obat Berhasil Ditambahkan!</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-transparent z-10 pointer-events-none border-[12px] border-slate-950/40 flex items-center justify-center">
                      <div className="absolute w-full h-0.5 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,1)] animate-bounce" />
                      <div className="w-48 h-20 border-2 border-indigo-400 border-dashed rounded-lg opacity-40 animate-pulse" />
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-2.5 bg-slate-950/70 text-slate-300 text-[8px] font-mono px-2 py-0.5 rounded-md z-30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live Camera Stream
                  </div>
                </div>

                {/* Simulated physical hardware scan buttons */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulasi Klik Scan Hardware</label>
                    <span className="text-[9px] bg-[var(--color-input-bg)] shadow-inner text-[var(--grad-end)] px-1.5 py-0.5 rounded-md font-bold">4 Produk</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {medicines.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => triggerScanCode(m.code)}
                        className="p-2 border border-slate-150 rounded-xl hover:bg-slate-50 flex flex-col text-left text-[10px] font-semibold text-slate-700 transition-all hover:border-indigo-300"
                      >
                        <span className="block font-bold truncate text-slate-700">{m.name}</span>
                        <span className="font-mono text-slate-400 text-[8.5px]">{m.code}</span>
                        <span className="text-[8px] mt-1 text-[var(--grad-end)] hover:underline">Scan Item</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Simulated Bluetooth Thermal Printer Roll */}
      <AnimatePresence>
        {showPrinterModal && printedReceipt && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-400" />
                  <span className="font-display font-bold text-sm">Printer Bluetooth ApoCute BT-58</span>
                </div>
                <button onClick={() => { setShowPrinterModal(false); resetPOS(); }} className="text-slate-400 hover:text-slate-600 bg-[var(--color-input-bg)] shadow-3d-button px-3 py-1 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* BT settings in the popup */}
              <div className="bg-slate-50 p-3 border-b border-slate-150 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bluetooth className={`w-4 h-4 ${isPrinterConnected ? 'text-[var(--grad-end)]' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold text-slate-600">
                    {isPrinterConnected ? `Terhubung: ${selectedPrinter}` : 'Bluetooth Printer Terputus'}
                  </span>
                </div>
                {isPrinterConnected ? (
                  <button
                    onClick={() => setIsPrinterConnected(false)}
                    className="text-[10px] text-rose-500 hover:underline font-bold"
                  >
                    Putuskan
                  </button>
                ) : (
                  <button
                    onClick={connectBluetoothPrinter}
                    disabled={searchingPrinters}
                    className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-1 rounded-md hover:bg-indigo-700 transition-all flex items-center gap-1"
                  >
                    {searchingPrinters ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Cari Printer
                  </button>
                )}
              </div>

              {/* Scan bluetooth results list */}
              {printers.length > 0 && !isPrinterConnected && (
                <div className="bg-amber-50 p-3 border-b border-slate-150 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Pilih Perangkat Terdeteksi:</span>
                  <div className="space-y-1">
                    {printers.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPrinter(p);
                          setIsPrinterConnected(true);
                          setPrinters([]);
                        }}
                        className="w-full text-left p-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-400 hover:bg-[var(--color-input-bg)] shadow-inner/50 transition-all flex items-center justify-between"
                      >
                        <span>{p}</span>
                        <Check className="w-3.5 h-3.5 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Thermal paper output view */}
              <div className="bg-slate-100 p-6 flex-1 overflow-y-auto flex justify-center items-start">
                <div className="w-64 bg-white shadow-md border-l border-r border-dashed border-slate-300 p-4 font-mono text-[10px] text-slate-700 space-y-4 relative leading-normal">
                  
                  {/* Jagged teeth edge simulation */}
                  <div className="absolute top-0 left-0 right-0 h-1 flex justify-between overflow-hidden">
                    {Array.from({ length: 26 }).map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-slate-100 rotate-45 transform -translate-y-1 shadow-inner" />
                    ))}
                  </div>

                  {/* Header */}
                  <div className="text-center space-y-1 pt-2">
                    <h4 className="font-bold text-xs uppercase">{settings.companyName || 'APOTEK APOCUTE'}</h4>
                    <p className="text-[8px] text-slate-500">JL. SEHAT BAHAGIA NO. 45, BANDUNG</p>
                    <p className="text-[8px] text-slate-500">TELP: (022) 12345678</p>
                    <div className="border-t border-slate-300 border-dashed my-2" />
                  </div>

                  {/* Meta data */}
                  <div className="space-y-0.5 text-[8.5px]">
                    <div className="flex justify-between">
                      <span>No: {printedReceipt.invoiceNumber}</span>
                      <span>{new Date(printedReceipt.date).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kasir: {printedReceipt.cashierName}</span>
                      <span>{new Date(printedReceipt.date).toLocaleDateString('id-ID')}</span>
                    </div>
                    {printedReceipt.customerName && (
                      <div className="flex justify-between font-bold text-[var(--grad-start)]">
                        <span>Pelanggan:</span>
                        <span>{printedReceipt.customerName}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-300 border-dashed my-2" />
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {printedReceipt.items.map((it, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between font-semibold">
                          <span>{it.name}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[8.5px]">
                          <span>{it.quantity} x {formatRupiah(it.price)}</span>
                          <span>{formatRupiah(it.total)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-slate-300 border-dashed my-2" />
                  </div>

                  {/* Totals */}
                  <div className="space-y-1 text-right">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatRupiah(printedReceipt.subtotal)}</span>
                    </div>
                    {printedReceipt.discount > 0 && (
                      <div className="flex justify-between font-semibold text-rose-500">
                        <span>Diskon</span>
                        <span>-{formatRupiah(printedReceipt.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-xs">
                      <span>TOTAL</span>
                      <span>{formatRupiah(printedReceipt.total)}</span>
                    </div>
                    <div className="border-t border-slate-300 border-dashed my-2" />
                    <div className="flex justify-between">
                      <span>Metode</span>
                      <span className="font-bold">{printedReceipt.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Footer message */}
                  <div className="text-center space-y-1 pt-2">
                    <p className="font-bold">LEKAS SEMBUH & SEHAT SELALU</p>
                    <p className="text-[8px] text-slate-500">Terima kasih atas kunjungan Anda.</p>
                    <div className="border-t border-slate-300 border-dashed my-2" />
                    <div className="mx-auto flex flex-col items-center">
                      <Barcode className="w-20 h-6 stroke-1" />
                      <span className="text-[7px] text-slate-400 font-mono mt-0.5">{printedReceipt.invoiceNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex gap-3">
                <button
                  onClick={() => {
                    setShowPrinterModal(false);
                    resetPOS();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-display font-semibold text-xs text-slate-700 text-center transition-all"
                >
                  Tutup Kasir
                </button>
                <button
                  onClick={() => {
                    setIsPrinting(true);
                    setTimeout(() => {
                      setIsPrinting(false);
                      setShowPrinterModal(false);
                      resetPOS();
                      alert('Resi berhasil dicetak!');
                    }, 2000);
                  }}
                  disabled={isPrinting}
                  className={`flex-1 py-2.5 rounded-xl font-display font-bold text-xs text-white text-center shadow-md flex items-center justify-center gap-1.5 transition-all bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50`}
                >
                  {isPrinting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mencetak...
                    </>
                  ) : (
                    <>
                      <Printer className="w-3.5 h-3.5" />
                      Cetak Struk BT
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: QRIS Digital Payment Code */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 p-6 text-center space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-left">
                  <QrCode className="w-5 h-5 text-[var(--grad-end)]" />
                  <span className="font-display font-bold text-sm text-slate-700">Pembayaran DANA Sandbox</span>
                </div>
                <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Tagihan</span>
                <span className="text-2xl font-display font-black text-[var(--grad-end)] block">{formatRupiah(total)}</span>
              </div>

              {isGeneratingDana ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 0 animate-spin" />
                  <p className="text-xs font-semibold text-slate-500">Menghubungkan ke DANA API (Sandbox)...</p>
                </div>
              ) : (
                <>
                  {/* QR Code Illustration */}
                  <div className="p-4 bg-white border-2 border-dashed border-indigo-200 rounded-3xl inline-block mx-auto relative shadow-sm">
                    {danaPaymentData?.qrCodeUrl ? (
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(danaPaymentData.qrCodeUrl)}`} alt="QRIS DANA" className="w-40 h-40 object-contain mx-auto" />
                    ) : (
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-44 h-44">
                        {/* QR Background & Corner squares */}
                        <rect width="100" height="100" rx="10" fill="#ffffff" />
                        <rect x="5" y="5" width="22" height="22" rx="4" fill="#1e1b4b" stroke="#1e1b4b" strokeWidth="2" />
                        <rect x="9" y="9" width="14" height="14" rx="2" fill="#ffffff" />
                        <rect x="11" y="11" width="10" height="10" rx="1" fill="#4f46e5" />
      
                        <rect x="73" y="5" width="22" height="22" rx="4" fill="#1e1b4b" stroke="#1e1b4b" strokeWidth="2" />
                        <rect x="77" y="9" width="14" height="14" rx="2" fill="#ffffff" />
                        <rect x="79" y="11" width="10" height="10" rx="1" fill="#4f46e5" />
      
                        <rect x="5" y="73" width="22" height="22" rx="4" fill="#1e1b4b" stroke="#1e1b4b" strokeWidth="2" />
                        <rect x="9" y="77" width="14" height="14" rx="2" fill="#ffffff" />
                        <rect x="11" y="79" width="10" height="10" rx="1" fill="#4f46e5" />
      
                        {/* QR center cute pill logo */}
                        <rect x="40" y="40" width="20" height="20" rx="5" fill="#f43f5e" />
                        <circle cx="46" cy="50" r="1.5" fill="white" />
                        <circle cx="54" cy="50" r="1.5" fill="white" />
                        <path d="M 48 54 Q 50 56 52 54" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
      
                        {/* Mock QR dots */}
                        <rect x="35" y="10" width="6" height="6" rx="1" fill="#1e293b" />
                        <rect x="45" y="15" width="4" height="4" rx="1" fill="#4f46e5" />
                        <rect x="55" y="8" width="8" height="4" rx="1" fill="#1e293b" />
                        <rect x="10" y="35" width="6" height="6" rx="1" fill="#1e293b" />
                        <rect x="15" y="48" width="4" height="4" rx="1" fill="#4f46e5" />
                        <rect x="8" y="55" width="8" height="4" rx="1" fill="#1e293b" />
                        
                        <rect x="75" y="35" width="8" height="8" rx="1" fill="#1e293b" />
                        <rect x="82" y="48" width="6" height="4" rx="1" fill="#4f46e5" />
                        <rect x="70" y="55" width="10" height="4" rx="1" fill="#1e293b" />
      
                        <rect x="35" y="75" width="8" height="6" rx="1" fill="#1e293b" />
                        <rect x="48" y="82" width="6" height="4" rx="1" fill="#4f46e5" />
                        <rect x="62" y="70" width="10" height="12" rx="1" fill="#1e293b" />
                      </svg>
                    )}
                    {/* GPN logo badge in the QRIS box */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-900 text-white font-black px-2 py-0.5 rounded-md text-[8px] tracking-wide whitespace-nowrap">
                      DANA / QRIS
                    </div>
                  </div>
    
                  <p className="text-[11px] text-slate-400 font-sans">
                    {danaPaymentData?.message || "Dukung pembayaran digital Indonesia: QRIS, LinkAja, OVO, GoPay, Dana, ShopeePay, dan Mobile Banking."}
                  </p>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 py-2.5 rounded-xl border-transparent bg-white shadow-3d-button hover:bg-[var(--color-input-bg)] active:shadow-3d-input font-display font-semibold text-xs text-slate-600 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleCheckout(false)}
                  className={`flex-1 py-2.5 rounded-xl font-display font-bold text-xs text-white shadow-md flex items-center justify-center gap-1.5 transition-all ${themeStyle.primary}`}
                >
                  <Check className="w-3.5 h-3.5" />
                  Sudah Dibayar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
