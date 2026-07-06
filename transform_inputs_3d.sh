#!/bin/bash
FILES="src/components/SalesSuppliers.tsx src/components/Doctors.tsx src/components/Reports.tsx src/components/WhatsappSettings.tsx src/components/Settings.tsx src/components/Customers.tsx src/components/Inventory.tsx src/components/POS.tsx"
for file in $FILES; do
  sed -i 's/bg-slate-50 border border-slate-200 rounded-xl/bg-\[var(--color-input-bg)\] shadow-3d-input border-transparent rounded-2xl/g' "$file"
  sed -i 's/border border-slate-200 hover:bg-slate-50/border-transparent bg-white shadow-3d-button hover:bg-\[var(--color-input-bg)\] active:shadow-3d-input/g' "$file"
  sed -i 's/focus:border-indigo-500//g' "$file"
  sed -i 's/bg-slate-50 border border-slate-100\/50 rounded-2xl/bg-white shadow-3d-input border-transparent rounded-2xl/g' "$file"
  sed -i 's/bg-slate-50\/20/bg-white shadow-3d-button border-transparent/g' "$file"
done
