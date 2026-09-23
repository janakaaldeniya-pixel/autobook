// components/marketplace/InquiryForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { sendInquiry } from '@/actions/marketplace';

export function InquiryForm({ listingId }: { listingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await sendInquiry(listingId, formData);
      setMessage(result?.error ?? 'Message sent to the seller.');
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <textarea
        name="message"
        required
        placeholder="Hi, is this still available? I'd like to know more…"
        rows={3}
        className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-sm bg-[#E2662D] px-4 py-2.5 text-sm font-medium text-[#14181A] disabled:opacity-50"
      >
        {isPending ? 'Sending…' : 'Contact seller'}
      </button>
      {message && <p className="text-sm text-[#8A9299]">{message}</p>}
    </form>
  );
}
