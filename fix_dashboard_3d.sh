#!/bin/bash
FILE="src/components/Dashboard.tsx"
# Convert standard flat/outlined cards to 3D Neuomorphic styles
sed -i 's/bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs/bg-\[var(--color-card-bg)\] p-5 rounded-[2rem] border border-white\/50 shadow-3d-card/g' "$FILE"
sed -i 's/bg-white p-6 rounded-3xl border border-slate-100 shadow-sm/bg-\[var(--color-card-bg)\] p-6 rounded-[2rem] border border-white\/50 shadow-3d-card/g' "$FILE"
sed -i 's/bg-white p-4 rounded-2xl border border-slate-100 shadow-xs/bg-\[var(--color-input-bg)\] p-4 rounded-2xl border-transparent shadow-3d-input/g' "$FILE"
sed -i 's/bg-white p-3 rounded-2xl border border-slate-100/bg-\[var(--color-input-bg)\] p-3 rounded-2xl border-transparent shadow-3d-input/g' "$FILE"
sed -i 's/bg-white/bg-\[var(--color-card-bg)\]/g' "$FILE"

# Colors mapping
sed -i 's/text-slate-900/text-\[var(--text-primary)\]/g' "$FILE"
sed -i 's/text-slate-800/text-\[var(--text-primary)\]/g' "$FILE"
sed -i 's/text-slate-700/text-\[var(--text-primary)\]/g' "$FILE"
sed -i 's/text-slate-600/text-\[var(--text-secondary)\]/g' "$FILE"
sed -i 's/text-slate-500/text-\[var(--text-secondary)\]/g' "$FILE"
sed -i 's/text-slate-400/text-\[var(--text-muted)\]/g' "$FILE"

sed -i 's/bg-slate-50/bg-\[var(--color-input-bg)\]/g' "$FILE"
sed -i 's/bg-slate-100/bg-\[var(--color-input-bg)\] shadow-inner/g' "$FILE"
sed -i 's/bg-slate-200/bg-white shadow-3d-button/g' "$FILE"

sed -i 's/border-slate-[0-9]*/border-transparent/g' "$FILE"
sed -i 's/hover:bg-slate-50/hover:bg-white\/50/g' "$FILE"
