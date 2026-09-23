// app/spare-parts/[id]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { InquiryForm } from '@/components/parts/InquiryForm';
import { FavoriteButton } from '@/components/parts/FavoriteButton';
import { StockControl } from '@/components/parts/StockControl';

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString('en-LK')}`;
}

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: part } = await supabase
    .from('spare_parts')
    .select('*, profiles(full_name, phone)')
    .eq('id', id)
    .single();

  if (!part) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === part.seller_id;

  let favorited = false;
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_type', 'spare_part')
      .eq('item_id', id)
      .maybeSingle();
    favorited = !!fav;
  }

  return (
    <div className="min-h-screen bg-[#14181A]">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/spare-parts" className="text-sm text-[#8A9299] hover:text-[#E2662D]">
          ← All parts
        </Link>

        <div className="mt-4 aspect-square max-h-96 overflow-hidden rounded-sm bg-[#1B2023] sm:aspect-video">
          {part.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={part.images[0]} alt={part.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[#5C646A]">No photos yet</div>
          )}
        </div>

        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-condensed text-3xl uppercase tracking-wide text-[#F2EFE9]">
              {part.name}
            </h1>
            <p className="mt-1 text-[#8A9299]">{part.brand}{part.part_number ? ` · #${part.part_number}` : ''}</p>
            <p className="mt-2 text-2xl font-semibold text-[#E2662D]">{formatPrice(part.price)}</p>
          </div>
          {!isOwner && <FavoriteButton partId={part.id} initialFavorited={favorited} />}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-[#2B3339] py-4 text-sm sm:grid-cols-4">
          <Spec label="Condition" value={part.condition} />
          <Spec label="In stock" value={String(part.stock_qty)} />
          <Spec label="District" value={part.district ?? '—'} />
          <Spec label="Listed" value={new Date(part.created_at).toLocaleDateString('en-LK')} />
        </dl>

        {part.compatible_makes?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-condensed text-sm uppercase tracking-[0.15em] text-[#8A9299]">
              Fits
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {part.compatible_makes.map((m: string) => (
                <span key={m} className="rounded-sm border border-[#3A4249] px-2 py-0.5 text-xs text-[#C7CDD1]">{m}</span>
              ))}
              {part.compatible_models?.map((m: string) => (
                <span key={m} className="rounded-sm border border-[#3A4249] px-2 py-0.5 text-xs text-[#8A9299]">{m}</span>
              ))}
            </div>
          </div>
        )}

        {part.description && (
          <p className="mt-6 leading-relaxed text-[#C7CDD1]">{part.description}</p>
        )}

        {isOwner ? (
          <div className="mt-8 border-t border-[#2B3339] pt-6">
            <h2 className="font-condensed text-sm uppercase tracking-[0.15em] text-[#8A9299]">
              This is your listing
            </h2>
            <div className="mt-3">
              <StockControl partId={part.id} initialStock={part.stock_qty} />
            </div>
          </div>
        ) : (
          <div className="mt-8 border-t border-[#2B3339] pt-6">
            <h2 className="font-condensed text-sm uppercase tracking-[0.15em] text-[#8A9299]">
              Contact seller
            </h2>
            <p className="mt-1 text-sm text-[#C7CDD1]">
              {part.profiles?.full_name ?? 'Autobook seller'}
              {part.profiles?.phone ? ` · ${part.profiles.phone}` : ''}
            </p>
            <div className="mt-4">
              <InquiryForm partId={part.id} />
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
