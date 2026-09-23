// components/parts/Filters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PART_CATEGORIES, PART_CONDITIONS, PART_PRICE_RANGES } from '@/lib/parts-types';
import { VEHICLE_MAKES } from '@/lib/marketplace-types';

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/spare-parts?${params.toString()}`);
  }

  function updatePriceRange(label: string) {
    const range = PART_PRICE_RANGES.find((r) => r.label === label);
    const params = new URLSearchParams(searchParams.toString());
    if (range?.min) params.set('min_price', String(range.min)); else params.delete('min_price');
    if (range?.max) params.set('max_price', String(range.max)); else params.delete('max_price');
    router.push(`/spare-parts?${params.toString()}`);
  }

  const selectClass =
    'rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#C7CDD1] focus:border-[#E2662D] focus:outline-none';

  return (
    <div className="flex flex-wrap gap-2">
      <select className={selectClass} defaultValue={searchParams.get('category') ?? ''} onChange={(e) => update('category', e.target.value)}>
        <option value="">Any category</option>
        {PART_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select className={selectClass} defaultValue={searchParams.get('make') ?? ''} onChange={(e) => update('make', e.target.value)}>
        <option value="">Fits any make</option>
        {VEHICLE_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>

      <select className={selectClass} defaultValue={searchParams.get('condition') ?? ''} onChange={(e) => update('condition', e.target.value)}>
        <option value="">Any condition</option>
        {PART_CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>

      <select className={selectClass} onChange={(e) => updatePriceRange(e.target.value)}>
        {PART_PRICE_RANGES.map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
      </select>
    </div>
  );
}
