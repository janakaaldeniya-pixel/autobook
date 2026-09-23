// components/parts/FavoriteButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { toggleFavorite } from '@/actions/marketplace';

export function FavoriteButton({
  partId,
  initialFavorited,
}: {
  partId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await toggleFavorite(partId, 'spare_part');
      if (!result.error) setFavorited(result.favorited);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      className="shrink-0 rounded-full border border-[#3A4249] bg-[#14181A]/70 p-2 backdrop-blur-sm"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 ${favorited ? 'fill-[#E2662D] stroke-[#E2662D]' : 'fill-none stroke-[#C7CDD1]'}`}
        strokeWidth="2"
      >
        <path d="M12 21s-6.7-4.35-9.3-8.1C.8 9.9 1.8 6.4 5 5.2c2-.75 3.9.1 5 2 1.1-1.9 3-2.75 5-2 3.2 1.2 4.2 4.7 2.3 7.7C18.7 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
}
