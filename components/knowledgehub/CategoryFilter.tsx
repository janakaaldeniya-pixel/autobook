// components/knowledgehub/CategoryFilter.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArticleCategory } from '@/lib/knowledgehub-types';

export function CategoryFilter({ categories }: { categories: ArticleCategory[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') ?? '';

  function select(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set('category', slug); else params.delete('category');
    router.push(`/knowledge-hub?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => select('')}
        className={`rounded-sm px-3 py-1.5 text-sm ${active === '' ? 'bg-[#E2662D] text-[#14181A]' : 'border border-[#3A4249] text-[#C7CDD1] hover:border-[#E2662D]'}`}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => select(c.slug)}
          className={`rounded-sm px-3 py-1.5 text-sm ${active === c.slug ? 'bg-[#E2662D] text-[#14181A]' : 'border border-[#3A4249] text-[#C7CDD1] hover:border-[#E2662D]'}`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
