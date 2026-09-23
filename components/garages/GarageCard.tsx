// components/garages/GarageCard.tsx
import Link from 'next/link';
import { Garage } from '@/lib/types';
import { StarRating } from './StarRating';

export function GarageCard({ garage }: { garage: Garage }) {
  return (
    <Link
      href={`/garages/${garage.id}`}
      className="group block border-b border-[#2B3339] py-5 first:pt-0"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-condensed text-xl uppercase tracking-wide text-[#F2EFE9] group-hover:text-[#E2662D]">
              {garage.name}
            </h3>
            {garage.is_verified && (
              <span className="rounded-sm bg-[#1F7A5C]/20 px-1.5 py-0.5 text-[11px] font-medium text-[#3EC08A]">
                Verified
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[#8A9299]">
            {garage.city ? `${garage.city}, ` : ''}
            {garage.district}
          </p>
          {garage.services_offered?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {garage.services_offered.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="rounded-sm border border-[#3A4249] px-2 py-0.5 text-xs text-[#C7CDD1]"
                >
                  {s}
                </span>
              ))}
              {garage.services_offered.length > 4 && (
                <span className="text-xs text-[#8A9299]">
                  +{garage.services_offered.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
        <StarRating rating={garage.rating_avg} count={garage.rating_count} />
      </div>
    </Link>
  );
}
