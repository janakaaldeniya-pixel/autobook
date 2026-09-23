// components/marketplace/Filters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { VEHICLE_MAKES, BODY_TYPES, PRICE_RANGES } from '@/lib/marketplace-types';

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/buy-sell?${params.toString()}`);
  }

  function updatePriceRange(label: string) {
    const range = PRICE_RANGES.find((r) => r.label === label);
    const params = new URLSearchParams(searchParams.toString());
    if (range?.min) params.set('min_price', String(range.min)); else params.delete('min_price');
    if (range?.max) params.set('max_price', String(range.max)); else params.delete('max_price');
    router.push(`/buy-sell?${params.toString()}`);
  }

  const selectClass =
    'rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#C7CDD1] focus:border-[#E2662D] focus:outline-none';

  return (
    <div className="flex flex-wrap gap-2">
      <select className={selectClass} defaultValue={searchParams.get('make') ?? ''} onChange={(e) => update('make', e.target.value)}>
        <option value="">Any make</option>
        {VEHICLE_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>

      <select className={selectClass} defaultValue={searchParams.get('body_type') ?? ''} onChange={(e) => update('body_type', e.target.value)}>
        <option value="">Any body type</option>
        {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>

      <select className={selectClass} onChange={(e) => updatePriceRange(e.target.value)}>
        {PRICE_RANGES.map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
      </select>
    </div>
  );
}
