// app/spare-parts/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PartCard } from '@/components/parts/PartCard';
import { Filters } from '@/components/parts/Filters';
import { SparePart } from '@/lib/parts-types';

export default async function SparePartsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string; make?: string; condition?: string;
    min_price?: string; max_price?: string; q?: string;
  }>;
}) {
  const { category, make, condition, min_price, max_price, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('spare_parts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (condition) query = query.eq('condition', condition);
  if (min_price) query = query.gte('price', Number(min_price));
  if (max_price) query = query.lte('price', Number(max_price));
  if (make) query = query.contains('compatible_makes', [make]);
  if (q) query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,part_number.ilike.%${q}%`);
  // `category` filters by category name via the part_categories join table
  // in a real setup — left as a TODO comment since categories aren't
  // seeded here; filter client-side or join once you've added categories.

  const { data: parts, error } = await query;

  const { data: { user } } = await supabase.auth.getUser();
  let favoritedIds = new Set<string>();
  if (user) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', user.id)
      .eq('item_type', 'spare_part');
    favoritedIds = new Set(favs?.map((f) => f.item_id));
  }

  return (
    <div className="min-h-screen bg-[#14181A]">
      <header className="border-b border-[#2B3339] px-6 py-8">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-4xl uppercase tracking-wide text-[#F2EFE9]">
          Spare Parts Finder
        </h1>
        <p className="mt-2 max-w-xl text-[#8A9299]">
          New, used, and refurbished parts from sellers across Sri Lanka.
        </p>
        <Link
          href="/spare-parts/new"
          className="mt-4 inline-block rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A]"
        >
          Sell a part
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <form className="mb-4 flex gap-2" action="/spare-parts">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search part name, brand, or part number…"
            className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
          />
          <button className="rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A]">
            Search
          </button>
        </form>

        <div className="mb-8">
          <Filters />
        </div>

        {error && <p className="text-red-400">Couldn&apos;t load parts: {error.message}</p>}

        {!error && parts?.length === 0 && (
          <p className="py-10 text-center text-[#8A9299]">
            No parts match these filters yet.{' '}
            <Link href="/spare-parts/new" className="text-[#E2662D] underline">
              List the first one
            </Link>
            .
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(parts as SparePart[] | null)?.map((part) => (
            <PartCard key={part.id} part={part} favorited={favoritedIds.has(part.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
