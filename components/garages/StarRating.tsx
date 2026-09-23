// components/garages/StarRating.tsx
export function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={`h-4 w-4 ${i <= full ? 'fill-[#D9A404]' : 'fill-[#3A4249]'}`}
          >
            <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-[#8A9299]">
        {count > 0 ? `${rating.toFixed(1)} (${count})` : 'No reviews yet'}
      </span>
    </div>
  );
}
