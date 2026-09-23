// app/garages/[id]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StarRating } from '@/components/garages/StarRating';
import { ReviewForm } from '@/components/garages/ReviewForm';
import { GarageReview } from '@/lib/types';

const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

export default async function GarageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: garage } = await supabase
    .from('garages')
    .select('*')
    .eq('id', id)
    .single();

  if (!garage) notFound();

  const { data: reviews } = await supabase
    .from('garage_reviews')
    .select('*, profiles(full_name)')
    .eq('garage_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#14181A]">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/garages" className="text-sm text-[#8A9299] hover:text-[#E2662D]">
          ← All garages
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-condensed text-4xl uppercase tracking-wide text-[#F2EFE9]">
                {garage.name}
              </h1>
              {garage.is_verified && (
                <span className="rounded-sm bg-[#1F7A5C]/20 px-2 py-1 text-xs font-medium text-[#3EC08A]">
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-[#8A9299]">
              {garage.address ? `${garage.address}, ` : ''}
              {garage.city ? `${garage.city}, ` : ''}
              {garage.district}
            </p>
          </div>
          <StarRating rating={garage.rating_avg} count={garage.rating_count} />
        </div>

        {garage.description && (
          <p className="mt-6 leading-relaxed text-[#C7CDD1]">{garage.description}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          {garage.phone && (
            <a
              href={`tel:${garage.phone}`}
              className="rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A]"
            >
              Call {garage.phone}
            </a>
          )}
          {garage.latitude && garage.longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${garage.latitude},${garage.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-[#3A4249] px-4 py-2 text-sm text-[#C7CDD1] hover:border-[#E2662D]"
            >
              Get directions
            </a>
          )}
        </div>

        {garage.services_offered?.length > 0 && (
          <div className="mt-8">
            <h2 className="font-condensed text-sm uppercase tracking-[0.15em] text-[#8A9299]">
              Services
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {garage.services_offered.map((s: string) => (
                <span
                  key={s}
                  className="rounded-sm border border-[#3A4249] px-2.5 py-1 text-sm text-[#C7CDD1]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {garage.opening_hours && (
          <div className="mt-8">
            <h2 className="font-condensed text-sm uppercase tracking-[0.15em] text-[#8A9299]">
              Opening Hours
            </h2>
            <dl className="mt-2 divide-y divide-[#2B3339] border-y border-[#2B3339]">
              {Object.entries(garage.opening_hours as Record<string, string>).map(
                ([day, hours]) => (
                  <div key={day} className="flex justify-between py-2 text-sm">
                    <dt className="text-[#8A9299]">{DAY_LABELS[day] ?? day}</dt>
                    <dd className="text-[#F2EFE9]">{hours}</dd>
                  </div>
                )
              )}
            </dl>
          </div>
        )}

        <div className="mt-10">
          <h2 className="font-condensed text-sm uppercase tracking-[0.15em] text-[#8A9299]">
            Reviews ({garage.rating_count})
          </h2>

          <div className="mt-4 space-y-4">
            {(reviews as GarageReview[] | null)?.map((review) => (
              <div key={review.id} className="border-b border-[#2B3339] pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#F2EFE9]">
                    {review.profiles?.full_name ?? 'Autobook user'}
                  </span>
                  <StarRating rating={review.rating} count={0} />
                </div>
                {review.comment && (
                  <p className="mt-1 text-sm text-[#C7CDD1]">{review.comment}</p>
                )}
              </div>
            ))}
            {reviews?.length === 0 && (
              <p className="text-sm text-[#8A9299]">No reviews yet — be the first.</p>
            )}
          </div>

          <div className="mt-6">
            <ReviewForm garageId={garage.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
