// components/knowledgehub/CommentForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { postComment } from '@/actions/knowledgehub';

export function CommentForm({ articleId, isSignedIn }: { articleId: string; isSignedIn: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isSignedIn) {
    return (
      <p className="text-sm text-[#8A9299]">
        <a href="/login" className="text-[#E2662D] underline">Sign in</a> to leave a comment.
      </p>
    );
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await postComment(articleId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-2">
      <textarea
        name="comment"
        required
        placeholder="Ask a question or add your own tip…"
        rows={3}
        className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A] disabled:opacity-50"
      >
        {isPending ? 'Posting…' : 'Post comment'}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
