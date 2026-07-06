const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import Dashboard from './components/Dashboard';")) {
    content = content.replace("import Transactions", "import Dashboard from './components/Dashboard';\nimport Transactions");
}

const dashboardComp = `          {activeTab === 'dashboard' && (
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
          )}`;

if (!content.includes("<Dashboard")) {
    content = content.replace("{activeTab === 'pos' && (", dashboardComp + '\n\n          {activeTab === \'pos\' && (');
}

fs.writeFileSync('src/App.tsx', content);
