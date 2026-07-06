#!/bin/bash
FILE="src/components/Transactions.tsx"
sed -i 's/p-5 rounded-3xl border border-emerald-100 shadow-xs/p-5 rounded-[2rem] shadow-3d-card border border-white\/50/g' "$FILE"
sed -i 's/p-5 rounded-3xl border border-rose-100 shadow-xs/p-5 rounded-[2rem] shadow-3d-card border border-white\/50/g' "$FILE"

sed -i 's/border-transparent shadow-3d-input\/80 p-4 rounded-2xl space-y-3 shadow-3xs/border-transparent shadow-3d-input p-4 rounded-2xl space-y-3/g' "$FILE"

sed -i 's/bg-\[var(--color-card-bg)\] p-4 text-white/flex justify-between items-center border-b border-\[var(--color-bg-light)\] p-5 mb-2 text-\[var(--grad-end)\] drop-shadow-sm/g' "$FILE"

