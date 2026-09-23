// components/myservice/Mileagecontrol.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateMileage } from '@/actions/myservice';

export function MileageControl({ vehicleId, currentMileage }: { vehicleId: string; currentMileage: number | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentMileage ?? ''));
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function save() {
    const mileage = Number(value);
    if (!mileage || mileage < 0) return;
    startTransition(async () => {
      await updateMileage(vehicleId, mileage);
      setEditing(false);
      router.refresh();
    });
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-left text-sm text-[#C7CDD1] underline decoration-dotted"
      >
        {currentMileage ? `${currentMileage.toLocaleString()} km` : 'Set current mileage'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        className="w-28 rounded-sm border border-[#3A4249] bg-[#1B2023] px-2 py-1 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none"
      />
      <button onClick={save} disabled={isPending} className="rounded-sm bg-[#E2662D] px-2 py-1 text-xs font-medium text-[#14181A]">
        Save
      </button>
      <button onClick={() => setEditing(false)} className="text-xs text-[#8A9299]">Cancel</button>
    </div>
  );
}
