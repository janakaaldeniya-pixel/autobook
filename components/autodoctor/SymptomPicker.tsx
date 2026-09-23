// components/autodoctor/SymptomPicker.tsx
'use client';

import { Symptom, CATEGORY_LABELS } from '@/lib/autodoctor-types';

export function SymptomPicker({
  symptoms,
  selected,
  onToggle,
}: {
  symptoms: Symptom[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const byCategory = symptoms.reduce<Record<string, Symptom[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category}>
          <p className="font-condensed mb-2 text-xs uppercase tracking-[0.15em] text-[#8A9299]">
            {CATEGORY_LABELS[category] ?? category}
          </p>
          <div className="flex flex-wrap gap-2">
            {items.map((symptom) => {
              const active = selected.has(symptom.id);
              return (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => onToggle(symptom.id)}
                  aria-pressed={active}
                  className={`rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'border-[#E2662D] bg-[#E2662D]/10 text-[#F2EFE9]'
                      : 'border-[#3A4249] text-[#C7CDD1] hover:border-[#5C646A]'
                  }`}
                >
                  {symptom.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
