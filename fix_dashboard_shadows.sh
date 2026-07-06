#!/bin/bash
FILE="src/components/Dashboard.tsx"
sed -i 's/border shadow-3xs flex/border-transparent shadow-3d-card flex/g' "$FILE"
sed -i 's/border shadow-3d-card border border-white\/50/border-transparent shadow-3d-card border border-white\/50/g' "$FILE"
sed -i 's/shadow-4xs/shadow-3d-button/g' "$FILE"
sed -i 's/bg-\[var(--color-input-bg)\] shadow-3d-input\/80/bg-\[var(--color-input-bg)\] shadow-3d-button hover:shadow-3d-input/g' "$FILE"
sed -i 's/hover:bg-\[var(--color-input-bg)\] shadow-3d-input/hover:bg-white shadow-3d-button active:shadow-3d-input/g' "$FILE"
