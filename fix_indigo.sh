#!/bin/bash
FILES="src/components/SalesSuppliers.tsx src/components/Doctors.tsx src/components/Reports.tsx src/components/WhatsappSettings.tsx src/components/Settings.tsx src/components/Customers.tsx src/components/Inventory.tsx src/components/POS.tsx"
for file in $FILES; do
  sed -i 's/text-indigo-50//g' "$file"
  sed -i 's/text-indigo-500/text-\[var(--grad-start)\]/g' "$file"
  sed -i 's/text-indigo-400/text-\[var(--grad-end)\]/g' "$file"
  sed -i 's/focus:ring-indigo-500//g' "$file"
done
