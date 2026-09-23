// components/shared/Navbar.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const LINKS = [
  { href: '/my-service', label: 'My Service' },
  { href: '/knowledge-hub', label: 'Knowledge Hub' },
  { href: '/auto-doctor', label: 'Auto Doctor' },
  { href: '/spare-parts', label: 'Spare Parts' },
  { href: '/buy-sell', label: 'Buy & Sell' },
  { href: '/garages', label: 'Garages' },
];

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-20 border-b border-[#2B3339] bg-[#14181A]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="font-condensed text-lg uppercase tracking-wide text-[#F2EFE9]">
          Auto<span className="text-[#E2662D]">book</span>
        </Link>

        <div className="hidden gap-5 overflow-x-auto md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap text-sm text-[#C7CDD1] hover:text-[#E2662D]"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {user ? (
          <Link
            href="/my-service"
            className="rounded-sm border border-[#3A4249] px-3 py-1.5 text-sm text-[#C7CDD1]"
          >
            Account
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-sm bg-[#E2662D] px-3 py-1.5 text-sm font-medium text-[#14181A]"
          >
            Log in
          </Link>
        )}
      </div>

      {/* Mobile link row */}
      <div className="flex gap-4 overflow-x-auto border-t border-[#2B3339] px-6 py-2 md:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap text-xs text-[#8A9299] hover:text-[#E2662D]"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
