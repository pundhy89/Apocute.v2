#!/bin/bash
sed -i "s/import Reports from '.\/components\/Reports';/import Reports from '.\/components\/Reports';\nimport Transactions from '.\/components\/Transactions';/g" src/App.tsx

sed -i "s/const \[activeTab, setActiveTab\] = useState<'pos' | 'inventory' | 'suppliers' | 'customers' | 'doctors' | 'reports' | 'whatsapp' | 'settings'>('pos');/const \[activeTab, setActiveTab\] = useState<'pos' | 'transactions' | 'inventory' | 'suppliers' | 'customers' | 'doctors' | 'reports' | 'whatsapp' | 'settings'>('pos');/g" src/App.tsx

sed -i "s/Panel: {activeTab === 'pos' ? 'Kasir Kas Utama' : activeTab === 'inventory'/Panel: {activeTab === 'pos' ? 'Kasir Kas Utama' : activeTab === 'transactions' ? 'Transaksi Keuangan' : activeTab === 'inventory'/g" src/App.tsx
