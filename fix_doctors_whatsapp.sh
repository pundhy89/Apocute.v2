#!/bin/bash
FILES="src/components/Doctors.tsx src/components/WhatsappSettings.tsx"
for file in $FILES; do
  # Replace standard cards
  sed -i 's/bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs/bg-\[var(--color-card-bg)\] p-5 rounded-3xl border border-white\/50 shadow-3d-card/g' "$file"
  sed -i 's/bg-white p-6 rounded-3xl shadow-sm border border-slate-100/bg-\[var(--color-card-bg)\] p-6 rounded-\[2rem\] shadow-3d-card border border-white\/50/g' "$file"
  sed -i 's/bg-white p-5 rounded-3xl border border-slate-100/bg-\[var(--color-card-bg)\] p-5 rounded-\[2rem\] shadow-3d-card border border-white\/50/g' "$file"
  sed -i 's/bg-white p-4 rounded-2xl border border-slate-100 shadow-xs/bg-\[var(--color-input-bg)\] p-4 rounded-2xl border-transparent shadow-3d-input/g' "$file"
  sed -i 's/bg-white rounded-3xl border border-slate-100/bg-\[var(--color-card-bg)\] rounded-\[2rem\] border border-white\/50 shadow-3d-card/g' "$file"
  sed -i 's/bg-white rounded-\[28px\] max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100/bg-\[var(--color-card-bg)\] rounded-\[2rem\] max-w-lg w-full shadow-3d-card overflow-hidden border border-white\/50/g' "$file"
  sed -i 's/bg-slate-100 hover:bg-slate-200/bg-white shadow-3d-button hover:bg-\[var(--color-input-bg)\]/g' "$file"
  
  # Action buttons (p-1.5 or w-8 h-8 rounded-xl)
  sed -i 's/bg-white hover:bg-slate-100/bg-white shadow-3d-button hover:bg-\[var(--color-input-bg)\] border-transparent active:shadow-3d-input/g' "$file"
  sed -i 's/bg-white hover:bg-slate-50/bg-white shadow-3d-button hover:bg-\[var(--color-input-bg)\] border-transparent active:shadow-3d-input/g' "$file"
  sed -i 's/border border-slate-200/border-transparent/g' "$file"
  sed -i 's/border border-slate-150/border-transparent/g' "$file"
  
  # Other replacements
  sed -i 's/bg-slate-50/bg-\[var(--color-input-bg)\] shadow-3d-input border-transparent/g' "$file"
done
