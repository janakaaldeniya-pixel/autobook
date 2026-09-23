// components/parts/PartCard.tsx
import Link from 'next/link';
import { SparePart } from '@/lib/parts-types';
import { FavoriteButton } from './FavoriteButton';

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString('en-LK')}`;
}

export function PartCard({
  part,
  favorited = false,
}: {
  part: SparePart;
  favorited?: boolean;
}) {
  return (
    <Link
      href={`/spare-parts/${part.id}`}
      className="group block overflow-hidden rounded-sm border border-[#2B3339] bg-[#1B2023]"
    >
      <div className="relative aspect-square bg-[#0F1214]">
        {part.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={part.images[0]} alt={part.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#5C646A]">
            No photo yet
          </div>
        )}
        <div className="absolute right-2 top-2">
          <FavoriteButton partId={part.id} initialFavorited={favorited} />
        </div>
        {part.stock_qty === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#14181A]/70">
            <span className="font-condensed rotate-[-8deg] border-2 border-[#E2662D] px-3 py-1 text-sm uppercase tracking-widest text-[#E2662D]">
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="font-condensed truncate text-base uppercase leading-tight text-[#F2EFE9] group-hover:text-[#E2662D]">
          {part.name}
        </p>
        <p className="mt-0.5 text-sm text-[#8A9299]">{part.brand}</p>
        <p className="mt-1 text-base font-semibold text-[#E2662D]">
          {formatPrice(part.price)}
        </p>
        <p className="mt-1 text-xs text-[#8A9299]">
          {part.condition} · {part.district}
        </p>
      </div>
    </Link>
  );
}
