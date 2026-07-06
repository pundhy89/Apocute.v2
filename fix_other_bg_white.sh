#!/bin/bash
FILES="src/components/SalesSuppliers.tsx src/components/Doctors.tsx src/components/Reports.tsx src/components/WhatsappSettings.tsx src/components/Settings.tsx src/components/Customers.tsx src/components/Inventory.tsx src/components/POS.tsx"
for file in $FILES; do
  sed -i 's/bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100/bg-\[var(--color-card-bg)\] w-full max-w-lg rounded-\[2rem\] shadow-3d-card border border-white\/50/g' "$file"
  sed -i 's/text-slate-800/text-slate-700/g' "$file"
  sed -i 's/text-indigo-600/text-\[var(--grad-end)\]/g' "$file"
  sed -i 's/bg-indigo-600 hover:bg-indigo-700/bg-white shadow-3d-button text-\[var(--grad-end)\] hover:bg-\[var(--color-input-bg)\]/g' "$file"
  sed -i 's/bg-indigo-50/bg-\[var(--color-input-bg)\] shadow-inner/g' "$file"
  sed -i 's/text-indigo-700/text-\[var(--grad-start)\]/g' "$file"
  sed -i 's/border-indigo-100/border-transparent/g' "$file"
done
