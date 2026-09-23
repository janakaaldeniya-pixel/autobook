// app/login/page.tsx
import Link from 'next/link';
import { AuthForm } from '@/components/shared/AuthForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTo = redirect || '/my-service';

  return (
    <div className="min-h-screen bg-[#14181A]">
      <div className="mx-auto max-w-sm px-6 py-16">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-3xl uppercase tracking-wide text-[#F2EFE9]">
          Log in
        </h1>
        <p className="mt-2 text-sm text-[#8A9299]">
          One account for every section — service, parts, listings, and more.
        </p>

        <div className="mt-8">
          <AuthForm mode="login" redirectTo={redirectTo} />
        </div>

        <p className="mt-6 text-sm text-[#8A9299]">
          Don&apos;t have an account?{' '}
          <Link
            href={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="text-[#E2662D] underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
