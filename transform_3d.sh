#!/bin/bash
for file in src/components/SalesSuppliers.tsx src/components/Doctors.tsx src/components/Reports.tsx src/components/WhatsappSettings.tsx src/components/Settings.tsx src/components/Customers.tsx; do
  sed -i 's/bg-white p-5 rounded-3xl shadow-sm border border-slate-100/bg-\[var(--color-card-bg)\] p-5 rounded-\[2rem\] shadow-3d-card border border-white\/50/g' "$file"
  sed -i 's/bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100/bg-\[var(--color-card-bg)\] rounded-\[2rem\] max-w-sm w-full shadow-3d-card overflow-hidden border border-white\/50/g' "$file"
  sed -i 's/bg-white p-5 rounded-3xl shadow-sm border border-slate-200/bg-\[var(--color-card-bg)\] p-5 rounded-\[2rem\] shadow-3d-card border border-white\/50/g' "$file"
  sed -i 's/bg-white rounded-2xl p-5 shadow-sm border border-slate-100/bg-\[var(--color-card-bg)\] p-5 rounded-\[2rem\] shadow-3d-card border border-white\/50/g' "$file"
  
  # For any remaining generic ones we should be careful, maybe list them first.
done
