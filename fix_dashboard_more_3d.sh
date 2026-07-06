#!/bin/bash
FILE="src/components/Dashboard.tsx"
sed -i 's/border-transparent shadow-3xs/shadow-3d-card border border-white\/50/g' "$FILE"
sed -i 's/shadow-sm/shadow-3d-card/g' "$FILE"
sed -i 's/bg-\[var(--color-input-bg)\] shadow-inner/bg-\[var(--color-input-bg)\] shadow-3d-input/g' "$FILE"
