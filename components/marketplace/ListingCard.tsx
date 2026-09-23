// components/marketplace/ListingCard.tsx
import Link from 'next/link';
import { VehicleListing } from '@/lib/marketplace-types';
import { FavoriteButton } from './FavoriteButton';

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString('en-LK')}`;
}

export function ListingCard({
  listing,
  favorited = false,
}: {
  listing: VehicleListing;
  favorited?: boolean;
}) {
  return (
    <Link
      href={`/buy-sell/${listing.id}`}
      className="group block overflow-hidden rounded-sm border border-[#2B3339] bg-[#1B2023]"
    >
      <div className="relative aspect-[4/3] bg-[#0F1214]">
        {listing.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.images[0]}
            alt={`${listing.make} ${listing.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#5C646A]">
            No photo yet
          </div>
        )}
        <div className="absolute right-2 top-2">
          <FavoriteButton listingId={listing.id} initialFavorited={favorited} />
        </div>
        {listing.status === 'sold' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#14181A]/70">
            <span className="font-condensed rotate-[-8deg] border-2 border-[#E2662D] px-3 py-1 text-lg uppercase tracking-widest text-[#E2662D]">
              Sold
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="font-condensed text-lg uppercase leading-tight text-[#F2EFE9] group-hover:text-[#E2662D]">
          {listing.make} {listing.model} {listing.year ? `'${String(listing.year).slice(2)}` : ''}
        </p>
        <p className="mt-0.5 text-lg font-semibold text-[#E2662D]">
          {formatPrice(listing.price)}
        </p>
        <p className="mt-1 text-xs text-[#8A9299]">
          {listing.mileage ? `${listing.mileage.toLocaleString()} km · ` : ''}
          {listing.transmission}{listing.transmission && listing.district ? ' · ' : ''}{listing.district}
        </p>
      </div>
    </Link>
  );
}
