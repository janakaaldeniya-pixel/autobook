// components/shared/AuthForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AuthForm({ mode, redirectTo }: { mode: 'login' | 'signup'; redirectTo: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    startTransition(async () => {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) { setError(error.message); return; }
        // If email confirmation is required, there's no session yet.
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setNotice('Check your email to confirm your account, then log in.');
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(error.message); return; }
      }

      router.push(redirectTo);
      router.refresh();
    });
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="space-y-4">
    <button
      type="button"
      onClick={handleGoogle}
      className="flex w-full items-center justify-center gap-3 rounded-sm border border-[#3A4249] bg-[#1B2023] px-4 py-2.5 text-sm font-medium text-[#F2EFE9] hover:border-[#E2662D]"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/>
        <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/>
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
      </svg>
      Continue with Google
    </button>
    <div className="flex items-center gap-3 text-xs text-[#8A9299]">
      <span className="h-px flex-1 bg-[#3A4249]" /> or <span className="h-px flex-1 bg-[#3A4249]" />
    </div>
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <div>
          <label className="mb-1 block text-sm text-[#C7CDD1]">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm text-[#C7CDD1]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[#C7CDD1]">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-sm bg-[#E2662D] px-4 py-2.5 text-sm font-medium text-[#14181A] disabled:opacity-50"
      >
        {isPending ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {notice && <p className="text-sm text-[#8A9299]">{notice}</p>}
    </form>
    </div>
  );
}
