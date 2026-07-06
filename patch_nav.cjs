const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const dashboardBtn = `                  {/* Dashboard */}
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setShowMenuDropdown(false);
                    }}
                    className={\`flex flex-col items-center justify-center p-2 rounded-2xl transition-all text-center gap-2 h-16 cursor-pointer border-transparent \${
                      activeTab === 'dashboard' ? 'bg-white shadow-3d-input text-[var(--grad-end)]' : 'bg-[var(--color-input-bg)] shadow-3d-button hover:bg-white text-[var(--grad-start)] active:shadow-3d-input'
                    }\`}
                    title="Dasbor Utama"
                  >
                    <span className="flex items-center justify-center">
                      <LayoutDashboard className="w-5 h-5 drop-shadow-sm" />
                    </span>
                    <span className="text-[9px] font-black tracking-tight leading-none line-clamp-1 uppercase">Dasbor</span>
                  </button>
`;

if (!content.includes('Dasbor Utama')) {
    content = content.replace('{/* POS */}', dashboardBtn + '                  {/* POS */}');
}

if (!content.includes('LayoutDashboard,')) {
    content = content.replace('import {', 'import { LayoutDashboard,');
}

// Ensure activeTab uses dashboard
content = content.replace("useState<'pos'", "useState<'dashboard' | 'pos'");

// Ensure Panel header text shows Dasbor Utama
content = content.replace("Panel: {activeTab === 'pos' ?", "Panel: {activeTab === 'dashboard' ? 'Dasbor Utama' : activeTab === 'pos' ?");

fs.writeFileSync('src/App.tsx', content);
