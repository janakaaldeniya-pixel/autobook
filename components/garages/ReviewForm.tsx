// components/garages/ReviewForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { submitReview } from '@/actions/garages';

export function ReviewForm({ garageId }: { garageId: string }) {
  const [rating, setRating] = useState(5);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    formData.set('rating', String(rating));
    startTransition(async () => {
      const result = await submitReview(garageId, formData);
      if (result?.error) {
        setMessage(result.error);
      } else {
        setMessage('Review posted.');
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3 border-t border-[#2B3339] pt-5">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            type="button"
            key={i}
            onClick={() => setRating(i)}
            aria-label={`Rate ${i} stars`}
            className="p-0.5"
          >
            <svg
              viewBox="0 0 20 20"
              className={`h-6 w-6 ${i <= rating ? 'fill-[#D9A404]' : 'fill-[#3A4249]'}`}
            >
              <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        placeholder="How was the service?"
        rows={3}
        className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A] disabled:opacity-50"
      >
        {isPending ? 'Posting…' : 'Post review'}
      </button>
      {message && <p className="text-sm text-[#8A9299]">{message}</p>}
    </form>
  );
}
