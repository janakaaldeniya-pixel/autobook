// app/auto-doctor/page.tsx
import { createClient } from '@/lib/supabase/server';
import { AutoDoctorFlow } from '@/components/autodoctor/AutoDoctorFlow';
import { Symptom } from '@/lib/autodoctor-types';

export default async function AutoDoctorPage() {
  const supabase = await createClient();
  const { data: symptoms, error } = await supabase
    .from('symptoms')
    .select('*')
    .order('category');

  return (
    <div className="min-h-screen bg-[#14181A]">
      <header className="border-b border-[#2B3339] px-6 py-8">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-4xl uppercase tracking-wide text-[#F2EFE9]">
          Auto Doctor
        </h1>
        <p className="mt-2 max-w-xl text-[#8A9299]">
          Tell us what your vehicle is doing. We&apos;ll narrow down what&apos;s
          likely wrong and what to do next.
        </p>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {error && <p className="text-red-400">Couldn&apos;t load symptoms: {error.message}</p>}
        {!error && (symptoms?.length ?? 0) === 0 && (
          <p className="text-[#8A9299]">
            No symptoms configured yet — run <code>auto_doctor_setup.sql</code> in
            the Supabase SQL editor to seed the starter set.
          </p>
        )}
        {symptoms && symptoms.length > 0 && (
          <AutoDoctorFlow symptoms={symptoms as Symptom[]} />
        )}
      </div>
    </div>
  );
}
