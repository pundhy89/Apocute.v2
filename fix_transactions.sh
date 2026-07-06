#!/bin/bash
FILE="src/components/Transactions.tsx"
# Fix background wrappers
sed -i 's/bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs/bg-\[var(--color-card-bg)\] p-5 rounded-3xl border border-white\/50 shadow-3d-card/g' "$FILE"
sed -i 's/bg-white rounded-3xl border border-slate-100 shadow-sm/bg-\[var(--color-card-bg)\] rounded-\[2rem\] shadow-3d-card border border-white\/50/g' "$FILE"
sed -i 's/bg-white p-4 rounded-2xl border border-slate-100 shadow-xs/bg-\[var(--color-input-bg)\] p-4 rounded-2xl border-transparent shadow-3d-input/g' "$FILE"

# Backgrounds for cards
sed -i 's/bg-white/bg-\[var(--color-card-bg)\]/g' "$FILE"
sed -i 's/bg-slate-50/bg-\[var(--color-input-bg)\]/g' "$FILE"
sed -i 's/bg-slate-100/bg-\[var(--color-input-bg)\]/g' "$FILE"
sed -i 's/bg-slate-200/bg-white shadow-3d-button/g' "$FILE"
sed -i 's/bg-slate-900\/40/bg-black\/10/g' "$FILE"
sed -i 's/bg-slate-900/bg-\[var(--color-card-bg)\]/g' "$FILE"

# Text colors
sed -i 's/text-slate-900/text-\[var(--text-primary)\]/g' "$FILE"
sed -i 's/text-slate-800/text-\[var(--text-primary)\]/g' "$FILE"
sed -i 's/text-slate-700/text-\[var(--text-primary)\]/g' "$FILE"
sed -i 's/text-slate-600/text-\[var(--text-secondary)\]/g' "$FILE"
sed -i 's/text-slate-500/text-\[var(--text-secondary)\]/g' "$FILE"
sed -i 's/text-slate-400/text-\[var(--text-muted)\]/g' "$FILE"
sed -i 's/text-slate-300/text-\[var(--text-muted)\]/g' "$FILE"

# Borders
sed -i 's/border-slate-[0-9]*/border-transparent/g' "$FILE"
sed -i 's/hover:border-slate-[0-9]*//g' "$FILE"

# Dropdown inputs etc
sed -i 's/border border-transparent/border-transparent shadow-3d-input/g' "$FILE"
