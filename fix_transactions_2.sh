#!/bin/bash
FILE="src/components/Transactions.tsx"
sed -i 's/bg-indigo-600/bg-\[var(--grad-end)\]/g' "$FILE"
sed -i 's/hover:bg-indigo-700/hover:bg-\[var(--color-input-bg)\]/g' "$FILE"
sed -i 's/hover:bg-indigo-50\/50/hover:bg-\[var(--color-input-bg)\]/g' "$FILE"
