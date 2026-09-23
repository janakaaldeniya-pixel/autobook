// components/myservice/ServiceHistory.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceRecord, SERVICE_TYPES } from '@/lib/myservice-types';
import { addServiceRecord } from '@/actions/myservice';

function formatMoney(n: number) {
  return `Rs. ${n.toLocaleString('en-LK')}`;
}

export function ServiceHistory({ vehicleId, records }: { vehicleId: string; records: ServiceRecord[] }) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addServiceRecord(vehicleId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowForm(false);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-condensed text-sm uppercase tracking-[0.15em] text-[#8A9299]">
          Service History
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm text-[#E2662D]"
        >
          {showForm ? 'Cancel' : '+ Add record'}
        </button>
      </div>

      {showForm && (
        <form action={handleSubmit} className="mt-3 space-y-3 rounded-sm border border-[#2B3339] p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[#C7CDD1]">Service type</label>
              <select name="service_type" required className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none">
                {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#C7CDD1]">Date</label>
              <input type="date" name="service_date" required className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[#C7CDD1]">Mileage at service</label>
              <input type="number" name="mileage_at_service" className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#C7CDD1]">Cost (Rs.)</label>
              <input type="number" name="cost" className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#C7CDD1]">Notes</label>
            <textarea name="notes" rows={2} className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none" />
          </div>
          <button type="submit" disabled={isPending} className="rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A] disabled:opacity-50">
            {isPending ? 'Saving…' : 'Save record'}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      )}

      <div className="mt-4 divide-y divide-[#2B3339]">
        {records.map((r) => (
          <div key={r.id} className="py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#F2EFE9]">{r.service_type}</p>
              <p className="text-sm text-[#8A9299]">{new Date(r.service_date).toLocaleDateString('en-LK')}</p>
            </div>
            <p className="mt-0.5 text-xs text-[#8A9299]">
              {r.mileage_at_service ? `${r.mileage_at_service.toLocaleString()} km` : ''}
              {r.mileage_at_service && r.cost ? ' · ' : ''}
              {r.cost ? formatMoney(r.cost) : ''}
              {r.garages?.name ? ` · ${r.garages.name}` : ''}
            </p>
            {r.notes && <p className="mt-1 text-sm text-[#C7CDD1]">{r.notes}</p>}
          </div>
        ))}
        {records.length === 0 && (
          <p className="py-4 text-sm text-[#8A9299]">No service history logged yet.</p>
        )}
      </div>
    </div>
  );
}
