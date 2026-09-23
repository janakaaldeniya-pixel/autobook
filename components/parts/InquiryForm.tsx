// components/parts/InquiryForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { sendPartInquiry } from '@/actions/parts';

export function InquiryForm({ partId }: { partId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await sendPartInquiry(partId, formData);
      setMessage(result?.error ?? 'Message sent to the seller.');
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <textarea
        name="message"
        required
        placeholder="Hi, is this part still in stock? Does it fit a…"
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
