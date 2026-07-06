#!/bin/bash
FILES="src/components/Doctors.tsx src/components/WhatsappSettings.tsx"
for file in $FILES; do
  sed -i 's/text-slate-800/text-\[var(--text-primary)\]/g' "$file"
  sed -i 's/text-slate-700/text-\[var(--text-primary)\]/g' "$file"
  sed -i 's/text-slate-600/text-\[var(--text-secondary)\]/g' "$file"
  sed -i 's/text-slate-500/text-\[var(--text-secondary)\]/g' "$file"
  sed -i 's/text-slate-400/text-\[var(--text-muted)\]/g' "$file"
done
