// components/marketplace/OwnerStatusButton.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateListingStatus } from '@/actions/marketplace';

export function OwnerStatusButton({ listingId, status }: { listingId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function setStatus(next: 'sold' | 'active') {
    startTransition(async () => {
      await updateListingStatus(listingId, next);
      router.refresh();
    });
  }

  return (
    <div className="mt-3 flex gap-2">
      {status !== 'sold' ? (
        <button
          disabled={isPending}
          onClick={() => setStatus('sold')}
          className="rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A] disabled:opacity-50"
        >
          Mark as sold
        </button>
      ) : (
        <button
          disabled={isPending}
          onClick={() => setStatus('active')}
          className="rounded-sm border border-[#3A4249] px-4 py-2 text-sm text-[#C7CDD1] disabled:opacity-50"
        >
          Relist as active
        </button>
      )}
    </div>
  );
}
