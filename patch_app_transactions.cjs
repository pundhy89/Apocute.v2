const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const adminMenu = `                  {activeEmployee.role === 'admin' && (
                    <button
                      onClick={() => {
                        setActiveTab('transactions');
                        setShowMenuDropdown(false);
                      }}
                      className={\`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent \${
                        activeTab === 'transactions' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                      }\`}
                      title="Riwayat Transaksi"
                    >
                      <span className="flex items-center justify-center">
                        <Activity className="w-5 h-5 drop-shadow-sm" />
                      </span>
                      <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">Transaksi</span>
                    </button>
                  )}`;

content = content.replace('{/* Reports - Admin Only */}', adminMenu + '\n\n                  {/* Reports - Admin Only */}');

const transactionsComponent = `{activeTab === 'transactions' && (
            <Transactions
              salesHistory={salesHistory}
              theme={settings.theme}
              settings={settings}
            />
          )}`;

content = content.replace('{activeTab === \'reports\' && (', transactionsComponent + '\\n\\n          {activeTab === \'reports\' && (');

// Also need to import Activity from lucide-react if not imported
if (!content.includes('Activity,')) {
  content = content.replace('import {', 'import { Activity,');
}

fs.writeFileSync('src/App.tsx', content);
