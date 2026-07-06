#!/bin/bash
FILE="src/components/Transactions.tsx"
sed -i 's/className="bg-\[var(--color-card-bg)\] p-4 sm:p-5 rounded-3xl border-transparent shadow-3d-input/className="bg-[var(--color-card-bg)] p-4 sm:p-5 rounded-[2rem] border border-white\/50 shadow-3d-card/g' "$FILE"
sed -i 's/className="bg-\[var(--color-card-bg)\] rounded-3xl border-transparent shadow-3d-input/className="bg-[var(--color-card-bg)] rounded-[2rem] border border-white\/50 shadow-3d-card/g' "$FILE"
sed -i 's/className="bg-\[var(--color-card-bg)\] p-5 rounded-3xl border-transparent shadow-3d-input/className="bg-[var(--color-card-bg)] p-5 rounded-[2rem] border border-white\/50 shadow-3d-card/g' "$FILE"
