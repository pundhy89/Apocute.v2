#!/bin/bash
FILES="src/components/Doctors.tsx src/components/WhatsappSettings.tsx"
for file in $FILES; do
  # Fix dark modal headers
  sed -i 's/<div className="bg-slate-900 p-4 text-white flex justify-between items-center border-b border-white\/10">/<div className="flex justify-between items-center border-b border-\[var(--color-bg-light)\] p-5 mb-2 text-\[var(--grad-end)\] drop-shadow-sm">/g' "$file"
  
  # Badges & generic text colors
  sed -i 's/bg-slate-100/bg-\[var(--color-input-bg)\] shadow-inner/g' "$file"
  sed -i 's/bg-slate-200/bg-white shadow-3d-button/g' "$file"
  sed -i 's/border-slate-[0-9]*/border-transparent/g' "$file"
  
  # Remove hover state slate bugs
  sed -i 's/hover:border-slate-[0-9]*//g' "$file"
  sed -i 's/hover:bg-slate-100/hover:bg-\[var(--color-input-bg)\]/g' "$file"
  sed -i 's/hover:bg-slate-50/hover:bg-\[var(--color-input-bg)\]/g' "$file"
  
  # Fix text-white in modal headers that had text-white
  sed -i 's/text-white\/90/text-\[var(--grad-end)\] drop-shadow-sm/g' "$file"
  
  # Backdrop blur background (keep dark but uniform)
  sed -i 's/bg-slate-900\/40/bg-black\/10/g' "$file"
  sed -i 's/bg-slate-900\/95/bg-\[var(--color-card-bg)\]\/95/g' "$file"
  
  # Special fix for Doctor flip cards
  sed -i 's/text-white/text-\[var(--text-primary)\]/g' "$file"
done

# We also need to fix text-white replaced with var(--text-primary) in some gradients where it shouldn't be
