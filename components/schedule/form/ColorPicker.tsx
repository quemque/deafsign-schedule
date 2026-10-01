'use client'

import { Check } from 'lucide-react'
import { LESSON_COLORS } from '@/constants/schedule'

interface ColorPickerProps {
   selectedColor: string
   onChange: (color: string) => void
}

export function ColorPicker({ selectedColor, onChange }: ColorPickerProps) {
   return (
      <div>
         <label className="text-[10px] font-medium text-[#8B857D] mb-1.5 block pl-1">
            Цвет занятия
         </label>

         <div className="flex items-center gap-2.5">
            {LESSON_COLORS.map((colorItem) => {
               const isSelected = selectedColor === colorItem.value

               return (
                  <button
                     key={colorItem.value}
                     type="button"
                     onClick={() => onChange(colorItem.value)}
                     style={{ backgroundColor: colorItem.value }}
                     className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                           ? 'ring-2 ring-offset-2 ring-[#3E3A35] scale-110'
                           : 'hover:scale-105'
                     }`}
                     aria-label={colorItem.label}
                  >
                     {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                     )}
                  </button>
               )
            })}
         </div>
      </div>
   )
}
