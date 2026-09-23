// app/page.tsx
import Link from 'next/link';

const SECTIONS = [
  { href: '/my-service', title: 'My Service', desc: 'Your vehicles, service history, and reminders.' },
  { href: '/knowledge-hub', title: 'Knowledge Hub', desc: 'Maintenance tips, buying guides, repair how-tos.' },
  { href: '/auto-doctor', title: 'Auto Doctor', desc: 'Describe the symptoms, get a likely diagnosis.' },
  { href: '/spare-parts', title: 'Spare Parts Finder', desc: 'Buy and sell new, used, and refurbished parts.' },
  { href: '/buy-sell', title: 'Buy & Sell', desc: 'Vehicles for sale, direct from the seller.' },
  { href: '/garages', title: 'Garages & Service Stations', desc: 'Find a trusted garage anywhere in Sri Lanka.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#14181A]">
      <header className="border-b border-[#2B3339] px-6 py-14 text-center">
        <p className="font-condensed text-sm uppercase tracking-[0.2em] text-[#E2662D]">
          Sri Lanka&apos;s Automobile Platform
        </p>
        <h1 className="font-condensed mt-2 text-5xl uppercase tracking-wide text-[#F2EFE9]">
          Autobook
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[#8A9299]">
          Everything for your vehicle — service, parts, diagnostics, and the
          right garage — in one place.
        </p>
      </header>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 py-12 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block rounded-sm border border-[#2B3339] bg-[#1B2023] p-5 hover:border-[#E2662D]"
          >
            <h2 className="font-condensed text-xl uppercase text-[#F2EFE9]">{s.title}</h2>
            <p className="mt-1 text-sm text-[#8A9299]">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
