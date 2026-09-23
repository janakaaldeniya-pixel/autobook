// components/garages/DistrictFilter.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SRI_LANKA_DISTRICTS } from '@/lib/types';

export function DistrictFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('district') ?? '';

  function selectDistrict(district: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (district) {
      params.set('district', district);
    } else {
      params.delete('district');
    }
    router.push(`/garages?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => selectDistrict('')}
        className={`rounded-sm px-3 py-1.5 text-sm transition-colors ${
          active === ''
            ? 'bg-[#E2662D] text-[#14181A]'
            : 'border border-[#3A4249] text-[#C7CDD1] hover:border-[#E2662D]'
        }`}
      >
        All Districts
      </button>
      {SRI_LANKA_DISTRICTS.map((d) => (
        <button
          key={d}
          onClick={() => selectDistrict(d)}
          className={`rounded-sm px-3 py-1.5 text-sm transition-colors ${
            active === d
              ? 'bg-[#E2662D] text-[#14181A]'
              : 'border border-[#3A4249] text-[#C7CDD1] hover:border-[#E2662D]'
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
