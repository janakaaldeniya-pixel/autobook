// components/parts/StockControl.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updatePartStock } from '@/actions/parts';

export function StockControl({ partId, initialStock }: { partId: string; initialStock: number }) {
  const [stock, setStock] = useState(initialStock);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function save(next: number) {
    const clamped = Math.max(0, next);
    setStock(clamped);
    startTransition(async () => {
      await updatePartStock(partId, clamped);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[#8A9299]">Stock:</span>
      <button disabled={isPending} onClick={() => save(stock - 1)} className="h-7 w-7 rounded-sm border border-[#3A4249] text-[#C7CDD1]">−</button>
      <span className="w-6 text-center text-sm text-[#F2EFE9]">{stock}</span>
      <button disabled={isPending} onClick={() => save(stock + 1)} className="h-7 w-7 rounded-sm border border-[#3A4249] text-[#C7CDD1]">+</button>
      {stock === 0 && <span className="text-xs text-[#E2662D]">Listed as out of stock</span>}
    </div>
  );
}
