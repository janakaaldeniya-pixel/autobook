// app/buy-sell/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { Filters } from '@/components/marketplace/Filters';
import { VehicleListing } from '@/lib/marketplace-types';

export default async function BuySellPage({
  searchParams,
}: {
  searchParams: Promise<{
    make?: string; body_type?: string; min_price?: string; max_price?: string; q?: string;
  }>;
}) {
  const { make, body_type, min_price, max_price, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('vehicle_listings')
    .select('*')
    .neq('status', 'expired')
    .order('created_at', { ascending: false });

  if (make) query = query.eq('make', make);
  if (body_type) query = query.eq('body_type', body_type);
  if (min_price) query = query.gte('price', Number(min_price));
  if (max_price) query = query.lte('price', Number(max_price));
  if (q) query = query.or(`make.ilike.%${q}%,model.ilike.%${q}%`);

  const { data: listings, error } = await query;

  // Mark which listings the current user has favorited, if logged in.
  const { data: { user } } = await supabase.auth.getUser();
  let favoritedIds = new Set<string>();
  if (user) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', user.id)
      .eq('item_type', 'vehicle_listing');
    favoritedIds = new Set(favs?.map((f) => f.item_id));
  }

  return (
    <div className="min-h-screen bg-[#14181A]">
      <header className="border-b border-[#2B3339] px-6 py-8">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-4xl uppercase tracking-wide text-[#F2EFE9]">
          Buy &amp; Sell
        </h1>
        <p className="mt-2 max-w-xl text-[#8A9299]">
          Vehicles for sale across Sri Lanka — no middleman, deal directly with the seller.
        </p>
        <Link
          href="/buy-sell/new"
          className="mt-4 inline-block rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A]"
        >
          Post a listing
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <form className="mb-4 flex gap-2" action="/buy-sell">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search make or model…"
            className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
          />
          <button className="rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A]">
            Search
          </button>
        </form>

        <div className="mb-8">
          <Filters />
        </div>

        {error && <p className="text-red-400">Couldn&apos;t load listings: {error.message}</p>}

        {!error && listings?.length === 0 && (
          <p className="py-10 text-center text-[#8A9299]">
            No listings match these filters yet.{' '}
            <Link href="/buy-sell/new" className="text-[#E2662D] underline">
              Post the first one
            </Link>
            .
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(listings as VehicleListing[] | null)?.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              favorited={favoritedIds.has(listing.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
