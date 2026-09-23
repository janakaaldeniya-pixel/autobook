// app/knowledge-hub/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArticleCard } from '@/components/knowledgehub/ArticleCard';
import { CategoryFilter } from '@/components/knowledgehub/CategoryFilter';
import { Article, ArticleCategory } from '@/lib/knowledgehub-types';

export default async function KnowledgeHubPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase.from('article_categories').select('*').order('name');

  let query = supabase
    .from('articles')
    .select('*, article_categories(name, slug)')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (category) {
    const cat = categories?.find((c) => c.slug === category);
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (q) query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);

  const { data: articles, error } = await query;

  return (
    <div className="min-h-screen bg-[#14181A]">
      <header className="border-b border-[#2B3339] px-6 py-8">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-4xl uppercase tracking-wide text-[#F2EFE9]">
          Knowledge Hub
        </h1>
        <p className="mt-2 max-w-xl text-[#8A9299]">
          Maintenance tips, buying guides, and repair how-tos for Sri Lankan drivers.
        </p>
        <Link
          href="/knowledge-hub/new"
          className="mt-4 inline-block rounded-sm border border-[#E2662D] px-4 py-2 text-sm text-[#E2662D] hover:bg-[#E2662D] hover:text-[#14181A]"
        >
          Write an article
        </Link>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <form className="mb-6 flex gap-2" action="/knowledge-hub">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search articles…"
            className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
          />
          <button className="rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A]">
            Search
          </button>
        </form>

        <div className="mb-8">
          <CategoryFilter categories={(categories as ArticleCategory[]) ?? []} />
        </div>

        {error && <p className="text-red-400">Couldn&apos;t load articles: {error.message}</p>}

        {!error && articles?.length === 0 && (
          <p className="py-10 text-center text-[#8A9299]">
            No articles here yet.{' '}
            <Link href="/knowledge-hub/new" className="text-[#E2662D] underline">
              Write the first one
            </Link>
            .
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(articles as Article[] | null)?.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
