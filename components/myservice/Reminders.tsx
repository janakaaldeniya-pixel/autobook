// components/myservice/Reminders.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceReminder, REMINDER_TYPES, isOverdue } from '@/lib/myservice-types';
import { addReminder, updateReminderStatus } from '@/actions/myservice';

export function Reminders({ vehicleId, reminders }: { vehicleId: string; reminders: ServiceReminder[] }) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addReminder(vehicleId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowForm(false);
        router.refresh();
      }
    });
  }

  function setStatus(reminderId: string, status: 'done' | 'dismissed') {
    startTransition(async () => {
      await updateReminderStatus(reminderId, vehicleId, status);
      router.refresh();
    });
  }

  const pending = reminders.filter((r) => r.status === 'pending');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-condensed text-sm uppercase tracking-[0.15em] text-[#8A9299]">
          Reminders
        </h2>
        <button onClick={() => setShowForm((v) => !v)} className="text-sm text-[#E2662D]">
          {showForm ? 'Cancel' : '+ Add reminder'}
        </button>
      </div>

      {showForm && (
        <form action={handleSubmit} className="mt-3 space-y-3 rounded-sm border border-[#2B3339] p-4">
          <div>
            <label className="mb-1 block text-xs text-[#C7CDD1]">Reminder type</label>
            <select name="reminder_type" required className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none">
              {REMINDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[#C7CDD1]">Due date</label>
              <input type="date" name="due_date" className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#C7CDD1]">Or due mileage</label>
              <input type="number" name="due_mileage" className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none" />
            </div>
          </div>
          <button type="submit" disabled={isPending} className="rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A] disabled:opacity-50">
            {isPending ? 'Saving…' : 'Save reminder'}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      )}

      <div className="mt-4 space-y-2">
        {pending.map((r) => {
          const overdue = isOverdue(r);
          return (
            <div
              key={r.id}
              className={`flex items-center justify-between rounded-sm border px-3 py-2.5 ${
                overdue ? 'border-[#E5484D]/40 bg-[#E5484D]/10' : 'border-[#2B3339]'
              }`}
            >
              <div>
                <p className={`text-sm ${overdue ? 'text-[#E5484D]' : 'text-[#F2EFE9]'}`}>
                  {r.reminder_type}
                </p>
                <p className="text-xs text-[#8A9299]">
                  {r.due_date ? new Date(r.due_date).toLocaleDateString('en-LK') : ''}
                  {r.due_mileage ? `${r.due_date ? ' · ' : ''}at ${r.due_mileage.toLocaleString()} km` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStatus(r.id, 'done')} className="text-xs text-[#8A9299] hover:text-[#E2662D]">Done</button>
                <button onClick={() => setStatus(r.id, 'dismissed')} className="text-xs text-[#8A9299] hover:text-[#E2662D]">Dismiss</button>
              </div>
            </div>
          );
        })}
        {pending.length === 0 && (
          <p className="py-2 text-sm text-[#8A9299]">No upcoming reminders.</p>
        )}
      </div>
    </div>
  );
}
