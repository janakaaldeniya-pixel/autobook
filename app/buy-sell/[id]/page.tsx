// app/buy-sell/[id]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { InquiryForm } from '@/components/marketplace/InquiryForm';
import { FavoriteButton } from '@/components/marketplace/FavoriteButton';

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString('en-LK')}`;
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from('vehicle_listings')
    .select('*, profiles(full_name, phone)')
    .eq('id', id)
    .single();

  if (!listing) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === listing.seller_id;

  let favorited = false;
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_type', 'vehicle_listing')
      .eq('item_id', id)
      .maybeSingle();
    favorited = !!fav;
  }

  return (
    <div className="min-h-screen bg-[#14181A]">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/buy-sell" className="text-sm text-[#8A9299] hover:text-[#E2662D]">
          ← All listings
        </Link>

        <div className="mt-4 aspect-[16/10] overflow-hidden rounded-sm bg-[#1B2023]">
          {listing.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.images[0]}
              alt={`${listing.make} ${listing.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#5C646A]">
              No photos yet
            </div>
          )}
        </div>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-condensed text-3xl uppercase tracking-wide text-[#F2EFE9]">
              {listing.make} {listing.model} {listing.year ?? ''}
            </h1>
            <p className="mt-1 text-2xl font-semibold text-[#E2662D]">
              {formatPrice(listing.price)}
            </p>
          </div>
          {!isOwner && <FavoriteButton listingId={listing.id} initialFavorited={favorited} />}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-[#2B3339] py-4 text-sm sm:grid-cols-4">
          <Spec label="Mileage" value={listing.mileage ? `${listing.mileage.toLocaleString()} km` : '—'} />
          <Spec label="Transmission" value={listing.transmission ?? '—'} />
          <Spec label="Fuel" value={listing.fuel_type ?? '—'} />
          <Spec label="Condition" value={listing.condition ?? '—'} />
          <Spec label="Body type" value={listing.body_type ?? '—'} />
          <Spec label="Color" value={listing.color ?? '—'} />
          <Spec label="District" value={listing.district ?? '—'} />
          <Spec label="Status" value={listing.status} />
        </dl>

        {listing.description && (
          <p className="mt-6 leading-relaxed text-[#C7CDD1]">{listing.description}</p>
        )}

        {isOwner ? (
          <OwnerControls listingId={listing.id} status={listing.status} />
        ) : (
          <div className="mt-8 border-t border-[#2B3339] pt-6">
            <h2 className="font-condensed text-sm uppercase tracking-[0.15em] text-[#8A9299]">
              Contact seller
            </h2>
            <p className="mt-1 text-sm text-[#C7CDD1]">
              {listing.profiles?.full_name ?? 'Autobook seller'}
              {listing.profiles?.phone ? ` · ${listing.profiles.phone}` : ''}
            </p>
            <div className="mt-4">
              <InquiryForm listingId={listing.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[#8A9299]">{label}</dt>
      <dd className="mt-0.5 text-[#F2EFE9]">{value}</dd>
    </div>
  );
}

// Server component wrapper around the client status-update button.
async function OwnerControls({ listingId, status }: { listingId: string; status: string }) {
  const { OwnerStatusButton } = await import('@/components/marketplace/OwnerStatusButton');
  return (
    <div className="mt-8 border-t border-[#2B3339] pt-6">
      <h2 className="font-condensed text-sm uppercase tracking-[0.15em] text-[#8A9299]">
        This is your listing
      </h2>
      <OwnerStatusButton listingId={listingId} status={status} />
    </div>
  );
}
