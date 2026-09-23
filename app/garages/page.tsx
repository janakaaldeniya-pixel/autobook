// app/garages/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { GarageCard } from '@/components/garages/GarageCard';
import { DistrictFilter } from '@/components/garages/DistrictFilter';
import { Garage } from '@/lib/types';

export default async function GaragesPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string; q?: string }>;
}) {
  const { district, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('garages')
    .select('*')
    .order('is_verified', { ascending: false })
    .order('rating_avg', { ascending: false });

  if (district) query = query.eq('district', district);
  if (q) query = query.ilike('name', `%${q}%`);

  const { data: garages, error } = await query;

  return (
    <div className="min-h-screen bg-[#14181A]">
      <header className="border-b border-[#2B3339] px-6 py-8">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-4xl uppercase tracking-wide text-[#F2EFE9]">
          Garage &amp; Service Stations
        </h1>
        <p className="mt-2 max-w-xl text-[#8A9299]">
          Find a trusted garage near you, anywhere in Sri Lanka — by district, by service.
        </p>
        <Link
          href="/garages/new"
          className="mt-4 inline-block rounded-sm border border-[#E2662D] px-4 py-2 text-sm text-[#E2662D] hover:bg-[#E2662D] hover:text-[#14181A]"
        >
          List your garage
        </Link>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <form className="mb-6 flex gap-2" action="/garages">
          {district && <input type="hidden" name="district" value={district} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search garage name…"
            className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
          />
          <button className="rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A]">
            Search
          </button>
        </form>

        <div className="mb-8">
          <DistrictFilter />
        </div>

        {error && <p className="text-red-400">Couldn&apos;t load garages: {error.message}</p>}

        {!error && garages?.length === 0 && (
          <p className="py-10 text-center text-[#8A9299]">
            No garages found for this filter yet. Try another district, or{' '}
            <Link href="/garages/new" className="text-[#E2662D] underline">
              be the first to list one
            </Link>
            .
          </p>
        )}

        <div>
          {(garages as Garage[] | null)?.map((garage) => (
            <GarageCard key={garage.id} garage={garage} />
          ))}
        </div>
      </div>
    </div>
  );
}
