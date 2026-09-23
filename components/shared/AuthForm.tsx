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

  return (
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
  );
}
