#!/bin/bash
FILES="src/components/Doctors.tsx src/components/WhatsappSettings.tsx"
for file in $FILES; do
  sed -i 's/className="w-\[310px\] h-\[460px\] bg-white rounded-\[32px\] border border-slate-100 shadow-md/className="w-[310px] h-[460px] bg-[var(--color-card-bg)] rounded-[2rem] shadow-3d-card border border-white\/50/g' "$file"
  sed -i 's/gap-4 bg-white p-5 rounded-3xl border-transparent shadow-sm/gap-4 bg-\[var(--color-card-bg)\] p-5 rounded-\[2rem\] shadow-3d-card border border-white\/50/g' "$file"
  sed -i 's/bg-white\/70 p-2.5 rounded-xl border border-slate-100/bg-\[var(--color-input-bg)\] p-2.5 rounded-xl shadow-3d-input border-transparent/g' "$file"
  sed -i 's/bg-white px-2 py-1 rounded border border-slate-100/bg-\[var(--color-input-bg)\] shadow-3d-input border-transparent px-2 py-1 rounded/g' "$file"
done
