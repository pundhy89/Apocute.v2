#!/bin/bash
FILES="src/components/SalesSuppliers.tsx src/components/Doctors.tsx src/components/Reports.tsx src/components/WhatsappSettings.tsx src/components/Settings.tsx src/components/Customers.tsx src/components/Inventory.tsx src/components/POS.tsx"
for file in $FILES; do
  sed -i 's/<div className={`bg-gradient-to-r ${style.gradient} p-5 text-white flex justify-between items-center`}>/<div className="flex justify-between items-center border-b border-[var(--color-bg-light)] p-5 mb-2">/g' "$file"
  sed -i 's/text-white\/90/text-[var(--grad-end)] drop-shadow-sm/g' "$file"
  sed -i 's/text-white\/75 hover:text-white/text-slate-400 hover:text-slate-600 bg-[var(--color-input-bg)] shadow-3d-button px-3 py-1 rounded-full/g' "$file"
done
